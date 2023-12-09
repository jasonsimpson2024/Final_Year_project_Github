import React, { useState, useEffect } from 'react';
import { db } from '../../firebase.js';
import { addDoc, collection, doc, getDocs, query } from 'firebase/firestore';
import { useNavigate, useLocation } from 'react-router-dom';

function BookingForm() {
    const navigate = useNavigate();
    const location = useLocation();
    const meetId = location.pathname.split('/').pop(); // Extract the car ID from the URL

    const [formData, setFormData] = useState({
        name: '',
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
            const hairDocRef = doc(db, 'Meeting', meetId);
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
    }, [meetId]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const carData = {
                name: formData.name,
                jobType: formData.jobType,
                selectedSlot: formData.selectedSlot,
                businessID: meetId,
            };

            // Reference the 'cars' collection
            const carsCollectionRef = collection(db, 'Meeting');

            // Reference the 'car' document within the 'cars' collection
            const carDocRef = doc(carsCollectionRef, meetId);

            // Reference the 'bookings' subcollection within the 'car' document
            const bookingsCollectionRef = collection(carDocRef, 'booking');

            // Add data to the 'bookings' subcollection and get the document reference
            const bookingDocRef = await addDoc(bookingsCollectionRef, carData);

            // Get the document ID from the reference
            const newDocumentId = bookingDocRef.id;
            console.log('Document added successfully with ID:', newDocumentId);

            setFormData({
                name: '',
                jobType: '',
                selectedSlot: null,
            });

            navigate(`/meetingslot/${meetId}/${newDocumentId}`);
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
                        {/* Personal Information */}
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
                            <select
                                name="jobType"
                                value={formData.jobType}
                                onChange={handleCarInfoChange}
                                required
                            >
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
