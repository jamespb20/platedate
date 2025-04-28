import { useEffect, useState } from "react";
import placeholder from "../PlaceholderPFP.jpg";
import ChatWindow from "./ChatWindow";
import "./Chatbar.css";
const API_URL = process.env.REACT_APP_API_URL;

function Chatbar() {
    const [chatsList, setChatsList] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        checkChats();

        setInterval(checkChats, 5000);
    }, []);

    const checkChats = () => {
        fetch(`${API_URL}/chats/query`, {
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
                const { chats, userId } = data;
                setChatsList(chats);
                setUserId(userId);
            });
    };

    const createChatItem = chat => {
        const [participant] = chat.participants.filter(
            participant => participant.userId !== userId
        );
        if (!participant || !chat) return;
        const userProfile = participant?.user?.profile;
        return (
            <span
                key={chat.chatId}
                onClick={() => handleChatClick(chat)}
                className="list-group-item list-group-item-action py-3 lh-tight"
                aria-current="true"
            >
                <div className="d-flex flex-row align-items-center">
                    <img
                        src={userProfile.photoURL || placeholder}
                        alt="Profile"
                        className="rounded-4 w-auto chat-photo "
                        height="75"
                    />

                    <div className="d-flex flex-column ms-3">
                        <strong>{userProfile.firstName}</strong>
                        <small className="text-muted">
                            {chat.messages.length
                                ? chat.messages.slice(-1)[0].content
                                : "No messages yet"}
                        </small>
                    </div>
                </div>
            </span>
        );
    };

    const handleChatClick = chat => {
        setSelectedChat(chat);
    };

    const handleClose = () => {
        setSelectedChat(null);
    };

    return (
        <>
            {selectedChat && (
                <ChatWindow
                    key={selectedChat.chatId}
                    chat={selectedChat}
                    userId={parseInt(userId)}
                    onClose={handleClose}
                />
            )}
            <div className="chatbar-container bg-light shadow-sm mt-5">
                <div className="list-group list-group-flush">
                    {chatsList.length ? (
                        chatsList.map(chat => createChatItem(chat))
                    ) : (
                        <div className="p-3 text-muted">No chats available.</div>
                    )}
                </div>
            </div>
        </>
    );
}

export default Chatbar;
