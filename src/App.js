import React from 'react';

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
//import './App.css';
import './Style.css';
import Automotive from './Components/Cars/Automotive.js';
import Add from './Components/Common/add.js'
import Layout from "./Components/Common/NavLayout.js";
import BookCar from "./Components/Cars/bookcars.js"
import Carslot from "./Components/Cars/Carcalendar.js"
import WelcomePage from "./Components/Common/welcome.js"
import Hairsalon from "./Components/HairSalons/hairsalon";
import Booksalon from "./Components/HairSalons/bookHairSalon";
import Salonslot from "./Components/HairSalons/Saloncalendar";
import Barber from "./Components/Barbers/barber";
import BookBarber from "./Components/Barbers/bookBarber";
import BarberCal from "./Components/Barbers/barberCalendar";
import Confirmation from "./Components/Common/confirm";
import Login from "./Components/Common/login";
import Signup from "./Components/Common/signup";
import Manage from "./Components/Common/manage";
import Bookinfo from "./Components/Common/bookinginfo";
import Jobtype from "./Components/Common/jobtype";

function App() {
    return (
        <div className="App">
            <title>BookingLITE</title>
            <Router>
                <Layout>
                <Routes>
                    <Route exact path='/' element={<WelcomePage />} />
                    <Route exact path='/Automotive' element={<Automotive />} />
                    <Route exact path='/bookingcars/:id' element={<BookCar />} />
                    <Route exact path='/carslot/:doc1/:documentId' element={<Carslot />} />
                    <Route exact path='/Hairsalon' element={<Hairsalon />} />
                    <Route exact path='/bookhairsalon/:id' element={<Booksalon />} />
                    <Route exact path='/salonslot/:doc1/:documentId' element={<Salonslot />} />
                    <Route exact path='/Barbers' element={<Barber />} />
                    <Route exact path='/barber/:id' element={<BookBarber />} />
                    <Route exact path='/barberslot/:doc1/:documentId' element={<BarberCal />} />
                    <Route exact path='/confirmation' element={<Confirmation />} />
                    <Route exact path='/add' element={<Add />} />
                    <Route exact path='/login' element={<Login />} />
                    <Route exact path='/register' element={<Signup />} />
                    <Route exact path='/manage' element={<Manage />} />
                    <Route path="/bookinginfo/:collectionName/:userId/:bookingId" element={<Bookinfo />} />
                    <Route exact path='/add-job-types/:businessModel/:uid' element={<Jobtype />} />

                </Routes>
                </Layout>
            </Router>
        </div>
    );
}

export default App;
