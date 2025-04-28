export function calculateDistance(currentUser, otherUser) {
    const radius = 6371;
    if (
        currentUser === null ||
        otherUser === null ||
        currentUser.latitude === null ||
        currentUser.longitude === null ||
        otherUser.latitude === null ||
        otherUser.longitude === null
    ) {
        return "N/A";
    } else {
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
}
