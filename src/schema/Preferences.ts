import { relations } from "drizzle-orm";
import { int, json, mysqlTable } from "drizzle-orm/mysql-core";
import { UserProfile } from "./UserProfile";

export const Preferences = mysqlTable("Preferences", {
    preferenceId: int("preferenceId").primaryKey().autoincrement(),
    preferenceObject: json("preferenceObject").default(undefined),

    distancePreference: int("distancePreference").default(100).notNull(), //in km

    genderPreferenceObject: json("genderPreferenceObject").default(undefined)
});

export const PreferencesRelation = relations(Preferences, ({ one }) => ({
    user: one(UserProfile, {
        fields: [Preferences.preferenceId],
        references: [UserProfile.preferenceId]
    })
}));
