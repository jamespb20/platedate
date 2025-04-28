const dotenv = require("dotenv");
dotenv.config();

export default {
    out: "./src/drizzle",
    schema: "./src/schema/index.ts",
    breakpoints: true,
    driver: "mysql2",
    dbCredentials: {
        uri: process.env.DATABASE_URL
    }
};
