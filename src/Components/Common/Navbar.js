import React, {useEffect, useState} from 'react';
import '../../Style.css';
import logoImage from '../../Images/BookingLITELogo.png'; // Import your logo image
import { getAuth, signOut, onAuthStateChanged } from 'firebase/auth';
import {Link} from 'react-router-dom'

function Navbar() {
    const [user, setUser] = useState(null);

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
        <nav className="navbar">
            <div className="logo">
                <Link to="/">
                    <img src={logoImage} alt="Logo" />
                </Link>
            </div>
            <ul className="navbar-menu">
                {user ? (
                    // User is signed in, display "Manage Bookings" link
                    <>
                  <li>
                      <Link to="/add">List your business</Link>
                  </li>
                    <li>
                        <Link to="/manage">Manage Bookings</Link>
                    </li>

                    <li>
                        <Link to="/" onClick={handleLogout}>Log out</Link>
                    </li>
                    </>

                ) : (
                    // User is not signed in, display "Sign In" and "Sign Up" links
                    <>
                        <li>
                            <Link to="/login">Sign In</Link>
                        </li>
                        <li>
                            <Link to="/register">Sign Up</Link>
                        </li>
                    </>
                )}
            </ul>
        </nav>
    );
}

export default Navbar;