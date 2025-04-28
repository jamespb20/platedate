import { relations } from "drizzle-orm";
import { float, int, mysqlEnum, mysqlTable, text, varchar } from "drizzle-orm/mysql-core";
import { Preferences } from "./Preferences";
import { Users } from "./Users";
const genderEnum = mysqlEnum("gender", [
    "male",
    "female",
    "transgenderMale",
    "transgenderFemale",
    "nonbinary"
]);
const sexualityEnum = mysqlEnum("sexuality", [
    "heterosexual",
    "homosexual",
    "bisexual",
    "pansexual",
    "bicurious"
]);

export const UserProfile = mysqlTable("UserProfile", {
    userProfileId: int("userProfileId").primaryKey().autoincrement(),
    userId: int("userId"),
    bio: varchar("bio", { length: 500 }),
    firstName: varchar("firstName", { length: 25 }),
    lastName: varchar("lastName", { length: 25 }),
    age: int("age"),
    preferenceId: int("preferenceId").references(() => Preferences.preferenceId, {
        onDelete: "cascade"
    }),
    photoURL: text("photoURL"),
    latitude: float("latitude"),
    longitude: float("longitude"),
    country: text("country"),
    gender: genderEnum,
    sexuality: sexualityEnum
});

export const UserProfileRelations = relations(UserProfile, ({ one }) => ({
    preferences: one(Preferences, {
        fields: [UserProfile.preferenceId],
        references: [Preferences.preferenceId]
    }),
    user: one(Users, {
        fields: [UserProfile.userId],
        references: [Users.userId]
    })
}));
