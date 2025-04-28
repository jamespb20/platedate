import { relations } from "drizzle-orm";
import { boolean, int, mysqlTable, text, uniqueIndex, varchar } from "drizzle-orm/mysql-core";
import { BanLog } from "./BanLog";
import { UserProfile } from "./UserProfile";
import { Messages } from "./Messages";

export const Users = mysqlTable(
    "Users",
    {
        userId: int("userId").primaryKey().autoincrement(),
        userProfileId: int("userProfileId").references(() => UserProfile.userProfileId, {
            onDelete: "cascade"
        }),
        email: varchar("email", { length: 320 }).notNull(),
        password: text("password").notNull(),
        isAdmin: boolean("isAdmin").default(false).notNull(),
        isBanned: boolean("isBanned").default(false).notNull()
    },
    Users => ({
        emailIndex: uniqueIndex("email_idx").on(Users.email)
    })
);

export const UserRelation = relations(Users, ({ one, many }) => ({
    bans: one(BanLog, {
        fields: [Users.userId],
        references: [BanLog.userId]
    }),
    profile: one(UserProfile, {
        fields: [Users.userProfileId],
        references: [UserProfile.userProfileId]
    }),
    messages: many(Messages)
}));
