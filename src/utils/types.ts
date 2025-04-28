type Gender = "male" | "female" | "transgenderMale" | "transgenderFemale" | "nonbinary";
type Sexuality = "heterosexual" | "homosexual" | "bisexual" | "pansexual" | "bicurious";

export interface UserProfileType {
    userId: number | null;
    userProfileId: number;
    bio: string | null;
    firstName: string | null;
    lastName: string | null;
    age: number | null;
    preferenceId: number | null;
    photoURL: string | null;
    latitude: number | null;
    longitude: number | null;
    country: string | null;
    gender: Gender | null;
    sexuality: Sexuality | null;
}

export type UserWithPreferences = UserProfileType & {
    preferences: {
        preferenceObject: any;
        distancePreference: number;
        genderPreferenceObject: any;
    };
};
