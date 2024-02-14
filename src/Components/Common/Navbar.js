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
    const [scrollPosition, setScrollPosition] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const position = window.pageYOffset;
            setScrollPosition(position);
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

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
        const topLevelCollections = ['Automotive', 'HairSalon', 'Barber', 'BeautySalon'];

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
        <nav className={`navbar ${scrollPosition > 100 ? 'less-transparent' : ''}`}>
            <div className="logo">
                {/* Render Link or div based on isJobTypesPage */}
                {isJobTypesPage ? (
                    <div>
                        <img src={logoImage} alt="Logo" />
                    </div>
                ) : (
                    <Link to="/">
                        <img src={logoImage} alt="Logo" />
                    </Link>
                )}
            </div>
            <ul className="navbar-menu">
                {dataLoaded && user ? (
                    <>
                        {hasBusiness ? (
                            <>
                                <li>
                                    {isJobTypesPage ? (
                                        <div className="navfont">Manage Business</div>
                                    ) : (

                                        <Link to="/mybusinesses">Manage Business</Link>
                                    )}
                                </li>
                            </>
                        ) : (
                            <li>
                                {isJobTypesPage ? (
                                    <div className="navfont">List your business</div>
                                ) : (
                                    <Link to="/add">List your business</Link>
                                )}
                            </li>
                        )}

                        <li>
                            {isJobTypesPage ? (
                                <div className="navfont">Manage Bookings</div>
                            ) : (
                                <Link to="/Myappointments">My Appointments</Link>
                            )}
                        </li>
                        <li>
                            {isJobTypesPage ? (
                                <div className="navfont">Log out</div>
                            ) : (
                                <Link to="/" onClick={handleLogout}>
                                    Log out
                                </Link>
                            )}
                        </li>
                    </>
                ) : (
                    <>
                        <li>
                            {isJobTypesPage ? (

                                <div className="navfont">Sign In</div>
                            ) : (
                                <div className="signinfont">
                                <Link to="/login">Sign In</Link>
                                </div>

                            )}
                        </li>
                        <li>
                            {isJobTypesPage ? (
                                <div className="navfont">Sign Up</div>
                            ) : (
                                <div className="signinfont">
                                <Link to="/register">Sign Up</Link>
                                </div>
                            )}
                        </li>
                    </>
                )}
            </ul>
        </nav>
    );
}

export default Navbar;
