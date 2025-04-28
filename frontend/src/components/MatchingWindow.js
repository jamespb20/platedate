import { faFlag, faHeart, faInfoCircle, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { Button, Card, ListGroup, ListGroupItem, Modal } from "react-bootstrap";
import placeholder from "../PlaceholderPFP.jpg";
import { calculateDistance } from "../utils/distance";
import "./MatchingWindow.css";
import { ReportModal } from "./ReportModal";
const API_URL = process.env.REACT_APP_API_URL;

function capitalizeFirstLetter(string) {
    if (string === null) {
        return "null";
    } else {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
}

function MatchingWindow() {
    const [currentProfile, setCurrentProfile] = useState(null);
    const [, setProfiles] = useState([]);
    const [userProfile, setUserProfile] = useState(null);
    const [preferences, setPreferences] = useState({
        foodPrefs: [],
        hobbyPrefs: [],
        interestsPrefs: []
    });
    const [showModal, setShowModal] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);

    const addSpaces = string => {
        return string.replace(/([A-Z])/g, " $1").trim();
    };

    useEffect(() => {
        fetch(`${API_URL}/userprofile`, { method: "GET", credentials: "include" })
            .then(response => (response.ok ? response.json() : (window.location.href = "/login")))
            .then(data => setUserProfile(data))
            .catch(error => console.error("Error fetching data:", error));

        fetch(`${API_URL}/auth`, {
            method: "GET",
            credentials: "include"
        })
            .then(response => {
                if (response.ok) {
                    return response.json();
                }
            })
            .then(data => {
                if (data.isAdmin) {
                    window.location.href = "/admin";
                }
            });
    }, []);

    useEffect(() => {
        fetch(`${API_URL}/userprofile/all`, {
            method: "GET",
            credentials: "include"
        })
            .then(response => {
                if (!response.ok) {
                    return (window.location.href = "/login");
                }
                return response.json();
            })
            .then(data => {
                const { matches } = data;

                if (matches && matches.length) {
                    setProfiles(matches);
                    setCurrentProfile(matches[0] || null);
                }
            })
            .catch(error => {
                console.error("Error fetching data:", error);
            });
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
                    if (category === "dietary" || category === "food") {
                        foodPrefs.push(addSpaces(pref));
                    } else if (category === "hobby") {
                        hobbyPrefs.push(addSpaces(pref));
                    } else if (category === "interest") {
                        interestsPrefs.push(addSpaces(pref));
                    }
                }
            });

            setPreferences({ foodPrefs, hobbyPrefs, interestsPrefs });
        }
    }, [currentProfile]);

    const handleCheck = checked => {
        fetch(`${API_URL}/match`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                matchedUserId: currentProfile.userId,
                result: checked
            })
        }).then(response => {
            if (checked) {
                fetch(`${API_URL}/match`, {
                    method: "GET",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json"
                    }
                })
                    .then(response => {
                        if (response.ok) {
                            return response.json();
                        }
                    })
                    .then(data => {});
            } else {
            }
        });

        setProfiles(prevProfiles => {
            const newProfiles = [...prevProfiles.slice(1)];
            if (newProfiles.length) {
                setCurrentProfile(newProfiles[0]);
            } else {
                setCurrentProfile(null);
            }
            return newProfiles;
        });
    };

    const preferenceSection = (title, prefs) => (
        <div className="preference-section">
            <strong className="titling">{title}</strong>
            <div className="d-flex flex-column flex-md-row  gap-2">
                {preferences[prefs].slice(0, 3).map((pref, index) => (
                    <>
                        <span key={index} className="pref-bubble">
                            {pref}
                        </span>
                    </>
                ))}
            </div>
        </div>
    );

    return (
        <div className="matching-window d-flex justify-content-center align-items-center p-3">
            <Card className="match-card shadow">
                {currentProfile ? (
                    <>
                        <Card.Img
                            variant="top"
                            src={currentProfile.photoURL || placeholder}
                            className=""
                        />
                        <div className="button-overlay">
                            <Button variant="" className="profile-btn reject">
                                <FontAwesomeIcon
                                    icon={faTimes}
                                    onClick={() => handleCheck(false)}
                                />
                            </Button>
                            <Button variant="" className="profile-btn like">
                                <FontAwesomeIcon icon={faHeart} onClick={() => handleCheck(true)} />
                            </Button>
                        </div>
                        <Card.Body>
                            <Card.Title>{`${capitalizeFirstLetter(currentProfile.firstName)}, ${currentProfile.age}`}</Card.Title>
                            <Card.Subtitle className="mb-2 text-muted">
                                <div className="d-flex flex-row justify-content-between">
                                    <div className="d-flex flex-column flex-md-row gap-lg-1">
                                        <span>
                                            {addSpaces(
                                                capitalizeFirstLetter(currentProfile.gender)
                                            )}
                                        </span>
                                        <span className="d-none d-md-block"> · </span>
                                        <span>
                                            {capitalizeFirstLetter(currentProfile.sexuality || "")}
                                        </span>
                                    </div>
                                    <span>{calculateDistance(userProfile, currentProfile)} km</span>
                                </div>
                            </Card.Subtitle>
                            <div className="text-center text-grey p-4 bg-light-mint rounded-3 ">
                                {currentProfile.bio}
                            </div>
                            <ListGroup className="list-group-flush">
                                <ListGroupItem>
                                    {preferenceSection("Interests", "interestsPrefs")}
                                </ListGroupItem>
                                <ListGroupItem>
                                    {preferenceSection("Hobbies", "hobbyPrefs")}
                                </ListGroupItem>
                                <ListGroupItem>
                                    {preferenceSection("Food Preferences", "foodPrefs")}
                                </ListGroupItem>
                            </ListGroup>
                            <Button variant="modal" onClick={() => setShowModal(true)}>
                                <FontAwesomeIcon icon={faInfoCircle} color="#800020" /> More...
                            </Button>
                        </Card.Body>
                        <Card.Footer
                            className="report-section"
                            onClick={() => setShowReportModal(true)}
                        >
                            <hr />
                            <FontAwesomeIcon icon={faFlag} color="#800020" /> Report
                        </Card.Footer>
                    </>
                ) : (
                    <Card.Body>
                        <Card.Text>No more profiles to show.</Card.Text>
                    </Card.Body>
                )}
            </Card>

            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Full Preferences</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="preference-section">
                        <strong>Hobbies:</strong>
                        <ul>
                            {preferences.hobbyPrefs.map((pref, index) => (
                                <li key={index}>{addSpaces(pref)}</li>
                            ))}
                        </ul>
                    </div>
                    <div className="preference-section">
                        <strong>Interests:</strong>
                        <ul>
                            {preferences.interestsPrefs.map((pref, index) => (
                                <li key={index}>{addSpaces(pref)}</li>
                            ))}
                        </ul>
                    </div>
                    <div className="preference-section">
                        <strong>Food Preferences:</strong>
                        <ul>
                            {preferences.foodPrefs.map((pref, index) => (
                                <li key={index}>{addSpaces(pref)}</li>
                            ))}
                        </ul>
                    </div>
                </Modal.Body>
            </Modal>

            {currentProfile && (
                <ReportModal
                    currentUser={currentProfile.userProfileId}
                    open={showReportModal}
                    setOpen={setShowReportModal}
                />
            )}
        </div>
    );
}

export default MatchingWindow;
