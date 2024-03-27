import React, { useEffect, useState } from 'react';
import { db } from '../../firebase.js';
import { collection, getDocs, query, orderBy, limit, startAfter } from 'firebase/firestore';
import { Link } from 'react-router-dom';

function BeautySalon() {
    const [allBarbers, setAllBarbers] = useState([]);
    const [displayBarbers, setDisplayBarbers] = useState([]);
    const [page, setPage] = useState(1);
    const barbersPerPage = 3;
    const [searchInput, setSearchInput] = useState('');
    const [selectedCounty, setSelectedCounty] = useState('');
    const [totalFilteredBarbers, setTotalFilteredBarbers] = useState(0);

    const counties = ['Antrim', 'Armagh', 'Carlow', 'Cavan', 'Clare', 'Cork', 'Derry', 'Donegal', 'Down', 'Dublin', 'Fermanagh', 'Galway', 'Kerry', 'Kildare', 'Kilkenny', 'Laois', 'Leitrim', 'Limerick', 'Longford', 'Louth', 'Mayo', 'Meath', 'Monaghan', 'Offaly', 'Roscommon', 'Sligo', 'Tipperary', 'Tyrone', 'Waterford', 'Westmeath', 'Wexford', 'Wicklow'];

    useEffect(() => {
        const fetchAllBarbers = async () => {
            const barbersCollection = collection(db, 'BeautySalon');
            const q = query(barbersCollection, orderBy('Name'));
            const snapshot = await getDocs(q);
            const barbers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setAllBarbers(barbers);
        };

        fetchAllBarbers();
    }, []);

    useEffect(() => {
        const filteredBarbers = allBarbers.filter(barber => {
            const searchLower = searchInput.toLowerCase();
            return (
                barber.County.toLowerCase().includes(selectedCounty.toLowerCase()) &&
                (barber.Name.toLowerCase().includes(searchLower) ||
                    barber.Street.toLowerCase().includes(searchLower) ||
                    barber.Town.toLowerCase().includes(searchLower) ||
                    barber.Eircode.toLowerCase().includes(searchLower))
            );
        });

        setTotalFilteredBarbers(filteredBarbers.length);
        const pageBarbers = filteredBarbers.slice((page - 1) * barbersPerPage, page * barbersPerPage);
        setDisplayBarbers(pageBarbers);
    }, [allBarbers, searchInput, selectedCounty, page]);

    const nextPage = () => {
        setPage(prev => prev + 1);
    };

    const prevPage = () => {
        setPage(prev => prev > 1 ? prev - 1 : 1);
    };

    const handleSearchChange = (e) => {
        setSearchInput(e.target.value);
        setPage(1); // Reset to the first page after a search
    };

    const handleCountyChange = (e) => {
        setSelectedCounty(e.target.value);
        setPage(1); // Reset to the first page after changing the filter
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
                            onChange={handleSearchChange}
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
                    {displayBarbers.map((hair) => (
                        <div key={hair.id} className="car-details">
                            <Link to={`/beautyinfo/${hair.id}`} className="car-detail">
                                Name: {hair.Name} <br />
                                Location: {hair.Street} {hair.Town} {hair.County} {hair.Eircode}
                            </Link>
                        </div>
                    ))}
                </div>
                <div className="pagination">
                    <button onClick={prevPage} disabled={page === 1}>Previous</button>
                    <button onClick={nextPage} disabled={((page * barbersPerPage) >= totalFilteredBarbers)}>Next</button>
                </div>
            </div>
        </div>
    );
}

export default BeautySalon;
