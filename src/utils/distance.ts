import { UserProfileType } from "./types";

export function calculateDistance(currentUser: UserProfileType, otherUser: UserProfileType) {
    const radius = 6371;
    const currentLat = currentUser.latitude;
    const currentLong = currentUser.longitude;
    const otherLat = otherUser.latitude;
    const otherLong = otherUser.longitude;

    if (
        typeof currentLat === "number" &&
        typeof currentLong === "number" &&
        typeof otherLat === "number" &&
        typeof otherLong === "number"
    ) {
        const latDistance = (otherLat - currentLat) * (Math.PI / 180);
        const longDistance = (otherLong - currentLong) * (Math.PI / 180);
        const haversine =
            Math.sin(latDistance / 2) * Math.sin(latDistance / 2) +
            Math.cos(currentLat * (Math.PI / 180)) *
                Math.cos(otherLat * (Math.PI / 180)) *
                Math.sin(longDistance / 2) *
                Math.sin(longDistance / 2);
        const angle = 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
        var distance = radius * angle;
        distance = Math.round(distance);
        return distance;
    } else {
        return 0;
    }
}

export function calculateMidpoint(currentUser: UserProfileType, otherUser: UserProfileType) {
    const currentLat = currentUser.latitude;
    const currentLong = currentUser.longitude;
    const otherLat = otherUser.latitude;
    const otherLong = otherUser.longitude;

    if (
        typeof currentLat === "number" &&
        typeof currentLong === "number" &&
        typeof otherLat === "number" &&
        typeof otherLong === "number"
    ) {
        const lat1 = (currentLat * Math.PI) / 180;
        const lon1 = (currentLong * Math.PI) / 180;
        const lat2 = (otherLat * Math.PI) / 180;
        const lon2 = (otherLong * Math.PI) / 180;

        const bx = Math.cos(lat2) * Math.cos(lon2 - lon1);
        const by = Math.cos(lat2) * Math.sin(lon2 - lon1);

        const midLat = Math.atan2(
            Math.sin(lat1) + Math.sin(lat2),
            Math.sqrt((Math.cos(lat1) + bx) * (Math.cos(lat1) + bx) + by * by)
        );
        const midLon = lon1 + Math.atan2(by, Math.cos(lat1) + bx);

        const midpoint = {
            latitude: (midLat * 180) / Math.PI,
            longitude: (midLon * 180) / Math.PI
        };

        return midpoint;
    } else {
        return null;
    }
}
