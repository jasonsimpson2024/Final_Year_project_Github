import React, { useState, useEffect } from 'react';
import { db } from '../../firebase.js';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { Timestamp } from 'firebase/firestore'; // Import Timestamp from Firestore

function ModifyCar() {
    const { documentId } = useParams();
    const [formData, setFormData] = useState({
        Make: '',
        model: '',
        jobType: '', // Add 'JobType'
        selectedSlot: null, // Add 'SelectedSlot' and initialize as null
    });
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const carDocument = doc(db, 'cars', documentId);
                const carSnapshot = await getDoc(carDocument);

                if (carSnapshot.exists()) {
                    const carData = carSnapshot.data();

                    // Convert Firestore Timestamps to JavaScript Date objects
                    if (carData.selectedSlot && carData.selectedSlot.seconds) {
                        carData.selectedSlot = new Date(carData.selectedSlot.seconds * 1000);
                    }

                    setFormData(carData);
                } else {
                    console.error('Car not found');
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                alert(error);
            }
        };

        fetchData();
    }, [documentId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const carDocument = doc(db, 'cars', documentId);
            await updateDoc(carDocument, {
                ...formData,
                // Convert 'selectedSlot' to Firestore Timestamp
                selectedSlot: formData.selectedSlot ? Timestamp.fromDate(new Date(formData.selectedSlot)) : null,
            });

            navigate(`/${documentId}`);
        } catch (error) {
            console.error('Error updating document:', error);
        }
    };

    const textInputFields = ['Make', 'model', 'jobType']; // Add 'JobType'
    const dateInputFields = ['selectedSlot']; // Add 'SelectedSlot'

    return (
        <div className="modify-car">
            <h2>Modify Car</h2>
            <form onSubmit={handleSubmit}>
                {textInputFields.map((field) => (
                    <label key={field}>
                        {field}:
                        <input type="text" name={field} value={formData[field]} onChange={handleChange} required />
                    </label>
                ))}
                {dateInputFields.map((field) => (
                    <label key={field}>
                        {field}:
                        <input
                            type="datetime-local" // Change to datetime-local input for timestamp
                            name={field}
                            value={formData[field] ? new Date(formData[field]).toISOString().split('T')[0] : ''}
                            onChange={handleChange}
                        />
                    </label>
                ))}
                <button type="submit">Save Changes</button>
            </form>
        </div>
    );
}

export default ModifyCar;
