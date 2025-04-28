import { relations } from "drizzle-orm";
import { int, mysqlTable } from "drizzle-orm/mysql-core";
import { Chats } from "./Chats";
import { Users } from "./Users";

export const Participants = mysqlTable("Participants", {
    participantId: int("participantId").primaryKey().autoincrement(),
    chatId: int("chatId").references(() => Chats.chatId, { onDelete: "cascade" }),
    userId: int("userId").references(() => Users.userId, { onDelete: "cascade" })
});

export const ParticipantsRelations = relations(Participants, ({ one }) => ({
    chat: one(Chats, {
        fields: [Participants.chatId],
        references: [Chats.chatId]
    }),
    user: one(Users, {
        fields: [Participants.userId],
        references: [Users.userId]
    })
}));
