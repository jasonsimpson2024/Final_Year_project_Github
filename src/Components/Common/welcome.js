import React from 'react';
import { Link } from 'react-router-dom';

function Welcome() {
    return (
        <div className="welcome-container">
            <h1>Welcome to BookingLite</h1>
            <div className="buttons">
                <Link to="/Automotive">
                    <button className="action-button">Browse Automotive Services</button>
                </Link>
                <Link to="/Hairsalon">
                    <button className="action-button">Browse Hair Salons</button>
                </Link>
                <Link to="/Barbers">
                    <button className="action-button">Browse Barber shops</button>
                </Link>
            </div>
        </div>
    );
}

export default Welcome;
