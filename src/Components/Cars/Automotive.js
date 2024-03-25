import React, { useEffect, useState } from 'react';
import { db } from '../../firebase.js';
import { collection, getDocs, query, orderBy, limit, startAfter } from 'firebase/firestore';
import { Link } from 'react-router-dom';

function Automotive() {
    const [carData, setCarData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [page, setPage] = useState(1);
    const carsPerPage = 3;
    const [lastDocumentName, setLastDocumentName] = useState(null);
    const [hasMoreCars, setHasMoreCars] = useState(true);
    const [searchInput, setSearchInput] = useState('');
    const [selectedCounty, setSelectedCounty] = useState('');

    const counties = ['Antrim', 'Armagh', 'Carlow', 'Cavan', 'Clare', 'Cork', 'Derry', 'Donegal', 'Down', 'Dublin', 'Fermanagh', 'Galway', 'Kerry', 'Kildare', 'Kilkenny', 'Laois', 'Leitrim', 'Limerick', 'Longford', 'Louth', 'Mayo', 'Meath', 'Monaghan', 'Offaly', 'Roscommon', 'Sligo', 'Tipperary', 'Tyrone', 'Waterford', 'Westmeath', 'Wexford', 'Wicklow'];

    useEffect(() => {
        const fetchData = async (pageNumber) => {
            try {
                const carsCollection = collection(db, 'Automotive');
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

                // filter data based on search input and selected county
                const searchLower = searchInput.toLowerCase();
                const filtered = newCarData.filter(car =>
                    car.County.toLowerCase().includes(selectedCounty.toLowerCase()) &&
                    (car.Name.toLowerCase().includes(searchLower) ||
                        car.Street.toLowerCase().includes(searchLower) ||
                        car.Town.toLowerCase().includes(searchLower) ||
                        car.Eircode.toLowerCase().includes(searchLower))
                );
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
                    {filteredData.map((car) => (
                        <div key={car.id} className="car-details">
                            <Link to={`/autoinfo/${car.id}`} className="car-detail">
                                Name: {car.Name} <br />
                                Location: {car.Street} {car.Town} {car.County} {car.Eircode}
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

export default Automotive;
