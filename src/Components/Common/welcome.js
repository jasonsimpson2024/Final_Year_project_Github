import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import '../../Welcome.css';

function Welcome() {
    const [user, setUser] = useState(null); // To store the user's authentication status

    useEffect(() => {
        const auth = getAuth();

        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser); // Update the user state when authentication state changes
            console.log(user);
        });

        // Clean up the observer when the component unmounts
        return () => unsubscribe();
    });


    return (
        <div>
            <div className="welcome-container">
                <h2>Welcome to BookingLite</h2>
                <h3>Booking Made Easy</h3>
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
                    <Link to="/Beautysalon">
                        <button className="action-button">Beauty Salons</button>
                    </Link>
                </div>
            </div>
            <footer>Jason Simpson FYP 2023/24</footer>
        </div>
    );

}

export default Welcome;
