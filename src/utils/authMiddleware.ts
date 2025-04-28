import { eq } from "drizzle-orm";
import { NextFunction, Request, type Response } from "express";
import { db } from "../database";
import { Users } from "../schema/Users";

export default async function authMiddleware(req: Request, res: Response, next: NextFunction) {
    if (!req.session.userId) {
        res.status(401).send("User not logged in");
    } else {
        const getUserProfileData = await db.query.Users.findFirst({
            where: eq(Users.userId, parseInt(req.session.userId)),
            with: {
                profile: {
                    columns: {
                        userProfileId: true,
                        firstName: true,
                        preferenceId: true
                    }
                }
            }
        });

        if (!getUserProfileData) return res.status(401).send("User not found");

        req.session.userData = getUserProfileData;

        next();
    }
}
