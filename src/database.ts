import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema/index";
const poolConnection = mysql.createPool(process.env.DATABASE_URL!);

export const db = drizzle(poolConnection, { schema: schema, mode: "default" });
