import React from 'react';
import '../../App.css';

function Navbar() {
    return (
        <nav className="navbar">
            <ul className="navbar-menu">
                <li><a href="/home">Home</a></li>
                <li><a href="/">Sign out</a></li>
            </ul>
        </nav>
    );
}

export default Navbar;
