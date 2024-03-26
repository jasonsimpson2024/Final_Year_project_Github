import React, { useState, useEffect } from 'react';
import { db } from '../../firebase.js';
import { collection, getDocs } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import "../../Welcome.css";
import { debounce } from 'lodash';

function Welcome() {
    const [searchInput, setSearchInput] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const searchCollections = ['Automotive', 'HairSalon', 'Barber', 'BeautySalon', 'Other', 'SPA'];

    const handleSearch = async () => {
        // check if the search input is empty or consists only of whitespace.
        // if so, clear the search results and exit the function.
        if (!searchInput.trim()) {
            setSearchResults([]);
            return;
        }
        // indicates that a search operation is in progress.
        setIsLoading(true);

        // initialize an empty array to hold the search results.
        const results = [];

        // convert the search input to lowercase for case-insensitive comparison.
        const searchLower = searchInput.toLowerCase();

        try {
            // iterate over each collection name specified in searchCollections.
            for (const collectionName of searchCollections) {
                // reference to the collection in the database.
                const collRef = collection(db, collectionName);

                // fetch all documents in the collection.
                const snapshot = await getDocs(collRef);

                // iterate over each document in the collection.
                snapshot.docs.forEach((doc) => {
                    // retrieve the document's data.
                    const data = doc.data();

                    // check if any of the specified fields in the document
                    // contain the search input.
                    if (data.Name.toLowerCase().includes(searchLower) ||
                        data.Street.toLowerCase().includes(searchLower) ||
                        data.County.toLowerCase().includes(searchLower) ||
                        data.Town.toLowerCase().includes(searchLower) ||
                        data.Eircode.toLowerCase().includes(searchLower)) {

                        // determine the path based on the collection name.
                        // this path is used in navigation to display the details of the search result.
                        const path = collectionName === 'Automotive' ? `/autoinfo/${doc.id}` :
                            collectionName === 'HairSalon' ? `/saloninfo/${doc.id}` :
                                collectionName === 'Barber' ? `/barberinfo/${doc.id}` :
                                    `/beautyinfo/${doc.id}`;

                        // add the document's data, its ID, and the determined path to the search results.
                        results.push({ ...data, id: doc.id, path });
                    }
                });
            }
            // update the state with the new search results.
            setSearchResults(results);
        } catch (error) {
            // log if any errors occur during the search.
            console.error("Error searching documents:", error);
        }
        // indicate that the search operation has completed.
        setIsLoading(false);
    };

// using debounce function to limit how often handleSearch is called.
// this improves performance and prevents over-fetching from the database.
    const debouncedSearch = debounce(() => {
        handleSearch();
    }, 300); // delay the search function call by 300 milliseconds after the last call.

// use the useEffect hook to perform the search whenever the searchInput changes.
    useEffect(() => {
        debouncedSearch();

        // function to cancel any in-flight debounced search operations
        // when the component unmounts or before the next effect runs.
        return () => {
            debouncedSearch.cancel();
        };
    }, [searchInput]); // effect depends on changes to searchInput.


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
