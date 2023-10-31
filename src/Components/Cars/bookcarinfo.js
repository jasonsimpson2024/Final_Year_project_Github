import React, { useEffect, useState } from 'react';
import { db } from '../../firebase.js';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

function CarDetail() {
    const [carData, setCarData] = useState(null);
    const location = useLocation();
    const navigate = useNavigate();
    const urlParts = location.pathname.split('/');
    const carId = urlParts[urlParts.length - 1];

    const handleUpdateCar = (documentId) => {
        navigate(`/update/${documentId}`);
    };

    const goService = (documentId) => {
        navigate(`/service/${documentId}`);
    }

    useEffect(() => {
        const fetchData = async () => {
            try {
                const carDocument = doc(db, 'cars', carId);
                const carSnapshot = await getDoc(carDocument);

                if (carSnapshot.exists()) {
                    const carData = carSnapshot.data();

                    // Convert Firestore Timestamps to JavaScript Date objects for all fields
                    for (const key in carData) {
                        if (carData[key] && carData[key].seconds) {
                            carData[key] = new Date(carData[key].seconds * 1000);
                        }
                    }

                    setCarData(carData);
                } else {
                    console.error('Car not found');
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                alert(error);
            }
        };
        fetchData();
    }, [carId]);

    const handleDelete = async () => {
        const confirmDelete = window.confirm('Are you sure you want to delete this car?');

        if (confirmDelete) {
            try {
                const carDocument = doc(db, 'cars', carId);
                await deleteDoc(carDocument);
                navigate('/home');
            } catch (error) {
                console.error('Error deleting car:', error);
            }
        }
    };

    if (!carData) {
        return <div>Loading...</div>;
    }

    const fieldOrder = ['Make', 'model', 'year', 'reg', 'jobType', 'selectedSlot','name', 'email', 'phone', 'street', 'town', 'county', 'eircode' ];

    return (
        <div className='page-header'>
            <div className="car-details">
                {fieldOrder.map(key => (
                    <div key={key} className="car-detail">
                        <strong>{key}:</strong> {key === 'selectedSlot' ? carData[key].toLocaleString() : carData[key]}
                    </div>
                ))}
            </div>
            <button onClick={handleDelete}>Delete</button>
        </div>
    );
}

export default CarDetail;
