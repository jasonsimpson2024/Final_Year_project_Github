import React, { useEffect, useState } from 'react';
import { db } from '../../firebase.js';
import { collection, getDocs, query, orderBy, limit, startAfter } from 'firebase/firestore';
import { Link } from 'react-router-dom';

function HairSalon() {
    const [carData, setCarData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [page, setPage] = useState(1);
    const carsPerPage = 5;
    const [lastDocumentName, setLastDocumentName] = useState(null);
    const [hasMoreCars, setHasMoreCars] = useState(true);
    const [searchInput, setSearchInput] = useState('');
    const [selectedCounty, setSelectedCounty] = useState('');

    // List of counties in Ireland
    const counties = ['Antrim', 'Armagh', 'Carlow', 'Cavan', 'Clare', 'Cork', 'Derry', 'Donegal', 'Down', 'Dublin', 'Fermanagh', 'Galway', 'Kerry', 'Kildare', 'Kilkenny', 'Laois', 'Leitrim', 'Limerick', 'Longford', 'Louth', 'Mayo', 'Meath', 'Monaghan', 'Offaly', 'Roscommon', 'Sligo', 'Tipperary', 'Tyrone', 'Waterford', 'Westmeath', 'Wexford', 'Wicklow'];

    useEffect(() => {
        const fetchData = async (pageNumber) => {
            try {
                const carsCollection = collection(db, 'HairSalon');
                let q = query(carsCollection, orderBy('Name'), limit(carsPerPage));

                if (pageNumber > 1 && lastDocumentName) {
                    q = query(carsCollection, orderBy('Name'), startAfter(lastDocumentName), limit(carsPerPage));
                }

                const snapshot = await getDocs(q);

                const newCarData = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    Name: doc.data().Name,
                    Street: doc.data().Street,
                    Town: doc.data().Town,
                    County: doc.data().County,
                    Eircode: doc.data().Eircode,
                }));

                setCarData(newCarData);

                if (newCarData.length > 0) {
                    const lastCar = newCarData[newCarData.length - 1];
                    setLastDocumentName(lastCar.Name);
                    setHasMoreCars(newCarData.length === carsPerPage);
                } else {
                    setHasMoreCars(false);
                }

                // Apply filters based on search criteria and selected county
                const filtered = newCarData.filter((hair) => {
                    const searchLower = searchInput.toLowerCase();
                    return (
                        (hair.Name.toLowerCase().includes(searchLower) ||
                            hair.Street.toLowerCase().includes(searchLower) ||
                            hair.Town.toLowerCase().includes(searchLower) ||
                            hair.County.toLowerCase().includes(searchLower) ||
                            hair.Eircode.toLowerCase().includes(searchLower)) &&
                        hair.County.toLowerCase().includes(selectedCounty.toLowerCase())
                    );
                });

                setFilteredData(filtered);
            } catch (error) {
                console.error('Error fetching data:', error);
                setHasMoreCars(false);
            }
        };

        fetchData(page);
    }, [page, searchInput, selectedCounty]);

    const nextPage = () => {
        if (hasMoreCars) {
            setPage(page + 1);
        }
    };

    const prevPage = () => {
        if (page > 1) {
            if (page === 2) {
                setLastDocumentName(null);
            }
            setPage(page - 1);
        }
    };

    const handleCountyChange = (e) => {
        setSelectedCounty(e.target.value);
    };

    return (
        <div>
            <div className='page-header'>
                <div className="header-buttons">
                    <div className='search-bar'>
                        <input
                            type="text"
                            placeholder="Browse services"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                        />
                    </div>
                    <div className='dropdown-menu'>
                        <select onChange={handleCountyChange} value={selectedCounty}>
                            <option value="">Filter by County</option>
                            {counties.map(county => (
                                <option key={county} value={county}>{county}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="car-details-list">
                    {filteredData.map((hair) => (
                        <div key={hair.id} className="car-details">
                            <Link to={`/saloninfo/${hair.id}`} className="car-detail">
                                Name: {hair.Name} <br />
                                Location: {hair.Street} {hair.Town} {hair.County} {hair.Eircode}
                            </Link>
                        </div>
                    ))}
                </div>
                <div className="pagination">
                    <button onClick={prevPage} disabled={page === 1}>Previous</button>
                    <button onClick={nextPage} disabled={!hasMoreCars}>Next</button>
                </div>
            </div>
        </div>
    );
}

export default HairSalon;
