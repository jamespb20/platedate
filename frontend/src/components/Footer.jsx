import React from "react";

function Footer() {
    const year = new Date().getFullYear();

    return (
        <footer className="footer text-white-50 py-3">
            <div className="mx-auto text-center  ">
                <small>&copy; {year} PlateDate. All rights reserved.</small>
                <br />
                <a href="mailto:info@platedate.lol">Request account deletion:</a>
            </div>
        </footer>
    );
}

export default Footer;
