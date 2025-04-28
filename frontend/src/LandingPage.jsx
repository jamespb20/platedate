import Button from "react-bootstrap/Button";

import { Link } from "react-router-dom";
import chef from "./chef.gif";
import Testimonials from "./components/Testimonials";

function LandingPage() {
    return (
        <div className="landing-page container-fluid mt-lg-5 pt-lg-4 mt-4">
            <div className="d-flex flex-column flex-lg-row justify-content-center align-content-center">
                <div className="justify-content-center chef-section align-self-center align-self-md-start  ">
                    <img src={chef} alt="Landing header" className="mt-4 chef-video" />
                </div>
                <div className="signup-section">
                    <div className="signup-content">
                        <h1 className="h1-xl">PlateDate</h1>
                        <p className="slogan secondary-text-colour">Love at First Bite</p>
                        <Link to="/signup">
                            <Button
                                size="md"
                                className="cherry-button sign-up-btn primary-button-colour"
                            >
                                Sign Up
                            </Button>
                        </Link>
                        <br></br>
                        <Link to="/login">
                            <Button size="md" className="log-in-btn primary-button-colour">
                                Log In
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            <hr />

            <div className="about-section shadow-sm bg-white rounded">
                <h2 className="about-heading text-center">About PlateDate</h2>
                <div className="row">
                    <div className="mx-auto">
                        <p className="about-text">
                            At PlateDate, we promise to find your perfect match with our innovative
                            approach to dating. Say goodbye to awkward first dates! With PlateDate,
                            you'll share a love for food and fun from the very start. Our unique
                            algorithm factors in your culinary preferences and dietary needs,
                            ensuring a delightful first meal together.
                        </p>
                    </div>
                </div>
            </div>

            <Testimonials />
        </div>
    );
}
export default LandingPage;
