import Header from "./components/Header";
import SignUpForm from "./components/SignUpForm";

function SignUpPage() {
    return (
        <div className="vh-100  justify-content-center align-items-center">
            <Header></Header>

            <div className="signup-overlay">
                <SignUpForm />
            </div>
        </div>
    );
}
export default SignUpPage;
