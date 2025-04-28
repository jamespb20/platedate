import { and } from "drizzle-orm";
import express, { Request, Response } from "express";
import { db } from "../database";
import { Matches } from "../schema/Matches";
import { createChat } from "../utils/match";
const { eq } = require("drizzle-orm");
const router = express.Router();

router.get("/", async (req: Request, res: Response) => {
    const userId = req.session.userId;

    const userMatches = await db.query.Matches.findMany({
        where: and(eq(Matches.userId, userId), eq(Matches.result, true))
    });
    const otherMatches = await db.query.Matches.findMany({
        where: and(eq(Matches.matchedUserId, userId), eq(Matches.result, true))
    });

    let matchedUserIds: number[] = [];

    for (let match of userMatches) {
        if (otherMatches.some(otherMatch => otherMatch.userId === match.matchedUserId)) {
            matchedUserIds.push(match.matchedUserId!);
        }
    }

    res.send(matchedUserIds);
});

router.post("/", async (req: Request, res: Response) => {
    const { matchedUserId, result } = req.body;
    const userId = req.session.userData?.userId;

    if (!userId || !matchedUserId || result === undefined)
        return res.status(400).send("Invalid parameters");

    await db
        .insert(Matches)
        .values({
            userId,
            matchedUserId,
            result
        })
        .onDuplicateKeyUpdate({
            set: {
                result
            }
        });

    const checkOppositeMatch = await db.query.Matches.findFirst({
        where: and(eq(Matches.userId, matchedUserId), eq(Matches.matchedUserId, userId))
    });

    let chatCreated = false;

    if (result && checkOppositeMatch?.result) {
        const getChats = await db.query.Chats.findMany({
            with: {
                participants: true
            }
        });

        const chatExists = getChats.some(chat => {
            const userIds = chat.participants.map(participant => participant.userId);
            return userIds.includes(userId) && userIds.includes(matchedUserId);
        });

        if (chatExists) return;

        await createChat(userId, matchedUserId);
        chatCreated = true;
    }

    return res.send({ message: "Match logged", chatCreated });
});

router.post("/unmatch", async (req: Request, res: Response) => {
    const { matchedUserId } = req.body;
    const userId = req.session.userId;

    if (!userId || !matchedUserId) return res.status(400).send("Invalid parameters");

    await db
        .update(Matches)
        .set({ result: false })
        .where(and(eq(Matches.userId, userId), eq(Matches.matchedUserId, matchedUserId)));

    res.send({ message: "Match removed" });
});

router.get("/unmatched", async (req: Request, res: Response) => {
    const userId = req.session.userId;

    const userMatches = await db.query.Matches.findMany({
        where: and(eq(Matches.userId, userId), eq(Matches.result, false))
    });
    const otherMatches = await db.query.Matches.findMany({
        where: and(eq(Matches.matchedUserId, userId), eq(Matches.result, false))
    });

    const unmatchedUserIds: Set<number> = new Set();

    for (let match of userMatches) {
        unmatchedUserIds.add(match.matchedUserId!);
    }

    for (let match of otherMatches) {
        unmatchedUserIds.add(match.userId!);
    }

    res.send(Array.from(unmatchedUserIds));
});

export default router;
