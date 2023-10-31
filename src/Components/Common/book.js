import React, { useState } from 'react';
import PropTypes from 'prop-types';

function BookingForm({ businessType, onSubmit }) {
    const [formData, setFormData] = useState({});

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <div className="booking-form-container">
            <div className="booking-form">
                <h2>Book an Appointment</h2>
                <form onSubmit={handleSubmit}>
                    {businessType === 'mechanic' && (
                        <div>
                            <label>
                                Name:
                                <input type="text" name="name" onChange={handleFormChange} required />
                            </label>
                            {/* Add more mechanic-specific fields */}
                        </div>
                    )}
                    {businessType === 'hairdresser' && (
                        <div>
                            <label>
                                Name:
                                <input type="text" name="name" onChange={handleFormChange} required />
                            </label>
                            {/* Add more hairdresser-specific fields */}
                        </div>
                    )}
                    {/* Render common form fields */}
                    <button type="submit">Submit</button>
                </form>
            </div>
        </div>
    );
}

BookingForm.propTypes = {
    businessType: PropTypes.string.isRequired,
    onSubmit: PropTypes.func.isRequired,
};

export default BookingForm;
