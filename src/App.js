import React from 'react';

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './Style.css';
import "./Navbar.css";
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
import Manage from "./Components/Common/managebook";
import Bookinfo from "./Components/Common/bookinginfo";
import Jobtype from "./Components/Common/jobtype";
import Meet from "./Components/Meeting/meeting";
import BookMeet from "./Components/Meeting/bookmeeting";
import MeetSlot from "./Components/Meeting/meetcalendar";
import ManageBus from "./Components/Common/managebusiness";
import YourBus from "./Components/Common/YourBusiness";
import Myappointments from "./Components/Common/myappointments";
import BarberDetails from "./Components/Barbers/barberinfo";
import SalonDetails from "./Components/HairSalons/salonInfo";
import AutoDetails from "./Components/Cars/autoInfo";
import BeautySalon from "./Components/BeautySalon/beautysalon";
import BeautyDetails from "./Components/BeautySalon/beautyInfo";
import BookBeauty from  "./Components/BeautySalon/bookBeautySalon";
import BeautySlot from "./Components/BeautySalon/beautyCalendar";
import Spa from "./Components/SPA/spa.js";
import SpaDetails from "./Components/SPA/spainfo";
import Bookspa from "./Components/SPA/bookspa";
import Spacalendar from "./Components/SPA/spacalendar";

function App() {
    return (
        <div className="App">
            <Router>
                <Layout>
                <Routes>
                    <Route exact path='/' element={<WelcomePage />} />
                    <Route exact path='/Automotive' element={<Automotive />} />
                    <Route exact path='/bookingcars/:id' element={<BookCar />} />
                    <Route exact path='/autoinfo/:id' element={<AutoDetails />} />
                    <Route exact path='/carslot/:doc1/:documentId' element={<Carslot />} />
                    <Route exact path='/Hairsalon' element={<Hairsalon />} />
                    <Route exact path='/bookhairsalon/:id' element={<Booksalon />} />
                    <Route exact path='/saloninfo/:id' element={<SalonDetails />} />
                    <Route exact path='/salonslot/:doc1/:documentId' element={<Salonslot />} />
                    <Route exact path='/Barbers' element={<Barber />} />
                    <Route exact path='/barber/:id' element={<BookBarber />} />
                    <Route exact path='/barberinfo/:id' element={<BarberDetails />} />
                    <Route exact path='/barberslot/:doc1/:documentId' element={<BarberCal />} />
                    <Route exact path='/confirmation' element={<Confirmation />} />
                    <Route exact path='/add' element={<Add />} />
                    <Route exact path='/login' element={<Login />} />
                    <Route exact path='/register' element={<Signup />} />
                    <Route exact path='/manage' element={<Manage />} />
                    <Route path="/bookinginfo/:collectionName/:userId/:bookingId" element={<Bookinfo />} />
                    <Route exact path='/add-job-types/:businessModel/:uid' element={<Jobtype />} />
                    <Route exact path='/meet' element={<Meet />} />
                    <Route exact path='/meeting/:id' element={<BookMeet />} />
                    <Route exact path='/meetingslot/:doc1/:documentId' element={<MeetSlot />} />
                    <Route exact path='/managebusiness/:collectionName/:documentId' element={<ManageBus />} />
                    <Route exact path='/mybusinesses' element={<YourBus />} />
                    <Route exact path='/Myappointments' element={<Myappointments />} />
                    <Route exact path='/Beautysalon' element={<BeautySalon />} />
                    <Route exact path='/beautyinfo/:id' element={<BeautyDetails />} />
                    <Route exact path='/bookbeautysalon/:id' element={<BookBeauty />} />
                    <Route exact path='/beautyslot/:doc1/:documentId' element={<BeautySlot />} />
                    <Route exact path='/spa' element={<Spa />} />
                    <Route exact path='/spainfo/:id' element={<SpaDetails />} />
                    <Route exact path='/bookspa/:id' element={<Bookspa />} />
                    <Route exact path='/spaslot/:doc1/:documentId' element={<Spacalendar />} />
                </Routes>
                </Layout>
            </Router>
        </div>
    );
}

export default App;
