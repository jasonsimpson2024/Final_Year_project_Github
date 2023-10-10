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

                    // Convert Firestore Timestamps to JavaScript Date objects
                    if (carData.LastService && carData.LastService.seconds) {
                        carData.LastService = new Date(carData.LastService.seconds * 1000);
                    }
                    if (carData.NextService && carData.NextService.seconds) {
                        carData.NextService = new Date(carData.NextService.seconds * 1000);
                    }

                    // Convert 'TaxExpiry' and 'Nct' Timestamps to Date objects
                    if (carData.TaxExpiry && carData.TaxExpiry.seconds) {
                        carData.TaxExpiry = new Date(carData.TaxExpiry.seconds * 1000);
                    }
                    if (carData.Nct && carData.Nct.seconds) {
                        carData.Nct = new Date(carData.Nct.seconds * 1000);
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
    // Define a CSS class for date fields that are within one month of the current date
    const redTextClass = (date) => {
        const currentDate = new Date();
        const oneMonthFromNow = new Date();
        oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);
        return date >= currentDate && date <= oneMonthFromNow ? 'red-text' : '';
    };

    const fieldOrder = ['Make', 'Model', 'Year', 'EngineSize', 'Mileage', 'Transmission', 'Colour', 'Price', 'TaxExpiry', 'Nct', 'LastService', 'NextService'];

    return (
        <div className='page-header'>
            <div className="car-details">
                {fieldOrder.map((field) => (
                    <div key={field} className={`car-detail ${redTextClass(carData[field])}`}>
                        <strong>{field}:</strong> {field === 'LastService' || field === 'NextService' || field === 'TaxExpiry' || field === 'Nct' ? carData[field].toLocaleDateString() : carData[field]}
                    </div>
                ))}
            </div>
            <button onClick={handleDelete}>Delete</button>
            <button onClick={() => handleUpdateCar(carId)}>Update Car</button>
            <button onClick={() => goService(carId)}>Service History</button>
        </div>
    );
}

export default CarDetail;
