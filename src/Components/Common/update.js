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
        Model: '',
        Year: '',
        EngineSize: '',
        Mileage: '',
        Transmission: '',
        Colour: '',
        Price: '',
        TaxExpiry: null, // Initialize 'TaxExpiry' as null
        Nct: null, // Initialize 'Nct' as null
        ServiceHistory: '',
        LastService: '', // Initialize 'LastService' as empty string
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
                    if (carData.TaxExpiry && carData.TaxExpiry.seconds) {
                        carData.TaxExpiry = new Date(carData.TaxExpiry.seconds * 1000);
                    }
                    if (carData.Nct && carData.Nct.seconds) {
                        carData.Nct = new Date(carData.Nct.seconds * 1000);
                    }
                    if (carData.LastService && carData.LastService.seconds) {
                        carData.LastService = new Date(carData.LastService.seconds * 1000);
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
                // Convert 'TaxExpiry' and 'Nct' to Firestore Timestamps
                TaxExpiry: formData.TaxExpiry ? Timestamp.fromDate(new Date(formData.TaxExpiry)) : null,
                Nct: formData.Nct ? Timestamp.fromDate(new Date(formData.Nct)) : null,
                // Convert 'LastService' to Firestore Timestamp
                LastService: formData.LastService ? Timestamp.fromDate(new Date(formData.LastService)) : null,
            });

            // Calculate and update 'NextService' based on 'LastService'
            if (formData.LastService) {
                const nextServiceDate = new Date(formData.LastService);
                nextServiceDate.setMonth(nextServiceDate.getMonth() + 6);
                await updateDoc(carDocument, {
                    NextService: Timestamp.fromDate(nextServiceDate),
                });
            }

            navigate(`/${documentId}`);
        } catch (error) {
            console.error('Error updating document:', error);
        }
    };

    const textInputFields = ['Make', 'Model', 'Year', 'EngineSize', 'Mileage', 'Transmission', 'Colour', 'Price'];
    const dateInputFields = ['TaxExpiry', 'Nct', 'LastService'];

    return (
        <div className="modify-car">
            <h2>Modify Car</h2>
            <form onSubmit={handleSubmit}>
                {textInputFields.map((field) => (
                    field !== 'docName' && (
                        <label key={field}>
                            {field}:
                            <input type="text" name={field} value={formData[field]} onChange={handleChange} required />
                        </label>
                    )
                ))}
                {dateInputFields.map((field) => (
                    <label key={field}>
                        {field}:
                        <input
                            type="date"
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
