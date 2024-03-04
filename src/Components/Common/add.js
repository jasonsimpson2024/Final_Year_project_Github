import React, { useState, useEffect } from 'react';
import { db } from '../../firebase.js';
import { doc, setDoc, collection, getDocs, deleteDoc, addDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { S3 } from 'aws-sdk';

// Initialize AWS S3
const s3 = new S3({
     accessKeyId: process.env.REACT_APP_ACCESS_KEY_ID,
     secretAccessKey:process.env.REACT_APP_SECRET_ACCESS_KEY,
     region: process.env.REACT_APP_REGION
});

async function checkFileExists(bucket, key) {

    try {
        await s3.headObject({ Bucket: bucket, Key: key }).promise();
        return true; // File exists
    } catch (error) {
        if (error.statusCode === 404) {
            return false; // File does not exist
        }
        throw error; // Handle other errors appropriately
    }
}

async function getUniqueFilename(bucket, originalName) {
    let baseName = originalName.replace(/\.[^/.]+$/, "");
    let extension = originalName.match(/\.[^/.]+$/)[0];
    let count = 0;
    let newName = originalName;

    while (await checkFileExists(bucket, `photos/${newName}`)) {
        count++;
        newName = `${baseName}(${count})${extension}`;
    }

    return newName;
}

function ListBusiness() {
    const navigate = useNavigate();
    const auth = getAuth();
    const user=auth.currentUser;
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
        mediaDocs: [], // State for uploaded media documents
    });

    const [selectedFiles, setSelectedFiles] = useState([]);
    const [loading, setLoading] = useState(false); // State for loading status
    const [endHourOptions, setEndHourOptions] = useState([]);

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

    const handleFileChange = (event) => {
        const files = Array.from(event.target.files).filter((file) =>
            file.type.match('image.*')
        );

        if (files.length !== event.target.files.length) {
            alert('Only image files are allowed.');
            // Clear the file input if any non-image file is selected
            event.target.value = ''; // This resets the file input
        } else {
            setSelectedFiles(files);
        }
    };

    const uploadFile = async (file) => {
        let fileName = file.name;
        let uniqueFileName = await getUniqueFilename('bookinglite', fileName);
        const s3Key = `photos/${uniqueFileName}`;
        const uploadParams = {
            Bucket: 'bookinglite',
            Key: s3Key,
            Body: file,
        };

        await s3.upload(uploadParams).promise();
        const downloadURL = s3.getSignedUrl('getObject', {
            Bucket: 'bookinglite',
            Key: s3Key,
            Expires: 9999999,
        });

        return { downloadURL, uniqueFileName, s3Key };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (selectedFiles.length > 0) {
                for (let file of selectedFiles) {
                    const businessModel=formData.businessModel
                    const { downloadURL, uniqueFileName, s3Key } = await uploadFile(file);
                    const mediaCollectionRef = collection(db, businessModel, auth.currentUser.uid, 'media');
                    await addDoc(mediaCollectionRef, {
                        title: uniqueFileName,
                        url: downloadURL,
                        s3Key: s3Key,
                    });
                }
            }

            const businessData = {
                ...formData,
                ownerUID: auth.currentUser.uid,
                slotDuration: parseInt(formData.slotDuration, 10),
            };

            const businessModel = formData.businessModel;
            const businessDocRef = doc(db, businessModel, auth.currentUser.uid);
            await setDoc(businessDocRef, businessData);

            navigate(`/add-job-types/${formData.businessModel}/${user.uid}`);// or wherever you need to redirect to
        } catch (error) {
            console.error('Error submitting form:', error);
        } finally {
            setLoading(false);
        }
    };

    const generateHourOptions = () => {
        const options = [];
        for (let i = 0; i < 24; i++) {
            const hour = i % 12 === 0 ? 12 : i % 12;
            const amPm = i < 12 ? 'AM' : 'PM';
            options.push({ label: `${hour} ${amPm}`, value: `${hour} ${amPm}` });
        }
        return options.map(option => <option key={option.value} value={option.label}>{option.label}</option>);
    };

    const updateEndHourOptions = (startHour) => {
        const startHourIndex = convertTo24HourFormat(startHour);
        const options = generateHourOptions().filter(option => convertTo24HourFormat(option.props.value) > startHourIndex);
        setEndHourOptions(options);

        const currentEndHourIndex = convertTo24HourFormat(formData.endHour);
        if (currentEndHourIndex <= startHourIndex) {
            setFormData(prevState => ({ ...prevState, endHour: options[0]?.props.value }));
        }
    };

    const convertTo24HourFormat = (time) => {
        const [hour, amPm] = time.split(' ');
        let hourConverted = parseInt(hour, 10);
        hourConverted += amPm === 'PM' && hourConverted !== 12 ? 12 : 0;
        hourConverted -= amPm === 'AM' && hourConverted === 12 ? 12 : 0;
        return hourConverted % 24;
    };

    const handleExcludedDaysChange = (day) => {
        setFormData((prevState) => ({
            ...prevState,
            excludedDays: prevState.excludedDays.includes(day)
                ? prevState.excludedDays.filter(d => d !== day)
                : [...prevState.excludedDays, day],
        }));
    };

    return (
        <div className="list-form-container">
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
                                {generateHourOptions()}
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
                        <label>Upload Images (Max 4)</label>
                        <input type="file" multiple onChange={handleFileChange} disabled={loading || formData.mediaDocs.length >= 4} />

                        <br />
                        <button type="submit">Submit</button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default ListBusiness;
