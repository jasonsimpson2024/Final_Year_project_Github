import React, { useState, useEffect } from 'react';
import { db } from '../../firebase.js';
import { addDoc, collection, doc, getDocs, query } from 'firebase/firestore';
import { useNavigate, useLocation } from 'react-router-dom';
import InputMask from 'react-input-mask';

function BookingForm() {
    const navigate = useNavigate();
    const location = useLocation();
    const carId = location.pathname.split('/').pop(); // Extract the car ID from the URL

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        street: '',
        town: '',
        county: '',
        eircode: '',
        Make: '',
        model: '',
        year: '',
        transmission: '',
        reg: '',
        jobType: '',
        selectedSlot: null,
    });

    const carMakes = [
        'Toyota', 'Ford', 'Honda', 'Chevrolet', 'Nissan', 'Volkswagen', 'BMW', 'MercedesBenz',
        'Hyundai', 'Subaru', 'Audi', 'Jeep', 'Mazda', 'Kia', 'Lexus', 'GMC', 'Chrysler',
        'Dodge', 'Tesla', 'Volvo'
    ];

    const carModels = {
        Toyota: ['Corolla', 'RAV4', 'Highlander', 'Prius', 'Camry', 'Tacoma', 'Tundra', 'Sienna'],
        Ford: ['F-150', 'Escape', 'Mustang', 'Explorer', 'Focus', 'Edge', 'Fusion', 'Ranger'],
        Honda: ['Civic', 'Accord', 'CR-V', 'Pilot', 'Fit', 'HR-V', 'Insight', 'Odyssey'],
        Chevrolet: ['Silverado', 'Equinox', 'Malibu', 'Tahoe', 'Impala', 'Cruze', 'Traverse', 'Spark'],
        Nissan: ['Altima', 'Rogue', 'Maxima', 'Murano', 'Pathfinder', 'Sentra', 'Versa', 'Titan'],
        Volkswagen: ['Jetta', 'Passat', 'Golf', 'Tiguan', 'Atlas', 'Arteon', 'Beetle', 'ID.4'],
        BMW: ['3 Series', '5 Series', 'X5', '7 Series', 'X3', 'X7', 'Z4', 'i3'],
        'Mercedes-Benz': ['C-Class', 'E-Class', 'GLE', 'S-Class', 'GLC', 'A-Class', 'CLS', 'GLB'],
        Hyundai: ['Sonata', 'Elantra', 'Tucson', 'Santa Fe', 'Kona', 'Veloster', 'Palisade', 'Nexo'],
        Subaru: ['Outback', 'Forester', 'Impreza', 'Crosstrek', 'Legacy', 'WRX', 'BRZ', 'Ascent'],
        Audi: ['A4', 'A6', 'Q5', 'Q7', 'Q3', 'A3', 'S5', 'e-tron'],
        Jeep: ['Wrangler', 'Grand Cherokee', 'Cherokee', 'Renegade', 'Compass', 'Gladiator', 'Wagoneer'],
        Mazda: ['Mazda3', 'Mazda6', 'CX-5', 'MX-5 Miata', 'CX-9', 'CX-30', 'CX-3', 'Mazda2'],
        Kia: ['Optima', 'Sorento', 'Sportage', 'Forte', 'Soul', 'Telluride', 'Stinger', 'Rio'],
        Lexus: ['RX', 'ES', 'IS', 'NX', 'GX', 'LS', 'LX', 'RC'],
        GMC: ['Sierra', 'Acadia', 'Terrain', 'Yukon', 'Canyon', 'Savana', 'Envoy', 'Typhoon'],
        Chrysler: ['300', 'Pacifica', 'Voyager', 'Aspen', 'Saratoga'],
        Dodge: ['Charger', 'Challenger', 'Durango', 'Grand Caravan', 'Neon', 'Journey', 'Caliber', 'Nitro'],
        Tesla: ['Model S', 'Model 3', 'Model X', 'Model Y', 'Cybertruck', 'Roadster'],
        Volvo: ['XC90', 'S60', 'XC60', 'S90', 'V60', 'XC40', 'C40', 'V90'],
    };

    const years = Array.from({ length: 125 }, (_, index) => (2024 - index).toString());

    const handleCarInfoChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    useEffect(() => {
        // Fetch job types from the business's 'jobtypes' subcollection
        const fetchJobTypes = async () => {
            const businessDocRef = doc(db, 'Automotive', carId);
            const jobTypesCollectionRef = collection(businessDocRef, 'jobtypes');

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
    }, [carId]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const carData = {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                street: formData.street,
                town: formData.town,
                county: formData.county,
                eircode: formData.eircode,
                Make: formData.Make,
                model: formData.model,
                year: formData.year,
                transmission: formData.transmission,
                reg: formData.reg,
                jobType: formData.jobType,
                selectedSlot: formData.selectedSlot,
                businessID: carId,
            };

            // Reference the 'cars' collection
            const carsCollectionRef = collection(db, 'Automotive');

            // Reference the 'car' document within the 'cars' collection
            const carDocRef = doc(carsCollectionRef, carId);

            // Reference the 'bookings' subcollection within the 'car' document
            const bookingsCollectionRef = collection(carDocRef, 'booking');

            // Add data to the 'bookings' subcollection and get the document reference
            const bookingDocRef = await addDoc(bookingsCollectionRef, carData);

            // Get the document ID from the reference
            const newDocumentId = bookingDocRef.id;
            console.log('Document added successfully with ID:', newDocumentId);

            setFormData({
                name: '',
                email: '',
                phone: '',
                street: '',
                town: '',
                county: '',
                eircode: '',
                Make: '',
                model: '',
                year: '',
                transmission: '',
                reg: '',
                jobType: '',
                selectedSlot: null,
            });

            navigate(`/carslot/${carId}/${newDocumentId}`);
        } catch (error) {
            console.error('Error adding document:', error);
        }
    };

    return (
        <div className="form-container">
            <div className="booking-form-container">
                <div className="booking-form">
                    <h2>Book an Appointment</h2>
                    <form onSubmit={handleSubmit}>
                        {/* Personal Information */}
                        <h3>Personal Information</h3>
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
                        {/* Address */}
                        <h3>Address:</h3>
                        <label>
                            Street:
                            <input
                                type="text"
                                name="street"
                                value={formData.street}
                                onChange={handleCarInfoChange}
                                required
                            />
                        </label>
                        <label>
                            Town:
                            <input
                                type="text"
                                name="town"
                                value={formData.town}
                                onChange={handleCarInfoChange}
                                required
                            />
                        </label>
                        <label>
                            County:
                            <input
                                type="text"
                                name="county"
                                value={formData.county}
                                onChange={handleCarInfoChange}
                                required
                            />
                        </label>
                        <label>
                            Eircode:
                            <input
                                type="text"
                                name="eircode"
                                value={formData.eircode}
                                onChange={handleCarInfoChange}
                                required
                            />
                        </label>
                        {/* Car Information */}
                        <h3>Car Information</h3>
                        <label>
                            Make:
                            <select
                                name="Make"
                                value={formData.Make}
                                onChange={handleCarInfoChange}
                                required
                            >
                                <option value="">Select your car's make</option>
                                {carMakes.map((make) => (
                                    <option key={make} value={make}>
                                        {make}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label>
                            Model:
                            <select
                                name="model"
                                value={formData.model}
                                onChange={handleCarInfoChange}
                                required
                            >
                                <option value="">Select a car model</option>
                                {formData.Make &&
                                    carModels[formData.Make]?.map((model) => (
                                        <option key={model} value={model}>
                                            {model}
                                        </option>
                                    ))}
                            </select>
                        </label>
                        <label>
                            Year:
                            <select
                                name="year"
                                value={formData.year}
                                onChange={handleCarInfoChange}
                                required
                            >
                                <option value="">Select a year</option>
                                {years.map((year) => (
                                    <option key={year} value={year}>
                                        {year}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label>
                            Transmission:
                            <select
                                name="transmission"
                                value={formData.transmission}
                                onChange={handleCarInfoChange}
                                required
                            >
                                <option value="">Select a transmission</option>
                                <option value="Petrol">Petrol</option>
                                <option value="Diesel">Diesel</option>
                            </select>
                        </label>
                        <label>
                            Vehicle Reg Number:
                            <InputMask
                                maskChar=""
                                placeholder="e.g., 12-D-12345 or 141-D-1234"
                                type="text"
                                name="reg"
                                value={formData.reg}
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
