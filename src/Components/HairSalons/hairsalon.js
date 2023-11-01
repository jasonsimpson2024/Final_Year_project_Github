import React, { useEffect, useState } from 'react';
import { db } from '../../firebase.js';
import { collection, getDocs, query, limit, startAfter } from 'firebase/firestore';
import { Link } from 'react-router-dom';

function Automotive() {
    const [carData, setCarData] = useState([]);
    const [page, setPage] = useState(1);
    const carsPerPage = 5;
    const [lastDocumentTimestamp, setLastDocumentTimestamp] = useState(null);

    useEffect(() => {
        const fetchData = async (pageNumber) => {
            try {
                const carsCollection = collection(db, 'HairSalon'); // Change the collection name to 'Automotive'
                let q = query(carsCollection, limit(carsPerPage));

                if (pageNumber > 1 && lastDocumentTimestamp) {
                    q = query(carsCollection, startAfter(lastDocumentTimestamp), limit(carsPerPage));
                }

                const snapshot = await getDocs(q);

                const newCarData = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    Name: doc.data().Name, // Display the 'Name' field
                    Street: doc.data().Street, // Display the 'Location' field
                    Town: doc.data().Town,
                    County: doc.data().County,
                    Eircode: doc.data().Eircode, // Display the 'Location' field
                }));

                if (newCarData.length > 0) {
                    const lastCar = newCarData[newCarData.length - 1];
                    setLastDocumentTimestamp(lastCar.selectedSlot);
                }

                setCarData(newCarData);
                console.log("Car data updated:", newCarData);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData(page);
    }, [page]);

    const nextPage = () => {
        setPage(page + 1);
    };

    const prevPage = () => {
        if (page > 1) {
            if (page === 2) {
                setLastDocumentTimestamp(null);
            }
            setPage(page - 1);
        }
    };

    return (
        <div>
            <div className='page-header'>
                <div className="header-buttons">
                </div>
                <div className="car-details-list">
                    {carData.map((hair) => (
                        <div key={hair.id} className="car-details">
                            {/* Use Link component to redirect to BookingCars */}
                            <Link to={`/bookhairsalon/${hair.id}`} className="car-detail">
                                Name: {hair.Name} <br />
                                Location: {hair.Street} {hair.Town} {hair.County} {hair.Eircode}
                            </Link>
                        </div>
                    ))}
                </div>
                <div className="pagination">
                    <button onClick={prevPage} disabled={page === 1}>Previous</button>
                    <button onClick={nextPage}>Next</button>
                </div>
            </div>
        </div>
    );
}

export default Automotive;
