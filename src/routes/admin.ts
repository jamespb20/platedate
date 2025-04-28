import { and, asc } from "drizzle-orm";
import express, { Request, Response } from "express";
import { db } from "../database";
import { Matches } from "../schema";
import { BanLog } from "../schema/BanLog";
import { Messages } from "../schema/Messages";
import { Preferences } from "../schema/Preferences";
import { UserProfile } from "../schema/UserProfile";
import { Users } from "../schema/Users";
const { eq } = require("drizzle-orm");

const router = express.Router();

router.post("/banuser", async (req: Request, res: Response) => {
    const { userId, reason, bannedUntil } = req.body;
    const [day, month, year] = bannedUntil.split("-");

    if (!req.session.userData!.isAdmin) return res.status(403).send("Unauthorised access");

    if (!userId || !reason || !bannedUntil) return res.status(400).send("Invalid parameters");
    if (isNaN(userId)) return res.status(400).send("Given userId is not a number");

    const parsedDate = new Date(`${year}-${month}-${day}`);

    if (isNaN(parsedDate.getTime())) {
        return res.status(400).send("Invalid date format for bannedUntil parameter");
    }

    await db.update(Users).set({ isBanned: true }).where(eq(Users.userId, userId));
    await db.insert(BanLog).values({ userId: userId, reason: reason, bannedUntil: parsedDate });

    res.send({ Message: "User " + userId + " is banned" });
});

router.get("/reportedmessages", async (req: Request, res: Response) => {
    if (!req.session.userData!.isAdmin) return res.status(403).send("Unauthorised access");
    try {
        const reportedMessages = await db.query.Messages.findMany({
            columns: {
                messageId: true,
                senderId: true,
                chatId: true,
                content: true,
                createdAt: true,
                isReported: true
            },
            where: eq(Messages.isReported, true),

            with: {
                user: {
                    with: {
                        profile: {}
                    }
                }
            }
        });
        res.send(reportedMessages);
    } catch (error) {
        console.error("Error retrieving reported messages:", error);
        return res.status(500).send("Internal Server Error");
    }
});

router.post("/deletemessage", async (req: Request, res: Response) => {
    if (!req.session.userData!.isAdmin) return res.status(403).send("Unauthorised access");
    const { messageId } = req.body;

    if (!messageId) return res.status(400).send("Invalid parameters");

    try {
        await db.delete(Messages).where(eq(Messages.messageId, messageId));
        res.send({ message: "Deleted message " + messageId });
    } catch (error) {
        console.error("Error deleting message:", error);
        return res.status(500).send("Internal Server Error");
    }
});

router.post("/specificreportedmessages", async (req: Request, res: Response) => {
    console.log("hi form admin");
    if (!req.session.userData!.isAdmin) return res.status(403).send("Unauthorised access");
    const { userId } = req.body;
    console.log("userid:", userId);
    try {
        const getReportedMessages = await db
            .select()
            .from(Messages)
            .where(and(eq(Messages.isReported, true), eq(Messages.senderId, userId)))
            .orderBy(asc(Messages.createdAt));

        console.log("reported:", getReportedMessages);
        res.send(getReportedMessages);
    } catch (error) {
        console.error("Error retrieving reported messages:", error);
        return res.status(500).send("Internal Server Error");
    }
});

router.post("/reportedmessages", async (req: Request, res: Response) => {
    if (!req.session.userData!.isAdmin) return res.status(403).send("Unauthorised access");

    const { messageId } = req.body;

    if (!messageId) return res.status(400).send("Invalid parameters");

    try {
        const reportedMessage = await db.query.Messages.findFirst({
            where: eq(Messages.messageId, messageId)
        });

        if (!reportedMessage) return res.status(404).send("Reported message not found");

        const relatedMessages = await db
            .select()
            .from(Messages)
            .where(eq(Messages.chatId, reportedMessage.chatId));

        const responseData = {
            reportedMessage: reportedMessage,
            relatedMessages: relatedMessages
        };

        res.json(responseData);
    } catch (error) {
        console.error("Error handling reported messages:", error);
        return res.status(500).send("Internal Server Error");
    }
});

router.post("/delete", async (req: Request, res: Response) => {
    console.log("deleting!");
    if (!req.session.userData!.isAdmin) return res.status(403).send("Unauthorised access");
    const { userProfileId } = req.body;

    try {
        const userProfile = await db.query.UserProfile.findFirst({
            where: eq(UserProfile.userProfileId, userProfileId)
        });
        console.log("userprofileid:", userProfileId);
        console.log("profile:", userProfile);

        if (!userProfile) return res.status(404).send("User profile not found");

        await db.delete(Matches).where(eq(Matches.matchedUserId, userProfile.userId));
        await db.delete(Matches).where(eq(Matches.userId, userProfile.userId));
        await db.delete(Preferences).where(eq(Preferences.preferenceId, userProfile.preferenceId));
        await db.delete(UserProfile).where(eq(UserProfile.userProfileId, userProfileId));
        await db.delete(Users).where(eq(Users.userProfileId, userProfile.userId));

        res.json({ message: "Deleted user " + userProfileId });
    } catch (error) {
        console.error("Error deleting user:", error);
        return res.status(500).send("Internal Server Error");
    }
});

router.get("/report", async (_req: Request, res: Response) => {
    const reportedProfiles = await db.query.ReportedProfile.findMany({
        columns: {
            reportId: true,
            reportDate: true,
            userProfileId: true,
            reportMessage: true
        },
        with: {
            profile: {
                with: {
                    user: {
                        with: {
                            messages: true
                        }
                    }
                }
            }
        }
    });

    const users = await db.query.Users.findMany({
        where: and(eq(Users.isBanned, false), eq(Users.isAdmin, false))
    });
    console.log(reportedProfiles);
    const reportedUsers = reportedProfiles.filter(rp =>
        users.some(u => u.userProfileId === rp.userProfileId)
    );
    console.log(reportedUsers);
    res.send(reportedUsers);
});

export default router;
