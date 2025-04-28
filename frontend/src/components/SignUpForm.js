import React, { useState } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import "./Form.css";

const API_URL = process.env.REACT_APP_API_URL;

function SignUpForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordsMatch, setPasswordsMatch] = useState(true);
    const [passwordFormat, setPasswordFormat] = useState(true);
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,50}$/;

    const handleChange = e => {
        const { name, value } = e.target;
        if (name === "email") {
            setEmail(value);
        } else if (name === "password") {
            setPassword(value);
            setPasswordFormat(passwordRegex.test(value));
            setPasswordsMatch(value === confirmPassword);
        } else if (name === "confirmPassword") {
            setConfirmPassword(value);
            setPasswordsMatch(password === value);
        }
    };

    const handleSubmit = async e => {
        e.preventDefault();

        if (!passwordsMatch || !passwordFormat) {
            return;
        }

        const user = { email, password };

        try {
            const response = await fetch(`${API_URL}/auth/signup`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(user)
            });

            if (response.ok) {
                window.location.href = "/account";
            } else {
                const resp = await response.json();
                alert(resp.error);
            }
        } catch (error) {
            console.error("Error during fetch:", error);
            alert("Failed to sign up. Please check email.");
        }
    };

    return (
        <div className="container white-box">
            <div className="row justify-content-center">
                <div className="col-lg-6">
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3" controlId="formEmail">
                            <Form.Label>Email address</Form.Label>
                            <Form.Control
                                type="email"
                                placeholder="name@example.com"
                                name="email"
                                value={email}
                                onChange={handleChange}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formPassword">
                            <Form.Label>Password</Form.Label>
                            <Form.Control
                                type="password"
                                placeholder="Password"
                                name="password"
                                value={password}
                                onChange={handleChange}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formConfirmPassword">
                            <Form.Label>Confirm Password</Form.Label>
                            <Form.Control
                                type="password"
                                placeholder="Confirm Password"
                                name="confirmPassword"
                                value={confirmPassword}
                                onChange={handleChange}
                            />
                            <div
                                className="text-left text-danger"
                                style={{ textAlign: "left", fontSize: "small" }}
                            >
                                {!passwordsMatch && <p>Passwords do not match</p>}
                                {!passwordFormat && (
                                    <p>
                                        Password must be between 8-50 characters and contain an
                                        uppercase, lowercase, number, and special character.
                                    </p>
                                )}
                            </div>
                        </Form.Group>

                        <Button
                            variant="primary"
                            size="lg"
                            className="w-100"
                            type="submit"
                            disabled={!passwordsMatch || !passwordFormat}
                        >
                            Sign Up
                        </Button>
                        <a href="/login" className="slogan text-decoration-none mt-2">
                            or Login
                        </a>
                    </Form>
                </div>
            </div>
        </div>
    );
}

export default SignUpForm;
