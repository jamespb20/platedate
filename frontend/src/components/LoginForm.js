import React, { useState } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import "./Form.css";
const API_URL = process.env.REACT_APP_API_URL;

function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleEmailChange = e => {
        setEmail(e.target.value);
    };

    const handlePasswordChange = e => {
        setPassword(e.target.value);
    };

    const handleSubmit = e => {
        e.preventDefault();
        const user = { email, password };

        fetch(API_URL + "/auth/login", {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(user)
        })
            .then(async response => {
                const data = await response.json();
                if (response.ok) {
                    if (data.message === "Login successful, admin") {
                        window.location.href = "/admin";
                    }

                    if (data.message === "Login successful") {
                        window.location.href = "/home";
                    }

                    if (data.message === "User is banned") {
                        alert(
                            "You are banned from the site. Please contact an admin for more information."
                        );
                    }
                } else {
                    let responseJSON = await response.json();
                    alert(responseJSON.error);
                }
            })
            .catch(error => {
                alert("Failed to sign in. Please check email and password.");
            });
    };

    return (
        <div className="container white-box">
            <div className="row justify-content-center">
                <div className="col-lg-6">
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3" controlId="inputEmail">
                            <Form.Label>Email address</Form.Label>
                            <Form.Control
                                type="email"
                                placeholder="name@example.com"
                                value={email}
                                onChange={handleEmailChange}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="inputPassword">
                            <Form.Label>Password</Form.Label>
                            <Form.Control
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={handlePasswordChange}
                            />
                        </Form.Group>

                        <Button variant="primary" size="lg" className="w-100" type="submit">
                            Login
                        </Button>
                        <a href="/signup" className="slogan text-decoration-none mt-2">
                            or Sign Up
                        </a>
                    </Form>
                </div>
            </div>
        </div>
    );
}

export default LoginForm;
