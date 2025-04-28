import "express-session";

declare module "express-session" {
    interface SessionData {
        userId: string;
        userData:
            | {
                  userId: number;
                  userProfileId: number | null;
                  email: string;
                  isAdmin: boolean;
                  isBanned: boolean;
                  profile: {
                      userProfileId: number;
                      firstName: string | null;
                      preferenceId: number | null;
                  } | null;
              }
            | undefined;
    }
}

export {};
