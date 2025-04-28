import { db } from "../database";
import { Chats, Participants } from "../schema";
import { calculateDistance } from "./distance";
import { UserWithPreferences } from "./types";

function matchScore(currentUser: UserWithPreferences, otherUser: UserWithPreferences) {
    let score = 0;

    const distance = calculateDistance(currentUser, otherUser);
    if (
        distance > currentUser.preferences.distancePreference ||
        distance > otherUser.preferences.distancePreference ||
        distance == null ||
        currentUser.preferences.distancePreference == null ||
        otherUser.preferences.distancePreference == null
    ) {
        return 0;
    }
    const currentUserSexuality = Object.keys(currentUser.preferences.genderPreferenceObject).filter(
        preference => currentUser.preferences.genderPreferenceObject[preference]
    );
    const otherUserSexuality = Object.keys(otherUser.preferences.genderPreferenceObject).filter(
        preference => otherUser.preferences.genderPreferenceObject[preference]
    );

    if (
        !currentUserSexuality.includes(otherUser.gender!) ||
        !otherUserSexuality.includes(currentUser.gender!)
    ) {
        return 0;
    }
    if (
        currentUser.preferences.preferenceObject == null ||
        otherUser.preferences.preferenceObject == null
    ) {
        return 0;
    }

    Object.entries(currentUser.preferences.preferenceObject).forEach(([preference, value]) => {
        if (value && otherUser.preferences.preferenceObject[preference]) {
            if (preference.startsWith("hobby_") || preference.startsWith("interest_")) {
                score += 2;
            } else if (preference.startsWith("dietary_") || preference.startsWith("food_")) {
                score += 6;
            } else if (preference.startsWith("location_")) {
                score += 4;
            }
        }
    });

    return score;
}

export function calculateMatches(
    currentUser: UserWithPreferences,
    otherUsers: UserWithPreferences[]
): number[] {
    const matches: { userId: number; score: number }[] = [];

    for (let user of otherUsers) {
        const score = matchScore(currentUser, user);
        if (score > 10) {
            matches.push({ userId: user.userProfileId as number, score });
        }
    }
    matches.sort((a, b) => b.score - a.score);
    return matches.map(match => match.userId);
}

export async function createChat(userId: number, matchedUserId: number) {
    const [createChat] = await db.insert(Chats).values({});

    const chatId = createChat.insertId;

    await db.insert(Participants).values({
        chatId,
        userId
    });

    await db.insert(Participants).values({
        chatId,
        userId: matchedUserId
    });

    return true;
}

export function compareFoodPreferences(
    currentUser: UserWithPreferences,
    otherUser: UserWithPreferences
) {
    const preferences: string[] = [];
    if (
        currentUser.preferences.preferenceObject == null ||
        otherUser.preferences.preferenceObject == null
    ) {
        return [];
    }
    Object.entries(currentUser.preferences.preferenceObject).forEach(([preference, value]) => {
        if (value && otherUser.preferences.preferenceObject[preference]) {
            if (preference.startsWith("dietary_") || preference.startsWith("food_")) {
                preferences.push(preference);
            }
        }
    });
    if (preferences.length == 0) {
        return null;
    }
    return preferences;
}
