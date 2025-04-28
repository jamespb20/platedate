import "bootstrap/dist/css/bootstrap.css";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import HomePage from "./HomePage";
import LandingPage from "./LandingPage";
import LoginPage from "./LoginPage";
import SignUpPage from "./SignUpPage";
import UserProfilePage from "./UserProfilePage";
import AdminPage from "./components/AdminPage.js";
import FAQ from "./components/FAQPage";
import Footer from "./components/Footer.jsx";
import Header from "./components/Header";
import PreferencePage from "./components/PreferencePage";
import ProfilePage from "./components/ProfilePage";
import SearchPage from "./components/SearchPage";
import "./index.css";
import reportWebVitals from "./reportWebVitals";

export default function App() {
    return (
        <BrowserRouter>
            <Header />
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/signup" element={<SignUpPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/profile" element={<UserProfilePage />} />
                <Route path="/home" element={<HomePage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/account" element={<ProfilePage />} />
                <Route path="/preferences" element={<PreferencePage />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/admin" element={<AdminPage />} />
            </Routes>
            <Footer />
        </BrowserRouter>
    );
}
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);

reportWebVitals();
