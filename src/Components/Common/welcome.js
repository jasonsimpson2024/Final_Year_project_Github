import React from 'react';
import { Link } from 'react-router-dom';

function Welcome() {
    return (
        <div className="welcome-container">
            <h1>Welcome to BookingLite</h1>
            <h2>Browse</h2>
            <div className="buttons">
                <Link to="/Automotive">
                    <button className="action-button">Automotive Services</button>
                </Link>
                <Link to="/Hairsalon">
                    <button className="action-button">Hair Salons</button>
                </Link>
                <Link to="/Barbers">
                    <button className="action-button">Barber shops</button>
                </Link>
                <Link to="/add">
                    <button className="action-button">List your business</button>
                </Link>
            </div>
        </div>
    );
}

export default Welcome;
