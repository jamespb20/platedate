import { faComments, faHeart } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import Chatbar from "./components/Chatbar";
import ProfilePage from "./components/userProfilePage";

function UserProfilePage() {
    const [showChats, setShowChats] = useState(false);

    const toggleView = () => setShowChats(!showChats);

    return (
        <div className="container-fluid mt-4 bg-creamy">
            <div className="row">
                <div
                    className={`col-md-4 chatbar-outl ${showChats ? "" : "d-none d-md-block parent-of-chatbar-container"}`}
                >
                    <Chatbar />
                </div>

                <div className={`col-md-8 ${showChats ? "d-none d-md-block" : ""}`}>
                    <ProfilePage />
                </div>

                <button
                    className="btn btn-primary btn-floating d-md-none"
                    style={{
                        position: "fixed",
                        bottom: "20px",
                        right: "20px",
                        fontSize: "20px",
                        width: "60px",
                        height: "60px",
                        borderRadius: "30px"
                    }}
                    onClick={toggleView}
                >
                    <FontAwesomeIcon icon={showChats ? faHeart : faComments} />
                </button>
            </div>
        </div>
    );
}
export default UserProfilePage;
