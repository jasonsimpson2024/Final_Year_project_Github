import React, { useState } from 'react';
import { db } from '../../firebase.js';
import { addDoc, collection, doc } from 'firebase/firestore';
import { useNavigate, useLocation } from 'react-router-dom';

function BookingForm() {
    const navigate = useNavigate();
    const location = useLocation();
    const hairId = location.pathname.split('/').pop(); // Extract the car ID from the URL

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        jobType: '',
        selectedSlot: null,
    });

    const handleCarInfoChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const carData = {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                jobType: formData.jobType,
                selectedSlot: formData.selectedSlot,
                businessID: hairId,
            };

            // Reference the 'cars' collection
            const carsCollectionRef = collection(db, 'Barber');

            // Reference the 'car' document within the 'cars' collection
            const carDocRef = doc(carsCollectionRef, hairId);

            // Reference the 'bookings' subcollection within the 'car' document
            const bookingsCollectionRef = collection(carDocRef, 'booking');

            // Add data to the 'bookings' subcollection and get the document reference
            const bookingDocRef = await addDoc(bookingsCollectionRef, carData);

            // Get the document ID from the reference
            const newDocumentId = bookingDocRef.id;
            console.log('Document added successfully with ID:', newDocumentId);

            setFormData({
                name: '',
                email: '',
                phone: '',
                jobType: '',
                selectedSlot: null,
            });

            navigate(`/barberslot/${hairId}/${newDocumentId}`);
        } catch (error) {
            console.error('Error adding document:', error);
        }
    }

    return (
        <div className="booking-form-container">
            <div className="booking-form">
                <h2>Book an Appointment</h2>
                <form onSubmit={handleSubmit}>
                    {/* Personal Information */}
                    <h3>Personal Information</h3>
                    <label>
                        Name:
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleCarInfoChange}
                            required
                        />
                    </label>
                    <label>
                        Email:
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleCarInfoChange}
                            required
                        />
                    </label>
                    <label>
                        Phone:
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleCarInfoChange}
                            required
                        />
                    </label>
                    <label>
                        Job Type:
                        <select
                            name="jobType"
                            value={formData.jobType}
                            onChange={handleCarInfoChange}
                            required
                        >
                            <option value="">Select a job type</option>
                            <option value="haircut">Regular Cut</option>
                            <option value="jnr-haircut">Junior Haircut U12</option>
                            <option value="haircut-shave">Haircut & Shave</option>
                            <option value="wash-cut">Haircut & Wash</option>
                        </select>
                    </label>
                    <br />
                    <button type="submit">Submit</button>
                </form>
            </div>
        </div>
    );
}

export default BookingForm;
