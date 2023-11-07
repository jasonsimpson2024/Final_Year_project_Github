import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAuth, signOut, onAuthStateChanged } from 'firebase/auth';

function Welcome() {
    const [user, setUser] = useState(null); // To store the user's authentication status

    useEffect(() => {
        const auth = getAuth();

        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser); // Update the user state when authentication state changes
        });

        // Clean up the observer when the component unmounts
        return () => unsubscribe();
    }, []);

    const handleLogout = async () => {
        const auth = getAuth();

        try {
            await signOut(auth);
        } catch (error) {
            console.error(error);
        }
    };

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
            </div>
        </div>
    );
}

export default Welcome;
