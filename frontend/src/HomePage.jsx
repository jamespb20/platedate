import { faComments, faHeart } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";
import Chatbar from "./components/Chatbar";
import MatchingWindow from "./components/MatchingWindow";

function HomePage() {
    const [showChats, setShowChats] = useState(false);

    const toggleView = () => setShowChats(!showChats);

    return (
        <div className="mt-4 bg-creamy">
            <div className="row min-vh-100">
                <div className={`col-md-4 chatbar-outl ${showChats ? "" : "d-none d-md-block"}`}>
                    <Chatbar />
                </div>

                <div
                    className={`col-12 col-md-8 p-0 padding-window ${showChats ? "d-none d-md-block" : ""}`}
                >
                    <MatchingWindow />
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

export default HomePage;
