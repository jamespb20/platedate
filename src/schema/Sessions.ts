import { int, mediumtext, mysqlTable, varchar } from "drizzle-orm/mysql-core";

export const Sessions = mysqlTable("sessions", {
    session_id: varchar("session_id", { length: 128 }).primaryKey(),
    expires: int("expires", { unsigned: true }),
    data: mediumtext("data")
});
