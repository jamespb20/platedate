import express, { Request, Response } from "express";
import { db } from "../database";
import { ReportedProfile } from "../schema/ReportedProfile";
import { UserProfile } from "../schema/UserProfile";
import { eq } from "drizzle-orm";

const router = express.Router();

router.post("/", async (req: Request, res: Response) => {
    const { userProfileId, reportMessage } = req.body;
    const userId = req.session.userId;

    if (!userId || !userProfileId || !reportMessage)
        return res.status(400).send("Invalid parameters");
    if (req.session.userData?.userProfileId === userProfileId)
        return res.status(400).send("You cannot report yourself");
    const existingUser = await db.query.UserProfile.findFirst({
        where: eq(UserProfile.userProfileId, userProfileId)
    });
    if (!existingUser) {
        return res.status(404).send("User not found");
    }
    await db.insert(ReportedProfile).values({
        userProfileId,
        reportMessage
    });

    return res.send({ message: "User reported" });
});

export default router;
