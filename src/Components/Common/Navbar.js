import React, { useEffect, useState } from 'react';
import logoImage from '../../Images/BookingLITELogo.png';
import { Link, useLocation } from 'react-router-dom';
import { getAuth, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, getFirestore } from 'firebase/firestore';

function Navbar() {
    const [user, setUser] = useState(null);
    const [hasBusiness, setHasBusiness] = useState(false); //state to manage if the user has a business
    const [isCustomer, setIsCustomer] = useState(false); // state to manage if the user is a customer
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

            if (currentUser) {
                await checkBusinessListing(currentUser);
                await checkCustomerStatus(currentUser.uid); // check if the user is a customer
            }

            setDataLoaded(true);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (user && dataLoaded) {
            checkBusinessListing(user);
        }
    }, [user, dataLoaded, location]);

    const checkBusinessListing = async (currentUser) => {
        const db = getFirestore();
        const topLevelCollections = ['Automotive', 'HairSalon', 'Barber', 'BeautySalon', 'SPA', 'Other'];

        for (const collectionName of topLevelCollections) {
            const userDocRef = doc(db, collectionName, currentUser.uid);
            const businessDocSnapshot = await getDoc(userDocRef);

            if (businessDocSnapshot.exists()) {
                setHasBusiness(true);
                return;
            }
        }

        setHasBusiness(false);
    };

    const checkCustomerStatus = async (uid) => {
        const db = getFirestore();
        const docRef = doc(db, "Customers", uid);
        const docSnap = await getDoc(docRef);

        setIsCustomer(docSnap.exists());
    };

    const handleLogout = async () => {
        const auth = getAuth();

        try {
            await signOut(auth);
        } catch (error) {
            console.error(error);
        }
    };

    const isJobTypesPage = location.pathname.includes('/add-job-types');

    return (
        <nav className={`navbar ${scrollPosition > 50 ? 'less-transparent' : ''}`}>
            <div className="logo">
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
                        {hasBusiness && !isCustomer ? ( // if business account has business
                            <>
                                <li>
                                    {isJobTypesPage ? (
                                        <div className="navfont">Manage Business</div>
                                    ) : (
                                        <Link to="/mybusinesses">Manage Business</Link>
                                    )}
                                </li>
                            </>
                        ) : null}
                        {!hasBusiness && !isCustomer ? ( //if business account and hasn't business
                            <li>
                                {isJobTypesPage ? (
                                    <div className="navfont">List your business</div>
                                ) : (
                                    <Link to="/add">List your business</Link>
                                )}
                            </li>
                        ) : null}
                        {isCustomer ? ( // if they are a customer account
                            <>
                                <li>
                                    <Link to="/Myappointments">My Appointments</Link>
                                </li>
                            </>
                        ) : null}
                        <li>
                            <Link to="/" onClick={handleLogout}>
                                Log out
                            </Link>
                        </li>
                    </>
                ) : ( //if not signed in ..
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
