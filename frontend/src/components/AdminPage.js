import React, { useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import placeholder from "../PlaceholderPFP.jpg";
import { MessagesModal } from "./MessagesModal";

const API_URL = process.env.REACT_APP_API_URL;

const AdminPage = () => {
    const [openModalUserId, setOpenModalUserId] = useState(null);
    const [reportedUsers, setReportedUsers] = useState([]);
    const [reportedUsersFromMsgs, setReportedUsersFromMsgs] = useState([]);

    const [, setCurrentReportedMessagesID] = useState(null);

    useEffect(() => {
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
                if (!data.isAdmin) {
                    return (window.location.href = "/home");
                }
            })
            .then(() => {
                fetch(`${API_URL}/admin/report`, {
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
                        const filteredData = data.filter(item => !item.profile.user.isBanned);

                        setReportedUsers(filteredData);
                    });
            });

        fetch(`${API_URL}/admin/reportedmessages`, {
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
                const uniqueMessagesMap = {};

                data.forEach(message => {
                    if (!uniqueMessagesMap[message.senderId]) {
                        uniqueMessagesMap[message.senderId] = message;
                    }
                });
                const uniqueData = Object.values(uniqueMessagesMap);

                setReportedUsersFromMsgs(uniqueData);
            });
    }, []);

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
            setReportedUsers(data);

            window.location.href = "/admin";
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
            setReportedUsers(data);

            window.location.href = "/admin";
        } else {
            console.error("Failed to save user/profile");
        }
    };

    return (
        <div>
            <div className="left-side">
                <div className=" mt-10 container">
                    {reportedUsers.length > 0 && (
                        <div className="list-group">
                            {reportedUsers.map(user => (
                                <div className="d-flex d-row">
                                    <a
                                        key={user.profile.userId}
                                        href="#search"
                                        className="list-group-item list-group-item-action flex-column align-items-start"
                                    >
                                        <text>This user's profile was reported</text>
                                        <div className="d-flex  d-column w-100 justify-content-between align-items-center">
                                            <img
                                                src={
                                                    user.profile.photoURL
                                                        ? user.profile.photoURL
                                                        : placeholder
                                                }
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
                                                    {user.profile.firstName} {user.profile.lastName}
                                                </h5>
                                                <small>{user.profile.age} years old</small>
                                                <br></br>
                                                <small>{user.profile.gender}</small>
                                                <p className="mb-1">
                                                    Report Message: {user.reportMessage}
                                                </p>
                                                <small>{user.profile.country}</small>
                                            </div>
                                        </div>

                                        <div className="d-block flex-column mt-1">
                                            <Button
                                                onClick={() => {
                                                    setOpenModalUserId(user.profile.userId);
                                                    setCurrentReportedMessagesID(
                                                        user.profile.userId
                                                    );
                                                }}
                                                className="mx-2 "
                                            >
                                                See Reported Messages
                                            </Button>
                                            <Button
                                                onClick={() => banUserButton(user.profile.userId)}
                                                className="mx-2 "
                                            >
                                                Ban
                                            </Button>
                                            <Button
                                                onClick={() =>
                                                    deleteUserButton(user.profile.userProfileId)
                                                }
                                                className="mx-2 "
                                            >
                                                Delete
                                            </Button>
                                            <a
                                                href={`/account?id=${user.profile.userId}&profileId=${user.userProfileId}`}
                                                className="btn btn-primary"
                                            >
                                                Edit Profile
                                            </a>
                                        </div>
                                    </a>
                                    <MessagesModal
                                        senderId={user.profile.userId}
                                        open={openModalUserId === user.profile.userId}
                                        setOpen={() => setOpenModalUserId(null)}
                                    />
                                </div>
                            ))}

                            {reportedUsersFromMsgs.map(
                                message =>
                                    !message.user.isBanned && (
                                        <div className="d-flex d-row">
                                            <a
                                                key={message.user.profile.userId}
                                                href="#search"
                                                className="list-group-item list-group-item-action flex-column align-items-start"
                                            >
                                                <text>This user has reported messages.</text>
                                                <div className="d-flex  d-column w-100 justify-content-between align-items-center">
                                                    <img
                                                        src={
                                                            message.user.profile.photoURL
                                                                ? message.user.profile.photoURL
                                                                : placeholder
                                                        }
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
                                                            {message.user.profile.firstName}{" "}
                                                            {message.user.profile.lastName}
                                                        </h5>
                                                        <small>
                                                            {message.user.profile.age} years old
                                                        </small>
                                                        <br></br>
                                                        <small>{message.user.profile.gender}</small>
                                                        <br></br>
                                                        <small>
                                                            {message.user.profile.country}
                                                        </small>
                                                        <br></br>
                                                        <small>
                                                            Ban status: {message.user.isBanned}{" "}
                                                        </small>
                                                    </div>
                                                </div>

                                                <div className="d-block flex-column mt-1">
                                                    <Button
                                                        onClick={() => {
                                                            setOpenModalUserId(
                                                                message.user.profile.userId
                                                            );
                                                            setCurrentReportedMessagesID(
                                                                message.user.profile.userId
                                                            );
                                                        }}
                                                        className="mx-2 "
                                                    >
                                                        See Reported messages
                                                    </Button>
                                                    <Button
                                                        onClick={() =>
                                                            banUserButton(
                                                                message.user.profile.userId
                                                            )
                                                        }
                                                        className="mx-2 "
                                                    >
                                                        Ban
                                                    </Button>
                                                    <Button
                                                        onClick={() =>
                                                            deleteUserButton(
                                                                message.user.profile.userProfileId
                                                            )
                                                        }
                                                        className="mx-2 "
                                                    >
                                                        Delete
                                                    </Button>
                                                    <a
                                                        href={`/account?id=${message.user.profile.userId}&profileId=${message.user.userProfileId}`}
                                                        className="btn btn-primary"
                                                    >
                                                        Edit Profile
                                                    </a>
                                                </div>
                                            </a>
                                            <MessagesModal
                                                senderId={message.user.profile.userId}
                                                open={
                                                    openModalUserId === message.user.profile.userId
                                                }
                                                setOpen={() => setOpenModalUserId(null)}
                                            />
                                        </div>
                                    )
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminPage;
