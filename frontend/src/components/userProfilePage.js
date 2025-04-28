import { useEffect, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import placeholder from "../PlaceholderPFP.jpg";
import "./userProfilePage.css";

const API_URL = process.env.REACT_APP_API_URL;

function capitalizeFirstLetter(string) {
    if (!string) return "";
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function ProfilePage() {
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    const [currentProfile, setCurrentProfile] = useState(null);
    const [preferences, setPreferences] = useState({
        foodPrefs: [],
        hobbyPrefs: [],
        interestsPrefs: []
    });

    useEffect(() => {
        fetch(`${API_URL}/userprofile`, { method: "GET", credentials: "include" })
            .then(response => (response.ok ? response.json() : (window.location.href = "/login")))
            .then(data => setCurrentProfile(data))
            .catch(error => console.error("Error fetching data:", error));
    }, []);

    useEffect(() => {
        if (currentProfile) {
            const { preferenceObject } = currentProfile?.preferences || [];
            const foodPrefs = [];
            const hobbyPrefs = [];
            const interestsPrefs = [];
            Object.entries(preferenceObject).forEach(([key, value]) => {
                if (value) {
                    const [category, pref] = key.split("_");
                    if (!pref || !category) return;
                    const formattedPref = pref.replace(/([A-Z])/g, " $1").trim();
                    if (category === "dietary" || category === "food")
                        foodPrefs.push(formattedPref);
                    else if (category === "hobby") hobbyPrefs.push(formattedPref);
                    else if (category === "interest") interestsPrefs.push(formattedPref);
                }
            });
            setPreferences({ foodPrefs, hobbyPrefs, interestsPrefs });
        }
    }, [currentProfile]);

    const preferenceSection = (title, prefs) => (
        <div className="card mb-3">
            <div className="card-header text-white">{title}</div>
            <ul className="list-group list-group-flush">
                {prefs.map((pref, index) => (
                    <li key={index} className="list-group-item">
                        {pref}
                    </li>
                ))}
            </ul>
        </div>
    );

    return (
        <div className="container-fluid py-5 mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <div className="card mb-4 shadow-sm">
                        <img
                            src={currentProfile?.photoURL || placeholder}
                            className="card-img-top"
                            alt="Profile"
                        />
                        <div className="card-body">
                            <h5 className="card-title">{`${currentProfile?.firstName} ${currentProfile?.lastName}`}</h5>
                            <p className="card-text">{currentProfile?.bio}</p>
                            <p className="card-text">
                                <small className="text-muted">{`${
                                    currentProfile?.age
                                } years old, ${capitalizeFirstLetter(
                                    currentProfile?.sexuality
                                )}, ${capitalizeFirstLetter(currentProfile?.gender)}`}</small>
                            </p>
                            <Button variant="outline-primary" onClick={handleShow}>
                                Edit Profile
                            </Button>
                        </div>
                    </div>
                    <div className="d-flex flex-column gap-3">
                        {preferenceSection("Hobbies", preferences.hobbyPrefs)}
                        {preferenceSection("Interests", preferences.interestsPrefs)}
                        {preferenceSection("Food Preferences", preferences.foodPrefs)}
                    </div>
                </div>
            </div>

            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Profile</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="d-flex justify-content-center flex-column gap-2">
                        <Button variant="primary" href="/account" onClick={handleClose}>
                            Edit Account
                        </Button>
                        <Button variant="primary" href="/preferences" onClick={handleClose}>
                            Edit Preferences
                        </Button>
                    </div>
                </Modal.Body>
            </Modal>
        </div>
    );
}

export default ProfilePage;
