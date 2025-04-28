import { calculateMidpoint } from "./distance";
import { compareFoodPreferences } from "./match";
import { UserWithPreferences } from "./types";
const apiKey = process.env.MAPS_API_KEY;
const radius = 12500; //km
const minRating = 3.5;

interface Restaurant {
    name: string;
    rating: number;
    vicinity: string;
}

export async function recommendRestaurant(
    currentUser: UserWithPreferences,
    otherUser: UserWithPreferences
) {
    const midpoint = calculateMidpoint(currentUser, otherUser);
    let latitude = midpoint!.latitude;
    let longitude = midpoint!.longitude;

    const cuisineSelector = compareFoodPreferences(currentUser, otherUser);
    if (cuisineSelector == null) {
        return null;
    }
    let topRestaurant;
    let index = 0;

    const otherTries = [
        {
            longitude: otherUser.longitude || 52.6634563,
            latitude: otherUser.latitude || -8.6277028
        },
        {
            longitude: currentUser.longitude || 52.6634563,
            latitude: currentUser.latitude || -8.6277028
        }
    ];

    while (!topRestaurant && index <= cuisineSelector.length) {
        if (index == cuisineSelector.length) {
            const nextTry = otherTries.shift();
            if (!nextTry) break;

            longitude = nextTry.longitude!;
            latitude = nextTry.latitude!;
            index = 0;
        }

        const foodType = cuisineSelector[index].split("_")[1];
        const apiUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=restaurant&keyword=${foodType}&minrating=${minRating}&key=${apiKey}`;
        const data: any = await fetch(apiUrl).then(response => response.json());

        const sortedResults = data.results.sort(
            (a: Restaurant, b: Restaurant) => b.rating - a.rating
        );
        topRestaurant = sortedResults[0];
        index++;
    }

    if (!topRestaurant) return null;

    const { name, price_level, rating, vicinity } = topRestaurant;

    return { name, price_level, rating, vicinity };
}
