const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);

const options = {
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASS,
    database: process.env.DATABASE_DB
};

module.exports = new MySQLStore(options);
