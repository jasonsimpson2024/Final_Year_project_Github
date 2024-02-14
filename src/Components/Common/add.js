import React, { useState } from 'react';
import { db } from '../../firebase.js';
import { setDoc, doc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';

function ListBusiness() {
    const navigate = useNavigate();
    const auth = getAuth();
    const counties = [
        "Co. Antrim", "Co. Armagh", "Co. Carlow", "Co. Cavan", "Co. Clare", "Co. Cork", "Co. Derry", "Co. Donegal",
        "Co. Down", "Co. Dublin", "Co. Fermanagh", "Co. Galway", "Co. Kerry", "Co. Kildare", "Co. Kilkenny",
        "Co. Laois", "Co. Leitrim", "Co. Limerick", "Co. Longford", "Co. Louth", "Co. Mayo", "Co. Meath",
        "Co. Monaghan", "Co. Offaly", "Co. Roscommon", "Co. Sligo", "Co. Tipperary", "Co. Tyrone",
        "Co. Waterford", "Co. Westmeath", "Co. Wexford", "Co. Wicklow"
    ];
    const [formData, setFormData] = useState({
        Name: '',
        Street: '',
        Town: '',
        County: '',
        Eircode: '',
        businessModel: '',
        Description: '',
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
                Description: formData.Description,
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
                Description: '',
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
                            <select
                                name="County"
                                value={formData.County}
                                onChange={handleCarInfoChange}
                                required
                            >
                                <option value="">Select a county</option>
                                {counties.map((county) => (
                                    <option key={county} value={county}>{county}</option>
                                ))}
                            </select>
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
                                <option value="BeautySalon">Beauty Salon</option>
                            </select>
                        </label>

                        <label>
                            Description (max 400 characters):
                            <textarea
                                name="Description"
                                value={formData.Description}
                                onChange={handleCarInfoChange}
                                maxLength={400}
                                rows={4}
                                style={{ width: '400px', resize: 'none' }} // Set the desired width and disable resizing
                            />
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
