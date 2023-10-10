import React, { useEffect, useState } from 'react';
import { db } from './firebase';
import { collection, getDocs } from 'firebase/firestore';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Login from './Components/Common/login.js';
import Home from './Components/Common/home.js';
import CarDetail from "./Components/Cars/carinfo";
import Add from './Components/Common/add.js'
import Update from './Components/Common/update.js'
import Navbar from "./Components/Common/Navbar.js";
import Service from "./Components/Cars/servicehistory.js";

function App() {
    const [carIds, setCarIds] = useState([]);

    useEffect(() => {
        // Fetch document IDs from Firestore
        const fetchCarIds = async () => {
            try {
                const carCollection = collection(db, 'cars');
                const carSnapshot = await getDocs(carCollection);
                const carIdsArray = carSnapshot.docs.map((doc) => doc.id);
                setCarIds(carIdsArray);
            } catch (error) {
                console.error('Error fetching car IDs:', error);
                alert(error);
            }
        };

        fetchCarIds();
    }, []);

    return (
        <div className="App">
            {window.location.pathname !== '/' && <Navbar />} {/* Conditional Navbar rendering */}

            <Router>
                <Routes>
                    {carIds.map((carId) => (
                        <Route
                            key={carId}
                            path={`/${carId}`} // Use the car ID as the pathname
                            element={<CarDetail carId={carId} />} // Pass the car ID as a prop
                        />
                    ))}
                    <Route exact path='/' element={<Login />} />
                    <Route exact path='/home' element={<Home />} />
                    <Route exact path='/Add' element={<Add />} />
                    <Route path='/update/:documentId' element={<Update />} />
                    <Route path="/service/:documentId" element={<Service />} />
                </Routes>
            </Router>
        </div>
    );
}

export default App;
