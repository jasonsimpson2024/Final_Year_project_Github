import React, { useState, useEffect } from 'react';
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
        slotDuration: '60',
        startHour: '9 AM',
        endHour: '5 PM',
        excludedDays: [],
    });
    const [endHourOptions, setEndHourOptions] = useState([]);

    const user = auth.currentUser;

    useEffect(() => {
        updateEndHourOptions(formData.startHour);
    }, []);

    const handleCarInfoChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevState) => ({
            ...prevState,
            [name]: value,
        }));
        if (name === 'startHour') {
            updateEndHourOptions(value);
        }
    };

    const handleExcludedDaysChange = (day) => {
        setFormData((prevState) => ({
            ...prevState,
            excludedDays: prevState.excludedDays.includes(day)
                ? prevState.excludedDays.filter(d => d !== day)
                : [...prevState.excludedDays, day],
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const businessData = {
                ...formData,
                ownerUID: user.uid,
                slotDuration: Number(formData.slotDuration),
                // No conversion for startHour and endHour; they're submitted as is
            };

            const businessModel = formData.businessModel;
            const businessDocRef = doc(db, businessModel, user.uid);
            await setDoc(businessDocRef, businessData);

            navigate(`/add-job-types/${formData.businessModel}/${user.uid}`);
        } catch (error) {
            console.error('Error adding document:', error);
        }
    };

    const generateHourOptions = () => {
        const options = [];
        for (let i = 0; i < 24; i++) {
            const hour = i % 12 === 0 ? 12 : i % 12;
            const amPm = i < 12 ? 'AM' : 'PM';
            options.push({ label: `${hour} ${amPm}`, value: `${hour} ${amPm}` });
        }
        return options;
    };

    const updateEndHourOptions = (startHour) => {
        const startHourIndex = convertTo24HourFormat(startHour);
        const options = generateHourOptions().filter(option => convertTo24HourFormat(option.label) > startHourIndex);
        setEndHourOptions(options.map(option => <option key={option.value} value={option.label}>{option.label}</option>));

        const currentEndHourIndex = convertTo24HourFormat(formData.endHour);
        if (currentEndHourIndex <= startHourIndex) {
            setFormData(prevState => ({ ...prevState, endHour: options[0]?.label }));
        }
    };

    const convertTo24HourFormat = (time) => {
        const [hour, amPm] = time.split(' ');
        let hourConverted = parseInt(hour, 10);
        hourConverted += amPm === 'PM' && hourConverted !== 12 ? 12 : 0;
        hourConverted -= amPm === 'AM' && hourConverted === 12 ? 12 : 0;
        return hourConverted % 24; // Ensure hour is within 0-23 range
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
                                <option value="SPA">Spa & Massage</option>
                            </select>
                        </label>

                        <label>
                            Description (max 400 characters):
                            <textarea className='textbox'
                                name="Description"
                                value={formData.Description}
                                onChange={handleCarInfoChange}
                                maxLength={400}
                                rows={4}
                                style={{ width: '400px', resize: 'none' }} // Set the desired width and disable resizing
                            />
                        </label>

                        {/* Slot Duration */}
                        <label>
                            Slot Duration:
                            <select name="slotDuration" value={formData.slotDuration} onChange={handleCarInfoChange} required>
                                <option value="30">30 minutes</option>
                                <option value="60">1 hour</option>
                                <option value="120">2 hours</option>
                            </select>
                        </label>
                        <br />

                        <label>
                            Start Hour:
                            <select name="startHour" value={formData.startHour} onChange={handleCarInfoChange} required>
                                {generateHourOptions().map(option => <option key={option.value} value={option.label}>{option.label}</option>)}
                            </select>
                        </label>
                        <br />
                        <label>
                            End Hour:
                            <select name="endHour" value={formData.endHour} onChange={handleCarInfoChange} required>
                                {endHourOptions.length > 0 ? endHourOptions : <option key="default" value={formData.endHour}>{formData.endHour}</option>}
                            </select>
                        </label>

                        <label>Exclude Days:</label>
                        <div className="exclude-days-container">
                            {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => (
                                <div key={day}>
                                    <input
                                        type="checkbox"
                                        id={`exclude-day-${day}`}
                                        name={`excludeDay${day}`}
                                        checked={formData.excludedDays.includes(day)}
                                        onChange={() => handleExcludedDaysChange(day)}
                                    />
                                    <label htmlFor={`exclude-day-${day}`}>{day}</label>
                                </div>
                            ))}
                        </div>

                        <br />
                        <button type="submit">Submit</button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default ListBusiness;
