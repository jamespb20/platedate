import React, { useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import placeholder from "../PlaceholderPFP.jpg";
import "./SearchPage.css";

const API_URL = process.env.REACT_APP_API_URL;
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

const defaultGenderPreferences = {
    male: false,
    female: false,
    nonbinary: false,
    transgenderMale: false,
    transgenderFemale: false
};
function SearchPage() {
    useEffect(() => {
        fetch(`${API_URL}/auth`, {
            method: "GET",
            credentials: "include"
        })
            .then(async response => {
                const data = await response.json();
                if (data.isAdmin) {
                    setShowButton(true);
                } else {
                    setShowButton(false);
                }
            })
            .catch(error => {
                console.error("Error fetching data:", error);
                window.location.href = "/login";
            });
    }, []);

    const [showButton, setShowButton] = useState(false);

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        minAge: "",
        maxAge: "",
        country: "",
        genderPreferences: { ...defaultGenderPreferences },
        preferences: { ...defaultState }
    });

    const [searchResults, setSearchResults] = useState([]);

    const handleInputChange = e => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    const handleCheckboxChange = (category, key, isChecked) => {
        setFormData(prev => ({
            ...prev,
            preferences: {
                ...prev.preferences,
                [key]: isChecked
            }
        }));
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

    const cleanDataForSubmission = data => {
        const cleanData = {};
        Object.keys(data).forEach(key => {
            if (data[key] && typeof data[key] === "object") {
                cleanData[key] = {};
                Object.keys(data[key]).forEach(subKey => {
                    if (data[key][subKey]) {
                        cleanData[key][subKey] = data[key][subKey];
                    }
                });
                if (Object.keys(cleanData[key]).length === 0) {
                    delete cleanData[key];
                }
            } else if (data[key]) {
                cleanData[key] = data[key];
            }
        });
        return cleanData;
    };

    const handleSubmit = async e => {
        setSearchResults([]);
        e.preventDefault();
        const cleanedData = cleanDataForSubmission(formData);

        const age = [cleanedData.minAge, cleanedData.maxAge];

        const requestData = {
            ...cleanedData,
            age: age,
            gender: formData.genderPreferences
        };
        try {
            const response = await fetch(`${API_URL}/userprofile/search`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(requestData)
            });
            if (response.ok) {
                const data = await response.json();
                setSearchResults(data);
            } else {
                console.error("Failed to fetch search results");
            }
        } catch (error) {
            console.error("Error during fetch:", error);
        }
    };

    const deleteUserButton = async userProfileId => {
        const response = await fetch(`${API_URL}/admin/delete`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ userProfileId: userProfileId })
        });
        if (response.ok) {
            const data = await response.json();
            setSearchResults(data);

            window.location.href = "/search";
        } else {
            console.error("Failed to delete user/profile");
        }
    };

    const banUserButton = async userId => {
        let reason = window.prompt("Enter Reason for Ban");
        let until = window.prompt("Enter Date until the user is unbanned (DD-MM-YYYY)");
        let dateRegex = /^(0[1-9]|[12][0-9]|3[01])[-](0[1-9]|1[012])[-](19|20)\d\d$/;

        if (!dateRegex.test(until)) {
            alert("Invalid date format. Please enter date in DD-MM-YYYY format.");
            return;
        }

        const requestData = {
            userId: userId,
            reason: reason,
            bannedUntil: until
        };

        const response = await fetch(`${API_URL}/admin/banuser`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(requestData)
        });
        if (response.ok) {
            const data = await response.json();
            setSearchResults(data);

            window.location.href = "/search";
        } else {
            console.error("Failed to save user/profile");
        }
    };

    return (
        <div className="container mt-10">
            <h1 className="text-center mb-3">Search</h1>
            <Form onSubmit={handleSubmit} className="row g-3">
                <Form.Group controlId="inputFirstName" className="col-md-6">
                    <Form.Label>First Name</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="John"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                    />
                </Form.Group>

                <Form.Group controlId="inputLastName" className="col-md-6">
                    <Form.Label>Last Name</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Doe"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                    />
                </Form.Group>

                <Form.Group controlId="inputCountry" className="col-12">
                    <Form.Label>Country</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Country"
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                    />
                </Form.Group>

                <Form.Group controlId="inputMinAge" className="col-md-6">
                    <Form.Label>Minimum Age</Form.Label>
                    <Form.Control
                        type="number"
                        placeholder="18"
                        name="minAge"
                        value={formData.minAge}
                        onChange={handleInputChange}
                    />
                </Form.Group>

                <Form.Group controlId="inputMaxAge" className="col-md-6">
                    <Form.Label>Maximum Age</Form.Label>
                    <Form.Control
                        type="number"
                        placeholder="120"
                        name="maxAge"
                        value={formData.maxAge}
                        onChange={handleInputChange}
                    />
                </Form.Group>

                {Object.entries(formData.genderPreferences).map(([key, value]) => (
                    <div key={key} className="col-md-4">
                        <Form.Check
                            type="checkbox"
                            label={key.charAt(0).toUpperCase() + key.slice(1)}
                            checked={value}
                            onChange={e =>
                                setFormData({
                                    ...formData,
                                    genderPreferences: {
                                        ...formData.genderPreferences,
                                        [key]: e.target.checked
                                    }
                                })
                            }
                        />
                    </div>
                ))}

                {Object.entries(categories).map(([category, options]) => (
                    <Form.Group key={category} className="col-12">
                        <Form.Label>{category}</Form.Label>
                        <div className="d-flex flex-wrap">
                            {options.map(option => {
                                const preferenceKey = `${category.toLowerCase()}_${option.replace(
                                    /\s+/g,
                                    ""
                                )}`;
                                return (
                                    <Form.Check
                                        key={preferenceKey}
                                        type="checkbox"
                                        label={option}
                                        id={preferenceKey}
                                        checked={formData.preferences[preferenceKey]}
                                        onChange={e =>
                                            handleCheckboxChange(
                                                category,
                                                preferenceKey,
                                                e.target.checked
                                            )
                                        }
                                        className="m-2"
                                    />
                                );
                            })}
                        </div>
                    </Form.Group>
                ))}
                <Button variant="primary" type="submit" className="col-12">
                    Search
                </Button>
            </Form>
            <div className="results mt-4">
                {searchResults.length > 0 && (
                    <div className="list-group">
                        {searchResults.map(profile => (
                            <div className="d-flex">
                                <a
                                    key={profile.id}
                                    href="#search"
                                    className="list-group-item list-group-item-action flex-column align-items-start"
                                >
                                    <div className="d-flex w-100 justify-content-between align-items-center">
                                        <img
                                            src={profile.photoURL ? profile.photoURL : placeholder}
                                            alt="Profile"
                                            className="img-fluid rounded-circle"
                                            style={{
                                                width: "50px",
                                                height: "50px",
                                                marginRight: "15px"
                                            }}
                                        />
                                        <div className="me-auto">
                                            <h5 className="mb-1">
                                                {profile.firstName} {profile.lastName}
                                            </h5>
                                            <small>{profile.age} years old</small>
                                            <br></br>
                                            <small>{profile.gender}</small>
                                            <p className="mb-1">{profile.bio}</p>
                                            <small>{profile.country}</small>
                                        </div>
                                    </div>

                                    <div className="d-block ">
                                        {showButton && (
                                            <Button
                                                onClick={() => banUserButton(profile.userId)}
                                                className="mx-2 "
                                            >
                                                Ban
                                            </Button>
                                        )}
                                        {showButton && (
                                            <Button
                                                onClick={() =>
                                                    deleteUserButton(profile.userProfileId)
                                                }
                                                className="mx-2 "
                                            >
                                                Delete
                                            </Button>
                                        )}
                                        {showButton && (
                                            <a
                                                href={`/account?id=${profile.userId}&profileId=${profile.userProfileId}`}
                                                className="btn btn-primary"
                                            >
                                                Edit Profile
                                            </a>
                                        )}
                                    </div>
                                </a>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default SearchPage;
