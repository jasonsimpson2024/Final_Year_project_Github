import React, { useState, useEffect } from 'react';
import { db, auth } from '../../firebase.js';
import { addDoc, doc, setDoc, collection, getDocs, query } from 'firebase/firestore';
import { useNavigate, useLocation } from 'react-router-dom';
import { getAuth } from 'firebase/auth';

function BookingForm() {
    const navigate = useNavigate();
    const location = useLocation();
    const hairId = location.pathname.split('/').pop(); // extract the hair salon ID from the URL
    const { currentUser } = getAuth(); // het the logged-in user's info

    console.log("Current pathname:", location.pathname);
    console.log("Extracted hairId:", location.pathname.split('/').pop());

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        jobType: '',
        selectedSlot: null,
        jobTypes: [],
    });

    // function to handle form field changes
    const handleInfoChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    // fetch job types from 'jobtypes' subcollection
    useEffect(() => {
        const fetchJobTypes = async () => {
            const hairDocRef = doc(db, 'Barber', hairId);
            const jobTypesCollectionRef = collection(hairDocRef, 'jobtypes');

            try {
                const jobTypesQuerySnapshot = await getDocs(query(jobTypesCollectionRef));

                const jobTypes = [];
                jobTypesQuerySnapshot.forEach((doc) => {
                    // if the field is an empty string we don't add it
                    const jobTypeName = doc.data().name;
                    if (jobTypeName.trim() !== '') {
                        jobTypes.push(jobTypeName);
                    }
                });

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

    // handle form submission
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

            const carsCollectionRef = collection(db, 'Barber'); //reference barber collection

            const carDocRef = doc(carsCollectionRef, hairId); //hairId represents the document ID containing the business being booked

            let bookingDocRef;
            if (currentUser) {
                // if consumer is logged in, use UID as document ID
                bookingDocRef = doc(carDocRef, 'booking', currentUser.uid);
                await setDoc(bookingDocRef, carData);
            } else {
                // if consumer is not logged in, let Firestore generate a random ID as normal
                const bookingsCollectionRef = collection(carDocRef, 'booking');
                bookingDocRef = await addDoc(bookingsCollectionRef, carData);
            }

            console.log('Document added successfully with ID:', bookingDocRef.id); //log if successful

            setFormData({
                name: '',
                email: '',
                phone: '',
                jobType: '',
                selectedSlot: null,
            }); //resets the form after execution

            navigate(`/barberslot/${hairId}/${bookingDocRef.id}`); //navigate to the calendar to select a slot
        } catch (error) {
            console.error('Error adding document:', error); //if there's an error, log it
        }
    }

    return (
        <div className='form-container'>
            <div className="booking-form-container">
                <div className="booking-form">
                    <h2>Book an Appointment</h2>
                    <form className='exclude-days-container' onSubmit={handleSubmit}>
                        <label>
                            Name:
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInfoChange}
                                required
                            />
                        </label>
                        <label>
                            Email:
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInfoChange}
                                required
                            />
                        </label>
                        <label>
                            Phone:
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInfoChange}
                                required
                            />
                        </label>
                        <label>
                            Job Type:
                            <select
                                name="jobType"
                                value={formData.jobType}
                                onChange={handleInfoChange}
                                required
                            >
                                <option value="">Select a job type</option>
                                {formData.jobTypes.map((jobType, index) => (
                                    <option key={index} value={jobType}>
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
