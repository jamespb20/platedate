import { relations, sql } from "drizzle-orm";
import { int, mysqlTable, text, timestamp } from "drizzle-orm/mysql-core";
import { UserProfile } from "./UserProfile";

export const ReportedProfile = mysqlTable("ReportedUsers", {
    reportId: int("reportedProfileId").primaryKey().autoincrement(),
    userProfileId: int("userProfileId"),
    reportMessage: text("reportMessage"),
    reportDate: timestamp("reportDate", { mode: "string" })
        .notNull()
        .default(sql`now()`)
});

export const ReportedProfileRelation = relations(ReportedProfile, ({ one }) => ({
    profile: one(UserProfile, {
        fields: [ReportedProfile.userProfileId],
        references: [UserProfile.userProfileId]
    })
}));
