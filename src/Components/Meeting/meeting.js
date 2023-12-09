import React, { useEffect, useState } from 'react';
import { db } from '../../firebase.js';
import { collection, getDocs, query, orderBy, limit, startAfter } from 'firebase/firestore';
import { Link } from 'react-router-dom';

function Barber() {
    const [carData, setCarData] = useState([]);
    const [page, setPage] = useState(1);
    const carsPerPage = 5;
    const [lastDocumentName, setLastDocumentName] = useState(null);

    useEffect(() => {
        const fetchData = async (pageNumber) => {
            try {
                const carsCollection = collection(db, 'Meeting');
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

                if (newCarData.length > 0) {
                    const lastCar = newCarData[newCarData.length - 1];
                    setLastDocumentName(lastCar.Name);
                }

                setCarData(newCarData);
                console.log("data updated:", newCarData);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData(page);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page]); // Disable the rule for 'lastDocumentName'


    const nextPage = () => {
        setPage(page + 1);
    };

    const prevPage = () => {
        if (page > 1) {
            if (page === 2) {
                setLastDocumentName(null);
            }
            setPage(page - 1);
        }
    };

    return (
        <div>
            <div className='page-header'>
                <a href="/" className="my-button arrow-button">Browse Other Services</a>
                <div className="header-buttons">
                </div>
                <div className="car-details-list">
                    {carData.map((meet) => (
                        <div key={meet.id} className="car-details">
                            <Link to={`/meeting/${meet.id}`} className="car-detail">
                                Name: {meet.Name} <br />
                                Location: {meet.Street} {meet.Town} {meet.County} {meet.Eircode}
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

export default Barber;