import React, { useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import "./Form.css";

const defaultState = {
    hobby_Reading: false,
    hobby_Writing: false,
    hobby_Art: false,
    hobby_Music: false,
    hobby_Sports: false,
    hobby_Gaming: false,
    hobby_Cooking: false,
    hobby_Photography: false,
    hobby_Hiking: false,
    hobby_Cycling: false,
    hobby_Yoga: false,
    hobby_Dancing: false,
    hobby_Crafting: false,
    hobby_Gardening: false,
    hobby_Fishing: false,
    hobby_Gym: false,
    interest_Travelling: false,
    interest_History: false,
    interest_Movies: false,
    interest_Theater: false,
    interest_Science: false,
    interest_Pets: false,
    interest_Volunteering: false,
    interest_Nature: false,
    interest_Fitness: false,
    dietary_Vegan: false,
    dietary_Vegetarian: false,
    dietary_GlutenFree: false,
    food_Markets: false,
    food_Asian: false,
    food_Italian: false,
    food_Indian: false,
    food_Mexican: false,
    food_Seafood: false,
    food_Barbecue: false,
    food_Mediterranean: false,
    food_FastFood: false,
    food_Desserts: false,
    location_Bar: false,
    location_Cafe: false,
    location_Restaurant: false
};
const API_URL = process.env.REACT_APP_API_URL;

function PreferencePage() {
    const [preferences, setPreferences] = useState({
        ...defaultState
    });
    const [counts, setCounts] = useState({
        hobby: 0,
        interest: 0,
        food: 0,
        location: 0
    });

    useEffect(() => {
        fetch(`${API_URL}/preference`, {
            method: "GET",
            credentials: "include"
        })
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    window.location.href = "/login";
                }
            })
            .then(data => {
                setPreferences(data?.preferences || defaultState);
                updateCounts(data?.preferences || defaultState);
            })
            .catch(error => console.error("Error:", error));
    }, []);

    const handleCheckboxChange = (key, isChecked) => {
        setPreferences(prev => {
            const updated = { ...prev, [key]: isChecked };
            updateCounts(updated);
            return updated;
        });
    };

    const updateCounts = preferences => {
        const newCounts = { hobby: 0, interest: 0, food: 0, location: 0 };
        Object.entries(preferences).forEach(([key, value]) => {
            if (value) {
                const category = key.split("_")[0];
                newCounts[category]++;
            }
        });
        setCounts(newCounts);
    };

    const handleSubmit = e => {
        e.preventDefault();

        const selectedHobbies = Object.keys(preferences).filter(
            key => key.startsWith("hobby_") && preferences[key]
        );

        const selectedInterests = Object.keys(preferences).filter(
            key => key.startsWith("interest_") && preferences[key]
        );

        const selectedFoods = Object.keys(preferences).filter(
            key => key.startsWith("food_") && preferences[key]
        );

        const selectedLocations = Object.keys(preferences).filter(
            key => key.startsWith("location_") && preferences[key]
        );

        if (
            selectedHobbies.length < 3 ||
            selectedInterests.length < 3 ||
            selectedFoods.length < 3 ||
            selectedLocations.length < 1
        ) {
            alert("Please select at least 3 hobbies, 3 interests, 3 foods, and 1 location");
            console.error(
                "Please select at least 3 hobbies, 3 interests, 3 foods, and 1 locations"
            );
            return;
        } else {
            e.preventDefault();

            fetch(API_URL + "/preference", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(preferences)
            })
                .then(response => {
                    if (response.ok) {
                        window.location.href = "/home";
                    } else {
                        console.error("Failed to save preferences");
                    }
                })
                .catch(error => console.error("Error:", error));
        }
    };

    const categories = {
        Hobby: [
            "Reading",
            "Writing",
            "Art",
            "Music",
            "Sports",
            "Gaming",
            "Cooking",
            "Photography",
            "Hiking",
            "Cycling",
            "Yoga",
            "Dancing",
            "Crafting",
            "Gardening",
            "Fishing",
            "Gym"
        ],
        Interest: [
            "Travelling",
            "History",
            "Movies",
            "Theater",
            "Science",
            "Pets",
            "Volunteering",
            "Nature",
            "Fitness"
        ],
        Food: [
            "Vegan",
            "Vegetarian",
            "Gluten Free",
            "Bar Food",
            "Food Markets",
            "Asian Food",
            "Italian Food",
            "Indian Food",
            "Mexican Food",
            "Seafood",
            "Barbecue",
            "Coffee Shop",
            "Mediterranean Food",
            "Desserts"
        ],
        Location: ["Bar", "Cafe", "Restaurant"]
    };

    return (
        <div className="container">
            <h1>Select your preferences</h1>
            <hr />
            <Form onSubmit={handleSubmit}>
                {Object.entries(categories).map(([category, options]) => (
                    <Form.Group key={category} className="mb-4">
                        <Form.Label className="d-block mb-3">
                            <h5 className="text-">{category} </h5>
                            <span className="sub-pick">
                                Select <strong>at least</strong> ({counts[category.toLowerCase()]} /{" "}
                                {category === "Location" ? 1 : 3})
                            </span>
                        </Form.Label>
                        <div className="row">
                            {options.map(option => {
                                const preferenceKey = `${category.toLowerCase()}_${option.replace(
                                    /\s+/g,
                                    ""
                                )}`;
                                return (
                                    <div className="col-sm-6 col-md-4 col-lg-3" key={option}>
                                        <Form.Check
                                            type="checkbox"
                                            className="custom-checkbox"
                                            id={preferenceKey}
                                            label={option}
                                            onChange={e =>
                                                handleCheckboxChange(
                                                    preferenceKey,
                                                    e.target.checked
                                                )
                                            }
                                            name={preferenceKey}
                                            checked={preferences[preferenceKey]}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    </Form.Group>
                ))}
                <Button variant="primary" size="lg" className="w-100" type="submit">
                    Confirm
                </Button>
            </Form>
        </div>
    );
}

export default PreferencePage;
