import bcrypt from "bcrypt";
import emailValidator from "email-validator";
import express, { Request, Response } from "express";
import { db } from "../database";
import { BanLog, Preferences, UserProfile } from "../schema";
import { Users } from "../schema/Users";
import authMiddleware from "../utils/authMiddleware";
const { eq } = require("drizzle-orm");
const saltRounds = 10;

const router = express.Router();
router.post("/login", async (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (!emailValidator.validate(email))
        return res.status(400).send({ error: "Invalid email format" });

    const [user] = await db
        .select({ id: Users.userId, password: Users.password, isBanned: Users.isBanned })
        .from(Users)
        .where(eq(Users.email, email));

    if (!user) return res.status(401).send({ error: "User not found" });
    const currentDate = new Date();
    if (user.isBanned) {
        const banDetails = await db.query.BanLog.findFirst({
            where: eq(BanLog.userId, user.id)
        });
        if (banDetails?.bannedUntil && banDetails.bannedUntil > currentDate) {
            res.send({ message: "User is banned" });
        } else if (banDetails?.bannedUntil && banDetails.bannedUntil <= currentDate) {
            await db.update(Users).set({ isBanned: false }).where(eq(Users.userId, user.id));
            res.send({ message: "User is unbanned" });
        }
    } else {
        const passwordComparison = await bcrypt.compare(password, user.password!);
        if (!passwordComparison) return res.status(401).send({ error: "Incorrect password" });

        req.session.userId = user.id.toString();

        if (req.session.userData?.isAdmin) {
            res.send({ message: "Login successful, admin" });
        } else {
            res.send({ message: "Login successful" });
        }
    }
});

router.post("/signup", async (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (!emailValidator.validate(email)) {
        return res.status(400).send({ error: "Invalid email format" });
    }

    if (!isValidPassword(password)) {
        return res.status(400).send({
            error: "Invalid password format, password must contain one uppercase letter, one lowercase letter, one number, and one special character and be between 8-50 characters long"
        });
    }

    const existingUser = await db.query.Users.findFirst({
        where: eq(Users.email, email)
    });

    if (existingUser) {
        return res.status(409).send("User already exists");
    }

    const salt = await bcrypt.genSalt(saltRounds);
    const encryptedPassword = await bcrypt.hash(password, salt);

    const [user] = await db.insert(Users).values({ email, password: encryptedPassword });
    const [userProfile] = await db.insert(UserProfile).values({ userId: user.insertId });

    await db
        .update(Users)
        .set({ userProfileId: userProfile.insertId })
        .where(eq(Users.userId, user.insertId));

    const [preference] = await db.insert(Preferences).values({ preferenceId: user.insertId });

    await db
        .update(UserProfile)
        .set({ preferenceId: preference.insertId })
        .where(eq(UserProfile.userId, user.insertId));

    const getUser = await db.query.Users.findFirst({
        where: eq(Users.userId, user.insertId)
    });

    req.session.userId = user.insertId.toString();

    res.status(201).send({ message: getUser });
});

router.get("/signout", authMiddleware, async (req: Request, res: Response) => {
    req.session.destroy(() => {
        res.redirect(req.get("Referer")!);
    });
});

router.get("/", authMiddleware, async (req: Request, res: Response) => {
    let userId = req.session.userId;

    if (req.query && req.query?.userId) {
        userId = req.query.userId as string;
    }

    const user = await db.query.Users.findFirst({
        where: eq(Users.userId, userId),
        columns: {
            email: true,
            userId: true,
            userProfileId: true,
            isAdmin: true,
            isBanned: true
        },
        with: {
            profile: {
                with: {
                    preferences: true
                }
            }
        }
    });
    console.log(user);
    res.send(user);
});

router.get("/logout", authMiddleware, async (req: Request, res: Response) => {
    req.session.destroy(() => {
        res.send({ message: "User logged out" });
    });
});

router.get("/isBanned", authMiddleware, async (req: Request, res: Response) => {
    const user = req.session.userId;
    if (!user) return res.status(401).send({ error: "User not logged in" });

    const getUser = await db.query.Users.findFirst({
        where: eq(Users.userId, user),
        with: {
            bans: true
        }
    });

    return getUser?.bans
        ? res.send({ message: "User is banned" })
        : res.send({ message: "User is not banned" });
});

function isValidPassword(password: string) {
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,50}$/;
    return passwordRegex.test(password);
}

export default router;
