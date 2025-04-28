import express, { Request, Response } from "express";
import { db } from "../database";
import { Preferences } from "../schema/Preferences";
import { UserProfile } from "../schema/UserProfile";
const { eq } = require("drizzle-orm");

const router = express.Router();

router.post("/", async (req: Request, res: Response) => {
    const inputPreferences = req.body;

    const userProfileId = req.session.userData?.userProfileId;
    const userProfile = await db.query.UserProfile.findFirst({
        where: eq(UserProfile.userProfileId, userProfileId)
    });

    await db
        .update(Preferences)
        .set({ preferenceObject: inputPreferences })
        .where(eq(userProfile?.preferenceId, Preferences.preferenceId));

    res.send({ Message: "Preferences updated" });
});

router.get("/", async (req: Request, res: Response) => {
    const userProfileId = req.session.userData?.userProfileId;
    const userProfile = await db.query.UserProfile.findFirst({
        where: eq(UserProfile.userProfileId, userProfileId),
        with: {
            preferences: true
        }
    });

    res.send({ preferences: userProfile?.preferences?.preferenceObject });
});

router.get("/distance", async (req: Request, res: Response) => {
    const userProfileId = req.session.userData?.userProfileId;
    const userProfile = await db.query.UserProfile.findFirst({
        where: eq(UserProfile.userProfileId, userProfileId),
        with: {
            preferences: true
        }
    });

    res.send({ distance: userProfile?.preferences?.distancePreference });
});

router.post("/distance", async (req: Request, res: Response) => {
    const distance = req.body.distance;
    const userProfileId = req.session.userData?.userProfileId;
    const userProfile = await db.query.UserProfile.findFirst({
        where: eq(UserProfile.userProfileId, userProfileId)
    });

    await db
        .update(Preferences)
        .set({ distancePreference: distance })
        .where(eq(userProfile?.preferenceId, Preferences.preferenceId));

    res.send({ Message: "Distance preference updated" });
});

router.post("/gender", async (req: Request, res: Response) => {
    const inputPreferences = req.body;

    const userProfileId = req.session.userData?.userProfileId;
    const userProfile = await db.query.UserProfile.findFirst({
        where: eq(UserProfile.userProfileId, userProfileId)
    });

    await db
        .update(Preferences)
        .set({ genderPreferenceObject: inputPreferences })
        .where(eq(userProfile?.preferenceId, Preferences.preferenceId));

    res.send({ Message: "Gender preferences updated" });
});

router.get("/gender", async (req: Request, res: Response) => {
    const userProfileId = req.session.userData?.userProfileId;
    const userProfile = await db.query.UserProfile.findFirst({
        where: eq(UserProfile.userProfileId, userProfileId)
    });
    const preferences = await db.query.Preferences.findFirst({
        where: eq(Preferences.preferenceId, userProfile?.preferenceId)
    });

    res.send({ preferences: preferences?.genderPreferenceObject });
});

export default router;
