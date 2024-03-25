import React, { useState } from 'react';
import { db } from '../../firebase.js';
import { doc, collection, addDoc } from 'firebase/firestore';
import { useNavigate, useParams } from 'react-router-dom';


function AddJobTypes() {
    const navigate = useNavigate();
    const { businessModel, uid } = useParams(); // get businessModel and UID from URL parameters

    const [formData, setFormData] = useState({
        jobType1: '',
        jobType2: '',
        jobType3: '',
        jobType4: '',
        jobType5: '',
        jobType6: '',
    });


    const handleJobTypeChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const jobTypes = [];
            for (let i = 1; i <= 6; i++) {
                if (formData[`jobType${i}`]) {
                    jobTypes.push(formData[`jobType${i}`]);
                }
            }

            if (jobTypes.length === 0) {
                console.log('At least one job type is required.');
                return;
            }

            const businessDocRef = doc(db, businessModel, uid); // use the user's UID as the document ID

            // add job types to the "jobtypes" subcollection
            const jobTypesCollectionRef = collection(businessDocRef, 'jobtypes');
            jobTypes.forEach(async (jobType) => {
                await addDoc(jobTypesCollectionRef, { name: jobType });
            });

            navigate(`/`);
        } catch (error) {
            console.error('Error adding job types:', error);
        }
    };

    return (
        <div className="form-container">
            <div className="booking-form-container">
                <div className="booking-form">
                    <h2>Add Job Types</h2>
                    <form onSubmit={handleSubmit}>
                        <label>
                            Job Type 1:
                            <input
                                type="text"
                                name="jobType1"
                                value={formData.jobType1}
                                onChange={handleJobTypeChange}
                            />
                        </label>
                        <label>
                            Job Type 2:
                            <input
                                type="text"
                                name="jobType2"
                                value={formData.jobType2}
                                onChange={handleJobTypeChange}
                            />
                        </label>
                        <label>
                            Job Type 3:
                            <input
                                type="text"
                                name="jobType3"
                                value={formData.jobType3}
                                onChange={handleJobTypeChange}
                            />
                        </label>
                        <label>
                            Job Type 4:
                            <input
                                type="text"
                                name="jobType4"
                                value={formData.jobType4}
                                onChange={handleJobTypeChange}
                            />
                        </label>
                        <label>
                            Job Type 5:
                            <input
                                type="text"
                                name="jobType5"
                                value={formData.jobType5}
                                onChange={handleJobTypeChange}
                            />
                        </label>
                        <label>
                            Job Type 6:
                            <input
                                type="text"
                                name="jobType6"
                                value={formData.jobType6}
                                onChange={handleJobTypeChange}
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

export default AddJobTypes;
