import { asc, or } from "drizzle-orm";
import express, { Request, Response } from "express";
import { db } from "../database";
import { Chats, Messages, Users } from "../schema";
import { recommendRestaurant } from "../utils/recommendation";
import { UserWithPreferences } from "../utils/types";
const { eq } = require("drizzle-orm");
const router = express.Router();

router.get("/query", async (req: Request, res: Response) => {
    const chatId = req.query.chatId;
    const userId = req.session.userId;
    const conditions = chatId ? eq(Chats.chatId, chatId) : undefined;

    const chats = await db.query.Chats.findMany({
        where: conditions,
        with: {
            participants: {
                columns: {
                    chatId: true,
                    userId: true
                },
                with: {
                    user: {
                        columns: {
                            userId: true
                        },
                        with: {
                            profile: true
                        }
                    }
                }
            },
            messages: {
                orderBy: [asc(Messages.createdAt)]
            }
        }
    });

    if (req.session.userData?.isAdmin) {
        return res.send({ chats });
    } else {
        const filteredChats = [];

        for (let chat of chats) {
            if (chat.participants.length !== 2) continue;
            if (!chat.participants.some(participant => participant.userId === parseInt(userId!)))
                continue;

            chat.participants = chat.participants.filter(
                participant => participant.userId !== parseInt(userId!)
            );
            filteredChats.push(chat);
        }
        return res.send({ chats: filteredChats, userId });
    }
});

router.post("/message", async (req: Request, res: Response) => {
    const { chatId, message, isDate, dateData } = req.body;
    const userId = req.session.userId;

    if (!chatId || !message || (!isDate && message.length > 150))
        return res.status(400).send("Invalid parameters");

    const msg = await db.insert(Messages).values({
        chatId: chatId,
        content: message,
        senderId: parseInt(userId!),
        isDate: isDate || false,
        dateLocation: dateData || null
    });

    res.send({
        success: true,
        message: msg
    });
});

router.post("/report", async (req: Request, res: Response) => {
    const { messageId } = req.body;

    if (!messageId) return res.status(400).send("Invalid parameters");

    const [message] = await db.query.Messages.findMany({
        with: {
            chat: {
                with: {
                    participants: true
                }
            }
        }
    });

    if (!message) return res.status(400).send("Invalid parameters");

    await db
        .update(Messages)
        .set({
            isReported: true
        })
        .where(eq(Messages.messageId, messageId));

    res.send({
        success: true
    });
});

router.get("/recommend", async (req: Request, res: Response) => {
    const userId = req.session.userId;
    const otherUser = req.query.userId;

    const users = await db.query.Users.findMany({
        where: or(eq(Users.userId, userId), eq(Users.userId, otherUser)),
        with: {
            profile: {
                with: {
                    preferences: true
                }
            }
        }
    });

    const userProfiles = users.map(user => user.profile);

    const isUserWithPreferences = (user: any): user is UserWithPreferences => {
        return user !== null && user !== undefined && user.preferences !== null;
    };

    if (!isUserWithPreferences(userProfiles[0]) || !isUserWithPreferences(userProfiles[1])) {
        return res.status(404).send({ error: "Logged in user profile or preferences not found" });
    }

    let getUsers = userProfiles
        .map(user => ({
            ...user,
            preferences: user!.preferences || {
                preferenceObject: {},
                distancePreference: 0,
                genderPreferenceObject: {}
            }
        }))
        .filter(isUserWithPreferences);

    const data = await recommendRestaurant(getUsers[0], getUsers[1]);
    res.send(data || { error: "No restaurant found" });
});

export default router;
