import { faFlag, faStar } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import confetti from "canvas-confetti";
import React, { useEffect, useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import "./ChatWindow.css";
const API_URL = process.env.REACT_APP_API_URL;

function ChatWindow({ chat, onClose, userId }) {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");

    const handleReport = messageId => {
        fetch(`${API_URL}/chats/report`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                messageId: messageId
            })
        });

        alert("Message has been reported");
    };

    const [showModal, setShowModal] = useState(false);
    const [messageToReport, setMessageToReport] = useState(null);

    const handleReportClick = messageId => {
        setMessageToReport(messageId);
        setShowModal(true);
    };

    const handleConfirmReport = () => {
        handleReport(messageToReport);
        setShowModal(false);
    };

    useEffect(() => {
        const fetchChatMessages = async () => {
            try {
                const response = await fetch(`${API_URL}/chats/query?chatId=${chat.chatId}`, {
                    method: "GET",
                    credentials: "include"
                });
                if (!response.ok) {
                    console.error("Failed to fetch chat messages");
                    return;
                }
                const data = await response.json();
                if (!data.chats.length) return console.error("No messages found");
                const updatedChat = data.chats[0];

                setMessages(updatedChat.messages);
            } catch (error) {
                console.error("Failed to fetch chat messages:", error);
            }
        };

        fetchChatMessages();
        setInterval(fetchChatMessages, 3000);
    }, [chat.chatId]);

    const handleNewMessageChange = event => {
        setNewMessage(event.target.value);
    };

    const launchConfetti = () => {
        confetti({
            particleCount: 400,
            spread: 400,
            zIndex: 20000,
            origin: { y: 0.6 }
        });
    };

    const handleSendMessage = async event => {
        event.preventDefault();
        if (!newMessage.trim()) return;

        const message = {
            senderId: userId,
            content: newMessage,
            timestamp: new Date().toISOString()
        };

        setNewMessage("");

        await postMessage(message);
    };

    const postMessage = async message => {
        setMessages([...messages, message]);
        try {
            await fetch(`${API_URL}/chats/message`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    chatId: chat.chatId,
                    message: message.content,
                    isDate: message?.isDate,
                    dateData: message?.dateLocation
                })
            });
        } catch (error) {
            console.error("Failed to send message:", error);
        }
    };

    const inviteToDate = async () => {
        const getRestaurant = await fetch(
            `${API_URL}/chats/recommend?userId=${chat.participants[0]?.user.userId}`,
            {
                method: "GET",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );

        const restaurant = await getRestaurant.json();

        if (!restaurant || restaurant.error) {
            alert("No restaurant found. Please try again later.");
            return;
        }

        const { name, rating, vicinity } = restaurant;

        const message = {
            senderId: userId,
            content: `Hey! I found this cool restaurant for us to go to: ${name} at ${vicinity}. It has a rating of ${rating}/5. What do you think?`,
            timestamp: new Date().toISOString(),
            isDate: true,
            dateLocation: restaurant
        };

        await postMessage(message);
        launchConfetti();
    };

    return (
        <>
            <Modal
                show={showModal}
                onHide={() => setShowModal(false)}
                className="overlay-modal"
                size="md"
            >
                <Modal.Header closeButton>
                    <Modal.Title>Report Message</Modal.Title>
                </Modal.Header>
                <Modal.Body>Are you sure you want to report this message?</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleConfirmReport}>
                        Report
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal
                show={true}
                onHide={onClose}
                dialogClassName="chat-modal-content"
                centered
                size="lg"
            >
                <Modal.Header closeButton className="chat-modal-header">
                    <Modal.Title>
                        Chat with {chat.participants[0]?.user?.profile.firstName}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {messages.map((message, index) => (
                        <div
                            key={index}
                            className={`chat-message-${message.senderId === userId ? "you" : "them"} ${message.isDate ? "" : ""}`}
                        >
                            <div className="message-sender">
                                {message.senderId === userId
                                    ? "You"
                                    : chat.participants[0]?.user?.profile.firstName}
                            </div>
                            {message.isDate ? (
                                <>
                                    Let's go on a date!
                                    <div className="date-msg col-12 mx-auto">
                                        <div className="date-msg-text col-6">
                                            <strong>{message.dateLocation.name}</strong>
                                            <p>{message.dateLocation.vicinity}</p>
                                            <div className="date-msg-rating">
                                                {Array.from({ length: 5 }, (_, i) => (
                                                    <FontAwesomeIcon
                                                        icon={faStar}
                                                        className="star"
                                                        color={
                                                            i < message.dateLocation.rating
                                                                ? "#F8DE7E"
                                                                : "#ccc"
                                                        }
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="message-text text-wrap text-break d-flex position-relative">
                                    {message.senderId !== userId && !message.isDate && (
                                        <Button
                                            variant="link"
                                            onClick={() => handleReportClick(message.messageId)}
                                            className="report-button position-absolute top-0 end-0"
                                        >
                                            <FontAwesomeIcon
                                                icon={faFlag}
                                                color="#F8DE7E"
                                                size="sm"
                                            />
                                        </Button>
                                    )}
                                    <p className="mb-0">{message.content}</p>
                                </div>
                            )}
                        </div>
                    ))}
                    {!messages.length && <div className="p-3">No messages yet.</div>}
                    <Form onSubmit={handleSendMessage}>
                        <Form.Group className="d-flex">
                            <Form.Control
                                type="text"
                                placeholder="Type a message..."
                                value={newMessage}
                                onChange={handleNewMessageChange}
                                className="me-2"
                            />
                            <Button variant="primary" type="submit">
                                Send
                            </Button>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer className="d-flex flex-row justify-content-between ">
                    <h6>Ready to go on a date?</h6>
                    <button type="submit" className="invite-button" onClick={inviteToDate}>
                        Invite
                    </button>
                </Modal.Footer>
            </Modal>
        </>
    );
}
export default ChatWindow;
