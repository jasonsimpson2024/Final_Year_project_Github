import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function BookingConfirmation() {
    const location =useLocation();
    const { name, jobType, selectedSlot } = location.state;

    return (
        <div className="booking-confirmation">
            <div className="booking-container">
                <h3>Your booking has been confirmed!</h3>
                <p>Name: {name}</p>
                <p>Selected Slot: {selectedSlot}</p>
            </div>
            <Link to="/">
                <button className="action-button">Home</button>
            </Link>
        </div>
    );
}

export default BookingConfirmation;
