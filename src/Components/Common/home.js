import React, { useEffect, useState } from 'react';
import { db } from '../../firebase.js';
import { collection, getDocs } from 'firebase/firestore';
import { Link } from 'react-router-dom';


function Home() {
    const [carData, setCarData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const carsCollection = collection(db, 'cars');
                const snapshot = await getDocs(carsCollection);

                const carData = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));

                setCarData(carData);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

    return (
        <div className='page-header'>
            <div className="header-buttons">
                <Link to="/add">
                    <button className="add-car-button">Add Car</button>
                </Link>
            </div>
            {carData.map((car) => (
                <div key={car.id} className="car-details">
                    <Link to={`/${car.id}`} className="car-detail">
                        {car.Make} {car.Model} {car.Year}
                        <br/>
                        €{car.Price}
                    </Link>
                </div>
            ))}
        </div>
    );
}

export default Home;
