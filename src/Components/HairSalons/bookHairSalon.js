import React, { useState, useEffect } from 'react';
import { db } from '../../firebase.js';
import { addDoc, collection, doc, getDocs, query } from 'firebase/firestore';
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
        jobTypes: [], // Store the fetched job types
    });

    const handleCarInfoChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    useEffect(() => {
        // Fetch job types from the hair salon's 'jobtypes' subcollection
        const fetchJobTypes = async () => {
            const hairDocRef = doc(db, 'HairSalon', hairId);
            const jobTypesCollectionRef = collection(hairDocRef, 'jobtypes');

            try {
                const jobTypesQuerySnapshot = await getDocs(query(jobTypesCollectionRef));

                const jobTypes = [];
                jobTypesQuerySnapshot.forEach((doc) => {
                    jobTypes.push(doc.data().name);
                });

                // Update the jobType dropdown options with the fetched job types
                setFormData((prevState) => ({
                    ...prevState,
                    jobTypes,
                }));
            } catch (error) {
                console.error('Error fetching job types:', error);
            }
        };

        fetchJobTypes();
    }, [hairId]);

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
            const carsCollectionRef = collection(db, 'HairSalon');

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

            navigate(`/salonslot/${hairId}/${newDocumentId}`);
        } catch (error) {
            console.error('Error adding document:', error);
        }
    }

    return (
        <div className='form-container'>
            <div className="booking-form-container">
                <div className="booking-form">
                    <h2>Book an Appointment</h2>
                    <form onSubmit={handleSubmit}>
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
                                {formData.jobTypes && formData.jobTypes.map((jobType) => (
                                    <option key={jobType} value={jobType}>
                                        {jobType}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <br />
                        <button type="submit">Submit</button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default BookingForm;
