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
                const carsCollection = collection(db, 'Automotive'); // Change the collection name to 'Automotive'
                let q = query(carsCollection, limit(carsPerPage));

                if (pageNumber > 1 && lastDocumentTimestamp) {
                    q = query(carsCollection, startAfter(lastDocumentTimestamp), limit(carsPerPage));
                }

                const snapshot = await getDocs(q);

                const newCarData = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    Name: doc.data().Name, // Display the 'Name' field
                    Location: doc.data().Location, // Display the 'Location' field
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
                    {carData.map((car) => (
                        <div key={car.id} className="car-details">
                            {/* Use Link component to redirect to BookingCars */}
                            <Link to={`/bookingcars/${car.id}`} className="car-detail">
                                Name: {car.Name} <br />
                                Location: {car.Location}
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
