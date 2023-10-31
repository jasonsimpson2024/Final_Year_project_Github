import React from 'react';
import '../../Style.css';
import logoImage from '../../Images/BookingLITELogo.png'; // Import your logo image

function Navbar() {
    return (
        <nav className="navbar">
            <div className="logo">
                <img src={logoImage} alt="Logo" />
            </div>
            <ul className="navbar-menu">
                <li><a href="/">Home</a></li>
                <li><a href="/book">Book</a></li>
            </ul>
        </nav>
    );
}

export default Navbar;
