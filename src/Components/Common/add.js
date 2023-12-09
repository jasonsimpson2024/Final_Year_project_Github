import React, { useState } from 'react';
import { db } from '../../firebase.js';
import { setDoc, doc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';

function ListBusiness() {
    const navigate = useNavigate();
    const auth = getAuth();
    const [formData, setFormData] = useState({
        Name: '',
        Street: '',
        Town: '',
        County: '',
        Eircode: '',
        businessModel: '',
    });

    const user = auth.currentUser;

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
                ownerUID: user.uid,
            };

            const businessModel = formData.businessModel;

            const businessDocRef = doc(db, businessModel, user.uid); // Use the user's UID as the document ID

            await setDoc(businessDocRef, businessData);

            setFormData({
                Name: '',
                Street: '',
                Town: '',
                County: '',
                Eircode: '',
                businessModel: '',
            });

            navigate(`/add-job-types/${formData.businessModel}/${user.uid}`);

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
                                name="Name"
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
                                name="Street"
                                value={formData.Street}
                                onChange={handleCarInfoChange}
                            />
                        </label>
                        <label>
                            Town:
                            <input
                                type="text"
                                name="Town"
                                value={formData.Town}
                                onChange={handleCarInfoChange}
                            />
                        </label>
                        <label>
                            County:
                            <input
                                type="text"
                                name="County"
                                value={formData.County}
                                onChange={handleCarInfoChange}
                            />
                        </label>
                        <label>
                            Eircode:
                            <input
                                type="text"
                                name="Eircode"
                                value={formData.Eircode}
                                onChange={handleCarInfoChange}
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
                                <option value="Meeting">Meeting</option>
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
