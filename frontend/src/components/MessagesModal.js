import { useEffect, useState } from "react";
import { Button, Modal } from "react-bootstrap";
const API_URL = process.env.REACT_APP_API_URL;

export function MessagesModal({ senderId, open, setOpen }) {
    const userId = senderId;
    const [reportedMessages, setReportedMessages] = useState([]);
    const [checkedMessages, setCheckedMessages] = useState([]);

    useEffect(() => {}, [reportedMessages]);

    useEffect(() => {}, [checkedMessages]);

    useEffect(() => {
        setReportedMessages([]);

        fetch(`${API_URL}/admin/specificreportedmessages`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: userId })
        })
            .then(response => {
                if (!response.ok) {
                    return;
                }
                return response.json();
            })
            .then(data => {
                setReportedMessages(data);
            });
    }, [open, userId]);

    const handleReport = () => {
        checkedMessages.map(message => {
            fetch(`${API_URL}/admin/deletemessage`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messageId: message })
            })
                .then(response => {
                    if (response.ok) {
                    }
                })
                .catch(error => {
                    console.error("Error reporting user:", error);
                });
            return null;
        });
        handleClose();
    };

    const handleClose = () => {
        setOpen(false);
        setReportedMessages("");
    };

    return (
        open && (
            <>
                <Modal
                    show={open}
                    onHide={handleClose}
                    size="lg"
                    aria-labelledby="contained-modal-title-vcenter"
                    centered
                >
                    <Modal.Header closeButton>
                        <Modal.Title id="contained-modal-title-vcenter">
                            Reported Messages
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <h4>Reported message</h4>
                        <div className=" mt-2 container">
                            {reportedMessages.length > 0 ? (
                                <div className="list-group">
                                    {reportedMessages.map(message => (
                                        <div className="">
                                            <div>
                                                Content: <text>{message.content}</text>
                                                <br />
                                            </div>
                                            <div>
                                                Sent at:{" "}
                                                <text>
                                                    {
                                                        new Date(message.createdAt)
                                                            .toISOString()
                                                            .split("T")[0]
                                                    }
                                                </text>{" "}
                                            </div>
                                            <input
                                                type="checkbox"
                                                onChange={e => {
                                                    if (e.target.checked) {
                                                        setCheckedMessages([
                                                            ...checkedMessages,
                                                            message.messageId
                                                        ]);
                                                    } else {
                                                        setCheckedMessages(
                                                            checkedMessages.filter(
                                                                id => id !== message.messageId
                                                            )
                                                        );
                                                    }
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p>no reported messages from this user</p>
                            )}
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleClose}>
                            Cancel
                        </Button>
                        <Button variant="primary" onClick={handleReport}>
                            Delete
                        </Button>
                    </Modal.Footer>
                </Modal>
            </>
        )
    );
}
