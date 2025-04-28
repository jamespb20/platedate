import { and, gte, isNotNull, lte, ne, or } from "drizzle-orm";
import express, { Request, Response } from "express";
import { Client } from "minio";
import multer from "multer";
import { db } from "../database";
import { Matches, Preferences, Users } from "../schema";
import { UserProfile } from "../schema/UserProfile";
import { calculateMatches } from "../utils/match";
import { UserPreferences } from "../utils/preferences";
import { UserProfileType, UserWithPreferences } from "../utils/types";
const { eq } = require("drizzle-orm");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const minioClient = new Client({
    endPoint: process.env.MINIO_ENDPOINT!,
    useSSL: true,
    accessKey: process.env.MINIO_ACCESS_KEY!,
    secretKey: process.env.MINIO_SECRET_KEY!
});

const getFileExtension = (filename: string) => {
    const parts = filename.split(".");
    return parts[parts.length - 1];
};

const router = express.Router();

router.get("/", async (req: Request, res: Response) => {
    const userProfileId = req.session.userData?.userProfileId;

    const getUserProfileData = await db.query.UserProfile.findFirst({
        where: eq(userProfileId, UserProfile.userProfileId),
        with: {
            preferences: true
        }
    });
    res.send(getUserProfileData);
});

router.post("/", upload.single("profileImage"), async (req: Request, res: Response) => {
    let userProfileId;

    if (req.query && req.query?.profileId && req.session.userData && req.session.userData.isAdmin) {
        userProfileId = req.query.profileId as string;
    } else {
        userProfileId = req.session.userData?.userProfileId;
    }

    const { firstName, lastName, bio, age, country, latitude, longitude, gender, sexuality } =
        req.body;

    let photoURL = "";
    if (req.file) {
        try {
            const fileName = `${userProfileId}-profileImage.${getFileExtension(
                req.file.originalname
            )}`;
            await minioClient.putObject(process.env.MINIO_BUCKET!, fileName, req.file.buffer);

            photoURL = await minioClient.presignedGetObject(process.env.MINIO_BUCKET!, fileName);
        } catch (err) {
            console.error("Error uploading file to MinIO:", err);
            return res.status(500).send({ error: "Error uploading file to MinIO" });
        }
    }

    const updatedProperties: Partial<UserProfileType> = {
        firstName: firstName,
        lastName: lastName,
        bio: bio,
        age: age,
        country: country,
        latitude: latitude,
        longitude: longitude,
        gender: gender,
        sexuality: sexuality
    };

    if (photoURL.length) {
        updatedProperties.photoURL = photoURL;
    }

    await db
        .update(UserProfile)
        .set(updatedProperties)
        .where(eq(UserProfile.userProfileId, userProfileId));

    res.send({ Message: "User profile updated" });
});

router.post("/search", async (req: Request, res: Response) => {
    const conditionsArray = [];
    const preferencesArray: [keyof UserPreferences, boolean][] = [];
    const protectedKeys = ["preferences", "gender", "age"];

    for (const [key, value] of Object.entries(req.body)) {
        if (!protectedKeys.includes(key) && value !== undefined && key in UserProfile) {
            const column = UserProfile[key as keyof typeof UserProfile];
            if (column !== undefined) {
                conditionsArray.push(eq(column, value));
            }
        } else if (key == "preferences") {
            const prefVal: Record<string, boolean> = value as Record<string, boolean>;
            for (let [k, v] of Object.entries(prefVal)) {
                preferencesArray.push([k as keyof UserPreferences, v as boolean]);
            }
        } else if (key == "gender") {
            const genderObject = value as Record<string, boolean>;
            const conditions = [];

            for (let [gender, res] of Object.entries(genderObject)) {
                if (!res) continue;
                conditions.push(eq(UserProfile.gender, gender));
            }

            conditionsArray.push(or(...conditions));
        } else if (key == "age") {
            const ageRange = value as [number, number];
            conditionsArray.push(
                and(
                    gte(UserProfile.age, ageRange[0] || 18),
                    lte(UserProfile.age, ageRange[1] || 120)
                )
            );
        }
    }

    const getUsers = await db.query.UserProfile.findMany({
        where: and(
            ...conditionsArray,
            isNotNull(UserProfile.firstName),
            isNotNull(UserProfile.lastName)
        ),
        with: {
            preferences: true
        }
    });

    const filteredUsers = getUsers.filter(user => {
        for (const [key, value] of preferencesArray) {
            const userPref: UserPreferences = user.preferences?.preferenceObject as UserPreferences;
            if (userPref && userPref[key] !== value) {
                return false;
            }
        }
        return true;
    });

    return res.json(filteredUsers);
});

router.get("/all", async (req: Request, res: Response) => {
    const userProfileId = req.session.userData?.userProfileId;
    if (!userProfileId) return res.status(401).send({ error: "Invalid User" });

    const getRawDatabaseUsers = await db
        .select()
        .from(Users)
        .leftJoin(UserProfile, eq(Users.userId, UserProfile.userId))
        .leftJoin(Preferences, eq(UserProfile.preferenceId, Preferences.preferenceId))
        .where(
            and(
                isNotNull(UserProfile.firstName),
                isNotNull(UserProfile.lastName),
                isNotNull(UserProfile.age),
                isNotNull(UserProfile.preferenceId),
                eq(Users.isAdmin, false),
                ne(UserProfile.userProfileId, userProfileId)
            )
        );

    const getDatabaseUsers = getRawDatabaseUsers.map(user => {
        return {
            ...user.UserProfile,
            preferences: {
                ...user.Preferences
            }
        };
    });

    const getUserMatches = await db.query.Matches.findMany({
        where: eq(Matches.userId, req.session.userId)
    });

    const getUsersRaw = getDatabaseUsers.filter(user => {
        return !getUserMatches.some(match => match.matchedUserId === user!.userId);
    });

    const loggedInUser = await db.query.UserProfile.findFirst({
        with: {
            preferences: {
                columns: {
                    preferenceObject: true,
                    distancePreference: true,
                    genderPreferenceObject: true
                }
            }
        },
        where: eq(userProfileId, UserProfile.userProfileId)
    });

    const isUserWithPreferences = (user: any): user is UserWithPreferences => {
        return user !== null && user !== undefined && user.preferences !== null;
    };

    if (!isUserWithPreferences(loggedInUser)) {
        return res.status(404).send({ error: "Logged in user profile or preferences not found" });
    }

    let getUsers = getUsersRaw
        .map(user => ({
            ...user,
            preferences: user!.preferences || {
                preferenceObject: {},
                distancePreference: 0,
                genderPreferenceObject: {}
            }
        }))
        .filter(isUserWithPreferences);

    const matches = calculateMatches(loggedInUser, getUsers);

    const finalMatches = getUsers.filter(user => matches.includes(user.userProfileId));
    res.send({ matches: finalMatches });
});

router.post("/update", upload.single("profileImage"), async (req: Request, res: Response) => {
    const userProfileId = req.body.userProfileId;

    if (!req.session.userData!.isAdmin) {
        return res.status(403).send("Unauthorised access");
    } else {
        const { firstName, lastName, bio, age, country, latitude, longitude, gender, sexuality } =
            req.body;
        let photoURL = "";

        if (req.file) {
            try {
                const fileName = `${userProfileId}-profileImage.${getFileExtension(
                    req.file.originalname
                )}`;
                await minioClient.putObject(process.env.MINIO_BUCKET!, fileName, req.file.buffer);

                photoURL = await minioClient.presignedGetObject(
                    process.env.MINIO_BUCKET!,
                    fileName
                );
            } catch (err) {
                console.error("Error uploading file to MinIO:", err);
                return res.status(500).send({ error: "Error uploading file to MinIO" });
            }
        }

        await db
            .update(UserProfile)
            .set({
                firstName: firstName,
                lastName: lastName,
                bio: bio,
                age: age,
                photoURL: photoURL,
                country: country,
                latitude: latitude,
                longitude: longitude,
                gender: gender,
                sexuality: sexuality
            })
            .where(eq(UserProfile.userProfileId, userProfileId));

        res.send({ Message: "User profile updated" });
    }
});

router.post("/userid", async (req: Request, res: Response) => {
    const userProfileId = req.body;

    const getUserProfileData = await db.query.UserProfile.findFirst({
        where: eq(userProfileId, UserProfile.userProfileId),
        columns: {
            userId: true
        }
    });
    res.send(getUserProfileData);
});

router.post("/specific", async (req: Request, res: Response) => {
    const inputUser = req.body;

    const getUserProfileData = await db.query.UserProfile.findMany({
        where: eq(UserProfile.userProfileId, inputUser)
    });
    res.send(getUserProfileData);
});

export default router;
