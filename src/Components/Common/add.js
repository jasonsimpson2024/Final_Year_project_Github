import React, { useState } from 'react';
import { db } from '../../firebase.js';
import {Timestamp, doc, setDoc} from 'firebase/firestore'; // Import Timestamp, doc, and setDoc from Firestore
import { useNavigate } from 'react-router-dom';

function Updaters() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        Make: '',
        Model: '',
        Year: '',
        EngineSize: '',
        Mileage: '',
        Transmission: '',
        Colour: '',
        Price: '',
        TaxExpiry: null,
        Nct: null,
        LastService: '',
        NextService: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    function generateRandomString(length) {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            result += characters.charAt(randomIndex);
        }
        return result;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // Generate the document name by concatenating Make and Model, removing spaces, and converting to lowercase
            const docName = generateRandomString(16).toLowerCase();

            // Calculate 'Next Service' based on 'Last Service'
            const lastServiceDate = new Date(formData.LastService);
            const nextServiceDate = new Date(lastServiceDate);
            nextServiceDate.setMonth(nextServiceDate.getMonth() + 6);

            // Create a new 'service history' document


            // Retrieve the document from the 'cars' collection or create it if it doesn't exist
            const carDocRef = doc(db, 'cars', docName);


                await setDoc(carDocRef, {
                    ...formData,
                    docName,
                    TaxExpiry: formData.TaxExpiry ? Timestamp.fromDate(new Date(formData.TaxExpiry)) : null,
                    Nct: formData.Nct ? Timestamp.fromDate(new Date(formData.Nct)) : null,
                    LastService: Timestamp.fromDate(new Date(formData.LastService)),
                    NextService: Timestamp.fromDate(nextServiceDate),
                });

            // Clear the form after successful submission
            setFormData({
                Make: '',
                Model: '',
                Year: '',
                EngineSize: '',
                Mileage: '',
                Transmission: '',
                Colour: '',
                Price: '',
                TaxExpiry: null,
                Nct: null,
                LastService: '',
                NextService: '',
            });

            navigate('/home');
        } catch (error) {
            console.error('Error adding document:', error);
        }
    };
    return (
        <div className="updaters">
            <h2>Add a new Car</h2>
            <form onSubmit={handleSubmit}>
                <label>
                    Make:
                    <input type="text" name="Make" value={formData.Make} onChange={handleChange} required />
                </label>
                <label>
                    Model:
                    <input type="text" name="Model" value={formData.Model} onChange={handleChange} required />
                </label>
                <label>
                    Year:
                    <input type="text" name="Year" value={formData.Year} onChange={handleChange} required />
                </label>
                <label>
                    Engine Size:
                    <input type="text" name="EngineSize" value={formData.EngineSize} onChange={handleChange} required />
                </label>
                <label>
                    Mileage:
                    <input type="text" name="Mileage" value={formData.Mileage} onChange={handleChange} required />
                </label>
                <label>
                    Transmission:
                    <input type="text" name="Transmission" value={formData.Transmission} onChange={handleChange} required />
                </label>
                <label>
                    Colour:
                    <input type="text" name="Colour" value={formData.Colour} onChange={handleChange} required />
                </label>
                <label>
                    Price:
                    <input type="text" name="Price" value={formData.Price} onChange={handleChange} required />
                </label>
                <label>
                    Tax Expiry:
                    <input type="date" name="TaxExpiry" value={formData.TaxExpiry} onChange={handleChange} required />
                </label>
                <label>
                    NCT Due:
                    <input type="date" name="Nct" value={formData.Nct} onChange={handleChange} required />
                </label>
                <label>
                    Last Service:
                    <input
                        type="date"
                        name="LastService"
                        value={formData.LastService}
                        onChange={handleChange}
                        required
                    />
                </label>
                <button type="submit">Submit</button>
            </form>
        </div>
    );
}

export default Updaters;


