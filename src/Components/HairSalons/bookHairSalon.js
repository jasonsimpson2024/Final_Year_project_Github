import React, { useState, useEffect } from 'react';
import { db } from '../../firebase.js';
import { addDoc, collection, doc, getDocs, query, setDoc } from 'firebase/firestore';
import { useNavigate, useLocation } from 'react-router-dom';
import { getAuth  } from 'firebase/auth';

function BookingForm() {
    const navigate = useNavigate();
    const location = useLocation();
    const hairId = location.pathname.split('/').pop(); // Extract the hair salon ID from the URL
    const { currentUser } = getAuth(); // Get the logged-in user's info

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        jobType: '',
        selectedSlot: null,
        jobTypes: [] // Store the fetched job types
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

        const bookingData = {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            jobType: formData.jobType,
            selectedSlot: formData.selectedSlot,
            businessID: hairId,
        };

        // Reference the 'HairSalon' collection
        const hairSalonsCollectionRef = collection(db, 'HairSalon');

        // Reference the 'hair salon' document within the 'HairSalon' collection
        const hairSalonDocRef = doc(hairSalonsCollectionRef, hairId);

        let bookingDocRef;

        if (currentUser) {
            // If user is logged in, use UID as document ID
            bookingDocRef = doc(hairSalonDocRef, 'booking', currentUser.uid);
            await setDoc(bookingDocRef, bookingData);
        } else {
            // If user is not logged in, let Firestore generate a random ID
            const bookingsCollectionRef = collection(hairSalonDocRef, 'booking');
            bookingDocRef = await addDoc(bookingsCollectionRef, bookingData);
        }

        console.log('Document added successfully with ID:', bookingDocRef.id);

        setFormData({
            name: '',
            email: '',
            phone: '',
            jobType: '',
            selectedSlot: null,
            jobTypes: []
        });

        navigate(`/salonslot/${hairId}/${bookingDocRef.id}`);
    };

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
