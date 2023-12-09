import React, { useEffect, useState } from 'react';
import logoImage from '../../Images/BookingLITELogo.png';
import { Link, useLocation } from 'react-router-dom';
import { getAuth, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, collection, getDoc, getFirestore } from 'firebase/firestore';


function Navbar() {
    const [user, setUser] = useState(null);
    const [hasBusiness, setHasBusiness] = useState(false);
    const [dataLoaded, setDataLoaded] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const auth = getAuth();

        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);

            // Check if the user has a business
            if (currentUser) {
                await checkBusinessListing(currentUser);
            }

            // Mark that data has been loaded
            setDataLoaded(true);
        });

        // Clean up the observer when the component unmounts
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        // Check the user's business status when the location changes
        if (user && dataLoaded) {
            checkBusinessListing(user);
        }
    }, [user, dataLoaded, location]);

    const checkBusinessListing = async (currentUser) => {
        const db = getFirestore();
        const topLevelCollections = ['Automotive', 'HairSalon', 'Barber', 'Meeting'];

        for (const collectionName of topLevelCollections) {
            const userDocRef = doc(collection(db, collectionName), currentUser.uid);
            const businessDocSnapshot = await getDoc(userDocRef);

            if (businessDocSnapshot.exists()) {
                setHasBusiness(true);
                return; // Exit the loop if a document is found
            }
        }

        // If no document is found in any collection
        setHasBusiness(false);
    };

    // Check if the user is on the jobtypes page
    const isJobTypesPage = location.pathname.includes('/add-job-types');

    const handleLogout = async () => {
        if (!isJobTypesPage) {
            const auth = getAuth();

            try {
                await signOut(auth);
            } catch (error) {
                console.error(error);
            }
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
                {dataLoaded && user ? (
                    <>
                        {hasBusiness ? (
                            // User has a business, display "Manage Business" link
                            <>
                                <li>
                                    {isJobTypesPage ? (
                                        <div>Manage Business</div>
                                    ) : (
                                        <Link to="/mybusinesses">Manage Business</Link>
                                    )}
                                </li>
                                <li>
                                    {isJobTypesPage ? (
                                        <div>Manage Bookings</div>
                                    ) : (
                                        <Link to="/manage">Manage Bookings</Link>
                                    )}
                                </li>
                            </>
                        ) : (
                            // User doesn't have a business, display "List Your Business" link
                            <li>
                                {isJobTypesPage ? (
                                    <div>List your business</div>
                                ) : (
                                    <Link to="/add">List your business</Link>
                                )}
                            </li>
                        )}
                        <li>
                            {isJobTypesPage ? (
                                <div>Log out</div>
                            ) : (
                                <Link to="/" onClick={handleLogout}>
                                    Log out
                                </Link>
                            )}
                        </li>
                    </>
                ) : (
                    // User is not signed in or data is still loading
                    <>
                        <li>
                            {isJobTypesPage ? (
                                <div>Sign In</div>
                            ) : (
                                <Link to="/login">Sign In</Link>
                            )}
                        </li>
                        <li>
                            {isJobTypesPage ? (
                                <div>Sign Up</div>
                            ) : (
                                <Link to="/register">Sign Up</Link>
                            )}
                        </li>
                    </>
                )}
            </ul>
        </nav>
    );
}

export default Navbar;
