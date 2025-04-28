import { boolean, int, mysqlTable } from "drizzle-orm/mysql-core";
import { Users } from "./Users";

export const Matches = mysqlTable("Matches", {
    matchId: int("matchId").primaryKey().autoincrement(),
    userId: int("userId").references(() => Users.userId),
    matchedUserId: int("matchedUserId").references(() => Users.userId),
    result: boolean("result")
});
