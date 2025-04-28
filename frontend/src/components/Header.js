import { useEffect, useState } from "react";
import { NavDropdown } from "react-bootstrap";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { Link } from "react-router-dom";
import PlateDateLogo from "../PlateDate_logo.png";
import "./Header.css";
const API_URL = process.env.REACT_APP_API_URL;

function Header() {
    const [logged, setLogged] = useState(false);
    const [showReports, setShowReports] = useState(false);
    useEffect(() => {
        fetch(`${API_URL}/auth`, {
            method: "GET",
            credentials: "include"
        })
            .then(response => {
                if (response.ok) {
                    setLogged(true);
                    return response.json();
                }
            })
            .then(data => {
                if (data.isAdmin) {
                    setShowReports(true);
                } else {
                    setShowReports(false);
                }
            })
            .catch(error => {
                console.error("Error fetching data:", error);
            });
    }, []);

    return (
        <Navbar fixed="top" data-bs-theme="dark" expand="lg" className="custom-navbar">
            <div>
                <Navbar.Brand as={Link} to="/">
                    <img
                        src={PlateDateLogo}
                        height="105"
                        className="d-inline-block w-auto"
                        alt="PlateDate Logo"
                    />
                    PlateDate
                </Navbar.Brand>
            </div>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
                <div className="navbar-details ms-auto primary-text-colour">
                    <Nav className="ms-auto">
                        <Nav.Link href="/home">Home</Nav.Link>
                        {!logged ? (
                            <>
                                <Nav.Link href="/signup">Sign Up</Nav.Link>
                                <Nav.Link href="/login">Login</Nav.Link>
                                <Nav.Link href="/faq">FAQ</Nav.Link>
                            </>
                        ) : (
                            <>
                                <NavDropdown title="Profile" id="basic-nav-dropdown">
                                    <NavDropdown.Item href="/profile">My Profile</NavDropdown.Item>
                                    <NavDropdown.Item href="/account">
                                        Edit Profile
                                    </NavDropdown.Item>
                                    <NavDropdown.Item href="/preferences">
                                        Edit Preferences
                                    </NavDropdown.Item>
                                </NavDropdown>
                                <Nav.Link href="/search">Search</Nav.Link>
                                <Nav.Link href="/faq">FAQ</Nav.Link>
                                {showReports && <Nav.Link href="/report">Reports</Nav.Link>}
                                <Nav.Link href={`${API_URL}/auth/signout`}>Sign Out</Nav.Link>
                            </>
                        )}
                    </Nav>
                </div>
            </Navbar.Collapse>
        </Navbar>
    );
}

export default Header;
