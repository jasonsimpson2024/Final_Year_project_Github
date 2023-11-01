import React from 'react';
import '../../Style.css';
import logoImage from '../../Images/BookingLITELogo.png'; // Import your logo image

function Navbar() {
    return (
        <nav className="navbar">
            <div className="logo">
                <a href="/">
                    <img src={logoImage} alt="Logo" />
                </a>
            </div>
        </nav>
    );
}

export default Navbar;
