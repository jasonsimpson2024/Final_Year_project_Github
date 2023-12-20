import React, { useEffect, useState } from 'react';
import { db } from '../../firebase.js';
import { collection, getDocs, query, orderBy, limit, startAfter } from 'firebase/firestore';
import { Link } from 'react-router-dom';

function Barber() {
    const [barberData, setBarberData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [page, setPage] = useState(1);
    const barbersPerPage = 5;
    const [lastDocumentName, setLastDocumentName] = useState(null);
    const [hasMoreBarbers, setHasMoreBarbers] = useState(true);
    const [selectedCounty, setSelectedCounty] = useState('');

    const counties = ['Antrim', 'Armagh', 'Carlow', 'Cavan', 'Clare', 'Cork', 'Derry', 'Donegal', 'Down', 'Dublin', 'Fermanagh', 'Galway', 'Kerry', 'Kildare', 'Kilkenny', 'Laois', 'Leitrim', 'Limerick', 'Longford', 'Louth', 'Mayo', 'Meath', 'Monaghan', 'Offaly', 'Roscommon', 'Sligo', 'Tipperary', 'Tyrone', 'Waterford', 'Westmeath', 'Wexford', 'Wicklow'];

    useEffect(() => {
        const fetchData = async (pageNumber) => {
            try {
                const barbersCollection = collection(db, 'Barber');
                let q = query(barbersCollection, orderBy('Name'), limit(barbersPerPage));

                if (pageNumber > 1 && lastDocumentName) {
                    q = query(barbersCollection, orderBy('Name'), startAfter(lastDocumentName), limit(barbersPerPage));
                }

                const snapshot = await getDocs(q);

                const newBarberData = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    Name: doc.data().Name,
                    Street: doc.data().Street,
                    Town: doc.data().Town,
                    County: doc.data().County,
                    Eircode: doc.data().Eircode,
                }));

                setBarberData(newBarberData);

                if (newBarberData.length > 0) {
                    const lastBarber = newBarberData[newBarberData.length - 1];
                    setLastDocumentName(lastBarber.Name);
                    setHasMoreBarbers(newBarberData.length === barbersPerPage);
                } else {
                    setHasMoreBarbers(false);
                }

                // Filter data based on selected county
                const filtered = newBarberData.filter(barber =>
                    barber.County.toLowerCase().includes(selectedCounty.toLowerCase())
                );
                setFilteredData(filtered);
            } catch (error) {
                console.error('Error fetching data:', error);
                setHasMoreBarbers(false);
            }
        };

        fetchData(page);
    }, [page, selectedCounty]);

    const nextPage = () => {
        if (hasMoreBarbers) {
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
                    <p>Sort By</p>
                    <select onChange={handleCountyChange}>
                        <option value="">Select a County</option>
                        {counties.map(county => (
                            <option key={county} value={county}>{county}</option>
                        ))}
                    </select>
                </div>
                <div className="car-details-list">
                    {filteredData.map((barber) => (
                        <div key={barber.id} className="car-details">
                            <Link to={`/barber/${barber.id}`} className="car-detail">
                                Name: {barber.Name} <br />
                                Location: {barber.Street} {barber.Town} {barber.County} {barber.Eircode}
                            </Link>
                        </div>
                    ))}
                </div>
                <div className="pagination">
                    <button onClick={prevPage} disabled={page === 1}>Previous</button>
                    <button onClick={nextPage} disabled={!hasMoreBarbers}>Next</button>
                </div>
            </div>
        </div>
    );
}

export default Barber;
