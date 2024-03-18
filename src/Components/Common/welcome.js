import React, { useState, useEffect } from 'react';
import { db } from '../../firebase.js';
import { collection, getDocs } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import "../../Welcome.css";
import { debounce } from 'lodash'; // Import debounce from lodash

function Welcome() {
    const [searchInput, setSearchInput] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const searchCollections = ['Automotive', 'HairSalon', 'Barber', 'BeautySalon', 'Other', 'SPA'];

    const handleSearch = async () => {
        if (!searchInput.trim()) {
            setSearchResults([]);
            return;
        }

        setIsLoading(true);
        const results = [];
        const searchLower = searchInput.toLowerCase();

        try {
            for (const collectionName of searchCollections) {
                const collRef = collection(db, collectionName);
                const snapshot = await getDocs(collRef);
                snapshot.docs.forEach((doc) => {
                    const data = doc.data();
                    if (data.Name.toLowerCase().includes(searchLower) ||
                        data.Street.toLowerCase().includes(searchLower) ||
                        data.County.toLowerCase().includes(searchLower) ||
                        data.Town.toLowerCase().includes(searchLower) ||
                        data.Eircode.toLowerCase().includes(searchLower)) {
                        const path = collectionName === 'Automotive' ? `/autoinfo/${doc.id}` :
                            collectionName === 'HairSalon' ? `/saloninfo/${doc.id}` :
                                collectionName === 'Barber' ? `/barberinfo/${doc.id}` :
                                    `/beautyinfo/${doc.id}`;
                        results.push({ ...data, id: doc.id, path });
                    }
                });
            }
            setSearchResults(results);
        } catch (error) {
            console.error("Error searching documents:", error);
        }
        setIsLoading(false);
    };

    // Debounce the handleSearch function
    const debouncedSearch = debounce(() => {
        handleSearch();
    }, 300); // 300ms delay

    useEffect(() => {
        debouncedSearch();

        // Cleanup
        return () => {
            debouncedSearch.cancel();
        };
    }, [searchInput]); // Effect dependencies

    return (
        <div className="welcome-container">
            <div className="welcome-box">
                <h2>Welcome to BookingLITE</h2>
                <h3>Booking Made Easy</h3>
                <div className="search-bar-dropdown">
                    <input
                        type="text"
                        placeholder="Search for businesses..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                    />
                    <div className="search-results-dropdown">
                        {isLoading ? (
                            <div>Loading...</div>
                        ) : (
                            searchResults.map((result) => (
                                <Link key={result.id} to={result.path} className="search-result-link">
                                    {result.Name} - {result.Street} {result.Town} {result.County} {result.Eircode}
                                </Link>
                            ))
                        )}
                    </div>
                </div>
                <div className="buttons">
                    <Link to="/Automotive">
                        <button className="action-button">Automotive Services</button>
                    </Link>
                    <Link to="/hairsalon">
                        <button className="action-button">Hair Salons</button>
                    </Link>
                    <Link to="/barbers">
                        <button className="action-button">Barber Shops</button>
                    </Link>
                    <Link to="/beautysalon">
                        <button className="action-button">Beauty Salons</button>
                    </Link>
                    <Link to="/spa">
                        <button className="action-button">Spa & Massage</button>
                    </Link>

                    <Link to="/other">
                        <button className="action-button">More Services</button>
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default Welcome;
