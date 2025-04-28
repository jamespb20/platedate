import { relations, sql } from "drizzle-orm";
import { boolean, datetime, int, json, mysqlTable, text } from "drizzle-orm/mysql-core";
import { Chats } from "./Chats";
import { Users } from "./Users";

export const Messages = mysqlTable("Messages", {
    messageId: int("messageId").primaryKey().autoincrement(),
    senderId: int("senderId").references(() => Users.userId, { onDelete: "cascade" }),
    chatId: int("chatId").references(() => Chats.chatId, { onDelete: "cascade" }),
    isDate: boolean("isDate"),
    dateLocation: json("dateLocation"),
    content: text("content"),
    createdAt: datetime("createdAt").default(sql`CURRENT_TIMESTAMP`),
    isReported: boolean("isReported")
});

export const MessagesRelations = relations(Messages, ({ one }) => ({
    user: one(Users, {
        fields: [Messages.senderId],
        references: [Users.userId]
    }),
    chat: one(Chats, {
        fields: [Messages.chatId],
        references: [Chats.chatId]
    })
}));
