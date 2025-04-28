import { LoadScript, StandaloneSearchBox } from "@react-google-maps/api";
import React, { useEffect, useRef, useState } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { useSearchParams } from "react-router-dom";
import "./Form.css";

const API_URL = process.env.REACT_APP_API_URL;

const defaultGenderPreferences = {
    male: false,
    female: false,
    nonbinary: false,
    transgenderMale: false,
    transgenderFemale: false
};

const defaultSexuality = {
    heterosexual: false,
    homosexual: false,
    bisexual: false,
    pansexual: false,
    bicurious: false
};

function AboutMePage(props) {
    const inputRef = useRef();
    const [searchParams] = useSearchParams();
    let userProfileId;

    function handlePlaceChanged() {
        const [place] = inputRef.current.getPlaces();
        if (place) {
            setFormData(prev => ({
                ...prev,
                latitude: place.geometry.location.lat(),
                longitude: place.geometry.location.lng()
            }));
        }
    }

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        age: "",
        gender: "",
        postcode: "",
        country: "",
        latitude: 0,
        longitude: 0,
        bio: "",
        photo: null,
        genderPreferences: { ...defaultGenderPreferences },
        sexuality: { ...defaultSexuality },
        distance: 5
    });
    const [existingProfilePicture, setProfilePic] = useState();

    useEffect(() => {
        let userId = searchParams.get("id");

        fetch(`${API_URL}/auth`, {
            method: "GET",
            credentials: "include"
        })
            .then(response => {
                if (response.ok) {
                    return response.json();
                }
                return Promise.reject(response);
            })
            .then(data => {
                if (data.isAdmin) {
                    fetch(`${API_URL}/auth?userId=${userId}`, {
                        method: "GET",
                        credentials: "include",
                        headers: { "Content-Type": "application/json" }
                    })
                        .then(response => {
                            if (response.ok) {
                                return response.json();
                            }
                            return Promise.reject(response);
                        })
                        .then(data => {
                            if (data.profile.firstName) {
                                setFormData(prev => ({
                                    ...prev,
                                    ...data.profile,
                                    genderPreferences:
                                        data.profile.preferences.genderPreferenceObject,
                                    distance: data.profile.preferences.distancePreference
                                }));
                                if (data.profile.photoURL) {
                                    setProfilePic(data.profile.photoURL);
                                }
                            }
                        });
                }
                if (data.profile.firstName) {
                    setFormData(prev => ({
                        ...prev,
                        ...data.profile,
                        genderPreferences: data.profile.preferences.genderPreferenceObject,
                        distance: data.profile.preferences.distancePreference
                    }));
                    if (data.profile.photoURL) {
                        setProfilePic(data.profile.photoURL);
                    }
                }
            })
            .catch(error => {
                console.error("Error fetching data:", error);
                window.href = "/login";
            });
    }, [searchParams]);

    const handleInputChange = e => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    const handleCheckboxChange = (key, isChecked) => {
        setFormData(prev => ({
            ...prev,
            genderPreferences: {
                ...prev.genderPreferences,
                [key]: isChecked
            }
        }));
    };

    const handlePhotoChange = e => {
        setFormData(prev => ({
            ...prev,
            photo: e.target.files[0] || null
        }));
    };

    const handleSubmit = async e => {
        e.preventDefault();
        if (!Object.values(formData.genderPreferences).some(value => value)) {
            alert("Please select at least one gender preference");
            return;
        }

        userProfileId = searchParams.get("profileId");

        try {
            const { genderPreferences, photo, ...otherData } = formData;
            const formDataObj = new FormData();
            Object.entries(otherData).forEach(([key, value]) => {
                formDataObj.append(key, value);
            });
            if (photo) formDataObj.append("profileImage", photo);
            if (formData.age < 18 || isNaN(formData.age)) {
                alert("Please enter a valid age, you must be 18 or older to use this site.");
                return;
            }

            const response = await fetch(`${API_URL}/userprofile?profileId=${userProfileId}`, {
                method: "POST",
                credentials: "include",
                body: formDataObj
            });

            if (response.ok) {
                await fetch(`${API_URL}/preference/gender`, {
                    method: "POST",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(genderPreferences)
                });

                const distancePreference = formData.distance;
                await fetch(`${API_URL}/preference/distance`, {
                    method: "POST",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ distance: distancePreference })
                });

                if (!userProfileId) {
                    window.location.href = "/preferences";
                } else {
                    window.location.href = "/admin";
                }
            } else {
                console.error("Failed to save user/profile");
            }
        } catch (error) {
            console.error("Error:", error);
        }
    };

    return (
        <div className="container ">
            <h1 className="text-center">My Profile</h1>
            <hr />
            {existingProfilePicture && (
                <div className="d-flex justify-content-center mb-3">
                    <img
                        src={existingProfilePicture}
                        alt="Profile"
                        className="rounded-5 shadow profile-image"
                        style={{ maxWidth: "150px", height: "auto" }}
                    />
                </div>
            )}
            <div className="row ">
                <div className="col-lg-6">
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3" controlId="inputFirstName">
                            <Form.Label>First Name</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="John"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleInputChange}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="inputLastName">
                            <Form.Label>Last Name</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Doe"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleInputChange}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="inputPhoto">
                            <Form.Label>Photo</Form.Label>
                            <Form.Control
                                type="file"
                                onChange={handlePhotoChange}
                                accept="image/*"
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="inputAge">
                            <Form.Label>Age</Form.Label>
                            <Form.Control
                                type="number"
                                placeholder="30"
                                name="age"
                                value={formData.age}
                                onChange={handleInputChange}
                                min="18"
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="inputCountry">
                            <Form.Label>Country</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Country"
                                name="country"
                                value={formData.country}
                                onChange={handleInputChange}
                                required
                            />
                        </Form.Group>

                        <LoadScript
                            //googleMapsApiKey=""
                            libraries={["places"]}
                        >
                            <StandaloneSearchBox
                                onLoad={ref => {
                                    inputRef.current = ref;
                                }}
                                onPlacesChanged={handlePlaceChanged}
                            >
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Enter Location"
                                />
                            </StandaloneSearchBox>
                        </LoadScript>

                        <Form.Group className="mb-3" controlId="inputDistance">
                            <Form.Label>Maximum Distance (km)</Form.Label>
                            <Form.Control
                                type="number"
                                placeholder="50"
                                name="distance"
                                value={formData.distance}
                                onChange={handleInputChange}
                                min={0}
                                max={500}
                                required
                            />
                            {formData.distance < 0 || formData.distance > 500 ? (
                                <p className="text-danger">Distance must be between 0 and 500 km</p>
                            ) : null}
                        </Form.Group>

                        <Form.Group>
                            <Form.Label className="d-block">Gender</Form.Label>
                            {[
                                "male",
                                "female",
                                "transgenderMale",
                                "transgenderFemale",
                                "nonbinary"
                            ].map(g => (
                                <Form.Check
                                    inline
                                    label={
                                        g.charAt(0).toUpperCase() +
                                        g
                                            .slice(1)
                                            .replace("Male", " Male")
                                            .replace("Female", " Female")
                                    }
                                    name="gender"
                                    type="radio"
                                    id={`radioGender${g}`}
                                    value={g}
                                    checked={formData.gender === g}
                                    onChange={handleInputChange}
                                    required
                                />
                            ))}
                        </Form.Group>

                        <Form.Group>
                            <Form.Label className="d-block">Gender Preference</Form.Label>
                            {Object.keys(defaultGenderPreferences).map(pref => (
                                <Form.Check
                                    inline
                                    label={pref.charAt(0).toUpperCase() + pref.slice(1)}
                                    name={pref}
                                    type="checkbox"
                                    id={`checkboxPref${pref}`}
                                    checked={formData.genderPreferences[pref]}
                                    onChange={e => handleCheckboxChange(pref, e.target.checked)}
                                />
                            ))}
                        </Form.Group>

                        <Form.Group>
                            <Form.Label className="d-block">Sexuality</Form.Label>
                            {Object.keys(defaultSexuality).map(pref => (
                                <Form.Check
                                    type="radio"
                                    id={`sexuality-${pref}`}
                                    label={pref.charAt(0).toUpperCase() + pref.slice(1)}
                                    name="sexuality"
                                    value={pref}
                                    checked={formData.sexuality === pref}
                                    onChange={e =>
                                        setFormData({ ...formData, sexuality: e.target.value })
                                    }
                                    required
                                />
                            ))}
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="inputBio">
                            <Form.Label>Biography</Form.Label>
                            <Form.Control
                                as="textarea"
                                placeholder="Tell us something about yourself"
                                name="bio"
                                value={formData.bio}
                                onChange={handleInputChange}
                                required
                            />
                        </Form.Group>

                        <Button variant="primary" size="lg" className="w-100" type="submit">
                            Continue
                        </Button>
                    </Form>
                </div>
            </div>
        </div>
    );
}

export default AboutMePage;
