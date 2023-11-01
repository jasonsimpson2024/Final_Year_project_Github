import React, { useEffect, useState } from 'react';
import { db } from './firebase';
import { collection, getDocs } from 'firebase/firestore';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
//import './App.css';
import './Style.css';
import Automotive from './Components/Cars/Automotive.js';
import Add from './Components/Common/add.js'
import Update from './Components/Common/update.js'
import Layout from "./Components/Common/NavLayout.js";
import Service from "./Components/Cars/servicehistory.js";
import BookCar from "./Components/Cars/bookcars.js"
import Carslot from "./Components/Cars/Carcalendar.js"
import BookInfo from "./Components/Cars/bookcarinfo";
import WelcomePage from "./Components/Common/welcome.js"
import Hairsalon from "./Components/HairSalons/hairsalon";
import Booksalon from "./Components/HairSalons/bookHairSalon";
import Salonslot from "./Components/HairSalons/Saloncalendar";
import Barber from "./Components/Barbers/barber";
import BookBarber from "./Components/Barbers/bookBarber";
import BarberCal from "./Components/Barbers/barberCalendar";
import Confirmation from "./Components/Common/confirm";

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
            <title>BookingLITE</title>
            <Router>
                <Layout>
                <Routes>
                    {carIds.map((carId) => (
                        <Route
                            key={carId}
                            path={`/${carId}`} // Use the car ID as the pathname
                            element={<BookInfo carId={carId} />} // Pass the car ID as a prop
                        />
                    ))}
                    <Route exact path='/' element={<WelcomePage />} />
                    <Route exact path='/Automotive' element={<Automotive />} />
                    <Route exact path='/bookingcars/:id' element={<BookCar />} />
                    <Route exact path='/carslot/:doc1/:documentId' element={<Carslot />} />
                    <Route path='/update/:documentId' element={<Update />} />
                    <Route path="/service/:documentId" element={<Service />} />
                    <Route exact path='/Hairsalon' element={<Hairsalon />} />
                    <Route exact path='/bookhairsalon/:id' element={<Booksalon />} />
                    <Route exact path='/salonslot/:doc1/:documentId' element={<Salonslot />} />
                    <Route exact path='/Barbers' element={<Barber />} />
                    <Route exact path='/barber/:id' element={<BookBarber />} />
                    <Route exact path='/barberslot/:doc1/:documentId' element={<BarberCal />} />
                    <Route exact path='/confirmation' element={<Confirmation />} />
                    <Route exact path='/add' element={<Add />} />
                </Routes>
                </Layout>
            </Router>
        </div>
    );
}

export default App;
