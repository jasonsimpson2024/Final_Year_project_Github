import React, { useState } from 'react';
import { db } from '../../firebase.js';
import { addDoc, collection } from 'firebase/firestore';
import { useNavigate, useLocation } from 'react-router-dom';

function ListBusiness() {
    const navigate = useNavigate();
    const location = useLocation();
    const carId = location.pathname.split('/').pop(); // Extract the car ID from the URL

    const [formData, setFormData] = useState({
        Name: '',
        Street: '',
        Town: '',
        County: '',
        Eircode: '',
        businessModel: '',
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
            const businessData = {
                Name: formData.Name,
                Street: formData.Street,
                Town: formData.Town,
                County: formData.County,
                Eircode: formData.Eircode,
            };

            const businessModel = formData.businessModel;

            const businessCollectionRef = collection(db, businessModel);

            await addDoc(businessCollectionRef, businessData);

            setFormData({
                Name: '',
                Street: '',
                Town: '',
                County: '',
                Eircode: '',
                businessModel: '',
            });

            navigate(`/`);
        } catch (error) {
            console.error('Error adding document:', error);
        }
    };

    return (
        <div className="form-container">
        <div className="booking-form-container">
            <div className="booking-form">
                <h2>List your business</h2>
                <form onSubmit={handleSubmit}>
                    {/* Personal Information */}
                    <label>
                        Name:
                        <input
                            type="text"
                            name="Name" // Use uppercase "N" to match formData key
                            value={formData.Name}
                            onChange={handleCarInfoChange}
                            required
                        />
                    </label>
                    {/* Address */}
                    <h3>Address:</h3>
                    <label>
                        Street:
                        <input
                            type="text"
                            name="Street" // Use uppercase "S" to match formData key
                            value={formData.Street}
                            onChange={handleCarInfoChange}
                            required
                        />
                    </label>
                    <label>
                        Town:
                        <input
                            type="text"
                            name="Town" // Use uppercase "T" to match formData key
                            value={formData.Town}
                            onChange={handleCarInfoChange}
                            required
                        />
                    </label>
                    <label>
                        County:
                        <input
                            type="text"
                            name="County" // Use uppercase "C" to match formData key
                            value={formData.County}
                            onChange={handleCarInfoChange}
                            required
                        />
                    </label>
                    <label>
                        Eircode:
                        <input
                            type="text"
                            name="Eircode" // Use uppercase "E" to match formData key
                            value={formData.Eircode}
                            onChange={handleCarInfoChange}
                            required
                        />
                    </label>
                    {/* Business Model */}
                    <label>
                        Business Model:
                        <select
                            name="businessModel"
                            value={formData.businessModel}
                            onChange={handleCarInfoChange}
                            required
                        >
                            <option value="">Select a business model</option>
                            <option value="Automotive">Automotive</option>
                            <option value="Barber">Barber</option>
                            <option value="HairSalon">Hair Salon</option>
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

export default ListBusiness;
