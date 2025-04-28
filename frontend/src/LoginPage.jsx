import Header from "./components/Header";
import LoginForm from "./components/LoginForm";

function LoginPage() {
    return (
        <div className="vh-100  justify-content-center align-items-center">
            <Header></Header>
            <div className="signup-overlay mt-5">
                <LoginForm />
            </div>
        </div>
    );
}
export default LoginPage;
