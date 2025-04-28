import { render, screen } from "@testing-library/react";
import LandingPage from "./LandingPage";

test("renders learn react link", () => {
    render(<LandingPage />);
    const linkElement = screen.getByText(/love at first bite/i);
    expect(linkElement).toBeInTheDocument();
});
