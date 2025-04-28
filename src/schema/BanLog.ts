import { relations } from "drizzle-orm";
import { date, int, mysqlTable, text } from "drizzle-orm/mysql-core";
import { Users } from "./Users";

export const BanLog = mysqlTable("BanLog", {
    userId: int("userId")
        .primaryKey()
        .references(() => Users.userId),
    reason: text("reason"),
    bannedUntil: date("bannedUntil")
});

export const BanLogRelation = relations(BanLog, ({ one }) => ({
    user: one(Users, {
        fields: [BanLog.userId],
        references: [Users.userId]
    })
}));
