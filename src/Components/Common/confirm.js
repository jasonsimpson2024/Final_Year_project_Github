import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function BookingConfirmation() {
    const location =useLocation();
    const { name, selectedSlot } = location.state;

    return (
        <div className="booking-confirmation">
            <div className="booking-container">
                <h3>Your booking has been confirmed!</h3>
                <p>Selected Slot: {selectedSlot}</p>
                <p>A booking confirmation has been emailed to you.</p>
                <Link to="/">
                    <button className="confirm-button">Home</button>
                </Link>
            </div>
        </div>
    );
}

export default BookingConfirmation;
