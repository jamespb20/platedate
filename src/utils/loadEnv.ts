const path = require("path");
const pathToEnv = path.resolve(__dirname, "../../.env");
const dotenv = require("dotenv");
dotenv.config({ path: pathToEnv });
