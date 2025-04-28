import { relations, sql } from "drizzle-orm";
import { datetime, int, mysqlTable } from "drizzle-orm/mysql-core";
import { Messages } from "./Messages";
import { Participants } from "./Participants";

export const Chats = mysqlTable("Chats", {
    chatId: int("chatId").primaryKey().autoincrement(),
    createdAt: datetime("createdAt").default(sql`CURRENT_TIMESTAMP`)
});

export const ChatRelations = relations(Chats, ({ many }) => ({
    messages: many(Messages),
    participants: many(Participants)
}));
