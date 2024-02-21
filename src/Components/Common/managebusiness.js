import React, { useState, useEffect } from 'react';
import { db, auth } from '../../firebase.js';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useParams, useNavigate } from 'react-router-dom';

function ManageBusiness() {
    const { collectionName } = useParams();
    const navigate = useNavigate();
    const [businessData, setBusinessData] = useState({
        Name: '',
        Street: '',
        Town: '',
        County: '',
        Eircode: '',
        Description: '',
        slotDuration: '60',
        startHour: '9 AM',
        endHour: '5 PM',
    });
    const [excludedDays, setExcludedDays] = useState([]); // New state for tracking excluded days
    const [endHourOptions, setEndHourOptions] = useState([]);

    useEffect(() => {
        const fetchBusinessData = async () => {
            try {
                const user = auth.currentUser;
                if (user) {
                    const documentRef = doc(db, collectionName, user.uid);
                    const documentSnapshot = await getDoc(documentRef);
                    if (documentSnapshot.exists()) {
                        const docData = documentSnapshot.data();
                        setBusinessData((prevData) => ({
                            ...prevData,
                            ...docData,
                            slotDuration: docData.slotDuration?.toString() || '60',
                            startHour: docData.startHour?.toString() || '9 AM',
                            endHour: docData.endHour?.toString() || '5 PM',
                        }));
                        // Update excludedDays from the fetched data if available
                        if (docData.excludedDays) {
                            setExcludedDays(docData.excludedDays);
                        }
                    }
                } else {
                    console.log('No user is currently authenticated.');
                }
            } catch (error) {
                console.error('Error fetching business data:', error);
            }
        };
        fetchBusinessData();
    }, [collectionName]);

    useEffect(() => {
        // Dynamically generate end hour options based on the selected start hour
        updateEndHourOptions(businessData.startHour);
    }, [businessData.startHour]);

    const handleUpdate = async () => {
        try {
            const user = auth.currentUser;
            if (user) {
                const documentRef = doc(db, collectionName, user.uid);
                await updateDoc(documentRef, {
                    ...businessData,
                    slotDuration: parseInt(businessData.slotDuration, 10),
                    startHour: businessData.startHour,
                    endHour: businessData.endHour,
                    excludedDays, // Include excludedDays in the update
                });
                console.log('Document updated successfully!');
                navigate("/");
            } else {
                console.log('No user is currently authenticated.');
            }
        } catch (error) {
            console.error('Error updating document:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setBusinessData((prevData) => ({ ...prevData, [name]: value }));
        if (name === 'startHour') {
            updateEndHourOptions(value);
        }
    };

    const toggleDayExclusion = (day) => {
        setExcludedDays((currentDays) =>
            currentDays.includes(day)
                ? currentDays.filter((d) => d !== day)
                : [...currentDays, day]
        );
    };

    const generateHourOptions = () => {
        const options = [];
        for (let i = 0; i < 24; i++) {
            const hour = i % 12 === 0 ? 12 : i % 12;
            const amPm = i < 12 ? 'AM' : 'PM';
            const value = `${hour} ${amPm}`;
            options.push(<option key={i} value={value}>{value}</option>);
        }
        return options;
    };

    const updateEndHourOptions = (startHour) => {
        const startHourIndex = convertTo24HourFormat(startHour);
        const filteredOptions = generateHourOptions().filter((_, index) => index > startHourIndex);
        setEndHourOptions(filteredOptions);

        // Automatically adjust endHour if it's now invalid
        const endHourIndex = convertTo24HourFormat(businessData.endHour);
        if (endHourIndex <= startHourIndex) {
            const newEndHour = filteredOptions[0]?.props.value;
            setBusinessData((prevData) => ({ ...prevData, endHour: newEndHour }));
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
                    <h2>Manage Business</h2>
                    <form>
                        <label>Name:</label>
                        <input type="text" name="Name" value={businessData.Name} onChange={handleChange} />
                        <br />
                        <label>Street:</label>
                        <input type="text" name="Street" value={businessData.Street} onChange={handleChange} />
                        <br />
                        <label>Town:</label>
                        <input type="text" name="Town" value={businessData.Town} onChange={handleChange} />
                        <br />
                        <label>County:</label>
                        <input type="text" name="County" value={businessData.County} onChange={handleChange} />
                        <br />
                        <label>Eircode:</label>
                        <input type="text" name="Eircode" value={businessData.Eircode} onChange={handleChange} />
                        <br />
                        <label>Description (max 400 characters):</label>
                        <textarea className="textbox"
                            name="Description"
                            value={businessData.Description}
                            onChange={handleChange}
                            maxLength={400}
                            rows={4}
                            style={{ width: '400px', resize: 'none' }}
                        />
                        <br />
                        <label>Slot Duration:</label>
                        <select name="slotDuration" value={businessData.slotDuration} onChange={handleChange} required>
                            <option value="30">30 minutes</option>
                            <option value="60">1 hour</option>
                            <option value="120">2 hours</option>
                        </select>
                        <br />
                        <label>Start Hour:</label>
                        <select name="startHour" value={businessData.startHour} onChange={handleChange} required>
                            {generateHourOptions()}
                        </select>
                        <br />
                        <label>End Hour:</label>
                        <select name="endHour" value={businessData.endHour} onChange={handleChange} required>
                            {endHourOptions.length > 0 ? endHourOptions : generateHourOptions()}
                        </select>
                        <label>Exclude Days:</label>
                        <div className="exclude-days-container">
                            {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => (
                                <div key={day}>
                                    <input
                                        type="checkbox"
                                        id={`day-${day}`}
                                        name={day}
                                        checked={excludedDays.includes(day)}
                                        onChange={() => toggleDayExclusion(day)}
                                    />
                                    <label htmlFor={`day-${day}`}>{day}</label>
                                </div>
                            ))}
                        </div>
                        <br />
                        <button type="button" onClick={handleUpdate}>Update</button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default ManageBusiness;
