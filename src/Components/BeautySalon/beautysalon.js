import React, { useEffect, useState } from 'react';
import { db } from '../../firebase.js';
import { collection, getDocs, query, orderBy, limit, startAfter } from 'firebase/firestore';
import { Link } from 'react-router-dom';

function BeautySalon() {
    const [beautyData, setBeautyData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [page, setPage] = useState(1);
    const salonsPerPage = 5;
    const [lastDocumentName, setLastDocumentName] = useState(null);
    const [hasMoreSalons, setHasMoreSalons] = useState(true);
    const [searchInput, setSearchInput] = useState('');
    const [selectedCounty, setSelectedCounty] = useState('');

    // List of counties in Ireland
    const counties = ['Antrim', 'Armagh', 'Carlow', 'Cavan', 'Clare', 'Cork', 'Derry', 'Donegal', 'Down', 'Dublin', 'Fermanagh', 'Galway', 'Kerry', 'Kildare', 'Kilkenny', 'Laois', 'Leitrim', 'Limerick', 'Longford', 'Louth', 'Mayo', 'Meath', 'Monaghan', 'Offaly', 'Roscommon', 'Sligo', 'Tipperary', 'Tyrone', 'Waterford', 'Westmeath', 'Wexford', 'Wicklow'];

    useEffect(() => {
        const fetchData = async (pageNumber) => {
            try {
                const beautyCollection = collection(db, 'BeautySalon');
                let q = query(beautyCollection, orderBy('Name'), limit(salonsPerPage));

                if (pageNumber > 1 && lastDocumentName) {
                    q = query(beautyCollection, orderBy('Name'), startAfter(lastDocumentName), limit(salonsPerPage));
                }

                const snapshot = await getDocs(q);

                const newBeautyData = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    Name: doc.data().Name,
                    Street: doc.data().Street,
                    Town: doc.data().Town,
                    County: doc.data().County,
                    Eircode: doc.data().Eircode,
                }));

                setBeautyData(newBeautyData);

                if (newBeautyData.length > 0) {
                    const lastSalon = newBeautyData[newBeautyData.length - 1];
                    setLastDocumentName(lastSalon.Name);
                    setHasMoreSalons(newBeautyData.length === salonsPerPage);
                } else {
                    setHasMoreSalons(false);
                }

                // Filter data based on search input and selected county
                const filtered = newBeautyData.filter((salon) => {
                    const searchLower = searchInput.toLowerCase();
                    return (
                        salon.County.toLowerCase().includes(selectedCounty.toLowerCase()) &&
                        (salon.Name.toLowerCase().includes(searchLower) ||
                            salon.Street.toLowerCase().includes(searchLower) ||
                            salon.Town.toLowerCase().includes(searchLower) ||
                            salon.Eircode.toLowerCase().includes(searchLower))
                    );
                });

                setFilteredData(filtered);
            } catch (error) {
                console.error('Error fetching data:', error);
                setHasMoreSalons(false);
            }
        };

        fetchData(page);
    }, [page, searchInput, selectedCounty]);

    const nextPage = () => {
        if (hasMoreSalons) {
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
                    {filteredData.map((salon) => (
                        <div key={salon.id} className="car-details">
                            <Link to={`/beautyinfo/${salon.id}`} className="car-detail">
                                Name: {salon.Name} <br />
                                Location: {salon.Street} {salon.Town} {salon.County} {salon.Eircode}
                            </Link>
                        </div>
                    ))}
                </div>
                <div className="pagination">
                    <button onClick={prevPage} disabled={page === 1}>Previous</button>
                    <button onClick={nextPage} disabled={!hasMoreSalons}>Next</button>
                </div>
            </div>
        </div>
    );
}

export default BeautySalon;
