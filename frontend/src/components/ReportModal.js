import { useState } from "react";
import { Button, Modal } from "react-bootstrap";
const API_URL = process.env.REACT_APP_API_URL;

export function ReportModal({ currentUser, open, setOpen }) {
    const [reportMessage, setReportText] = useState("");
    const userProfileId = currentUser;

    const handleReport = () => {
        const reportData = { userProfileId, reportMessage };
        if (reportMessage === "" || reportMessage === null || reportMessage.length < 10) {
            alert("Please enter a report message with at least 10 characters.");
            return;
        } else if (window.confirm("Are you sure you want to report this user?")) {
            fetch(`${API_URL}/report/`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(reportData)
            })
                .then(response => {
                    if (response.ok) {
                    }
                })
                .catch(error => {
                    console.error("Error reporting user:", error);
                });

            setReportText("");
            handleClose();
        }
    };

    const handleClose = () => {
        setOpen(false);
        setReportText("");
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
                        <Modal.Title id="contained-modal-title-vcenter">Report User</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <h4>Report message</h4>
                        <form>
                            <textarea
                                className="form-control"
                                value={reportMessage}
                                onChange={e => setReportText(e.target.value)}
                                rows="10"
                            />
                        </form>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleClose}>
                            Cancel
                        </Button>
                        <Button variant="primary" onClick={handleReport}>
                            Submit report
                        </Button>
                    </Modal.Footer>
                </Modal>
            </>
        )
    );
}
