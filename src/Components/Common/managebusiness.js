import React, { useState, useEffect } from 'react';
import { db, auth } from '../../firebase.js';
import {query, doc, getDoc, updateDoc, addDoc, collection, getDocs, deleteDoc} from 'firebase/firestore';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { S3 } from 'aws-sdk';

const s3 = new S3({
    accessKeyId: process.env.REACT_APP_ACCESS_KEY_ID,
    secretAccessKey:process.env.REACT_APP_SECRET_ACCESS_KEY,
    region: process.env.REACT_APP_REGION

});

async function checkFileExists(bucket, key) {
    try {
        await s3.headObject({ Bucket: bucket, Key: key }).promise();
        return true; // file exists
    } catch (error) {
        if (error.statusCode === 404) {
            return false; // file does not exist
        }
        throw error;
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

function ManageBusiness() {
    const user=auth.currentUser;
    const { collectionName } = useParams();
    const navigate = useNavigate();
    const [businessData, setBusinessData] = useState({
        Name: '',
        Street: '',
        Town: '',
        County: '',
        Eircode: '',
        Phone: '',
        Description: '',
        slotDuration: '60',
        startHour: '9 AM',
        endHour: '5 PM',
    });

    const [excludedDays, setExcludedDays] = useState([]); // new state for tracking excluded days
    const [endHourOptions, setEndHourOptions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [mediaDocs, setMediaDocs] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [jobTypes, setJobTypes] = useState([]);

    const handleFileChange = (event) => {
        const files = Array.from(event.target.files).filter((file) =>
            file.type.match('image.*')
        );

        if (files.length !== event.target.files.length) {
            alert('Only image files are allowed.');
            // clear the file input if any non-image file is selected
            event.target.value = ''; // resets the file input
        } else {
            setSelectedFiles(files);
        }
    };

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
                        // update excludedDays from the fetched data if available
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
        const fetchJobTypes = async () => {
            if (user) {
                const jobTypesRef = collection(db, collectionName, user.uid, 'jobtypes');
                const snapshot = await getDocs(jobTypesRef);
                const jobTypesData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    name: doc.data().name,
                }));

                for (let i = jobTypesData.length; i < 6; i++) {
                    jobTypesData.push({ id: null, name: '' });
                }

                setJobTypes(jobTypesData);
            }
        };

        fetchJobTypes();
    }, [collectionName, user]);


    useEffect(() => {
        // dynamically generate end hour options based on the selected start hour
        updateEndHourOptions(businessData.startHour);
    }, [businessData.startHour]);

    useEffect(() => {
        const fetchMediaDocs = async () => {
            const user = auth.currentUser;
            if (user) {
                const mediaCollectionRef = collection(db, collectionName, user.uid, 'media');
                const querySnapshot = await getDocs(mediaCollectionRef);
                const mediaDocuments = querySnapshot.docs.map(doc => ({
                    ...doc.data(),
                    id: doc.id, // Store the Firestore document ID
                }));
                setMediaDocs(mediaDocuments);
            } else {
                console.log('No user is currently authenticated for fetching media.');
            }
        };

        fetchMediaDocs();
    }, [collectionName]);

    useEffect(() => {
        updateEndHourOptions(businessData.startHour);
    }, [businessData.startHour]);


    const handleChangeJobType = (index, value) => {
        let updatedJobTypes = [...jobTypes];
        updatedJobTypes[index] = { ...updatedJobTypes[index], name: value };
        setJobTypes(updatedJobTypes);
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

        // automatically adjust endHour if it's now invalid
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
        return hourConverted % 24; // ensure hour is within 0-23 range
    };

    const deletePhoto = async (event, docId, s3Key) => {
        // prevent default action
        event?.preventDefault();

        const confirmDelete = window.confirm('Do you really want to delete this photo?');
        if (confirmDelete) {
            setLoading(true);
            try {
                // delete from Firestore
                const mediaDocRef = doc(db, collectionName, user.uid, 'media', docId);
                await deleteDoc(mediaDocRef);

                // delete from S3
                const deleteParams = {
                    Bucket: 'bookinglite',
                    Key: s3Key,
                };
                await s3.deleteObject(deleteParams).promise();

                // update UI
                setMediaDocs(mediaDocs.filter(doc => doc.s3Key !== s3Key));
            } catch (error) {
                console.error('Error deleting photo:', error);
            } finally {
                setLoading(false);
            }
        }
    };

    // function to delete all documents in a subcollection
    const deleteSubcollectionDocs = async (parentDocRef, subcollectionName) => {
        const subcollectionRef = collection(db, parentDocRef.path, subcollectionName);
        const snapshot = await getDocs(subcollectionRef);

        const deletionPromises = snapshot.docs.map((doc) => {
            return deleteDoc(doc.ref);
        });

        await Promise.all(deletionPromises);
    };

// function to delete a document and its known subcollections
    const deleteMediaFilesFromS3 = async (parentDocRef, subcollectionName) => {
        const subcollectionRef = collection(db, parentDocRef.path, subcollectionName);
        const snapshot = await getDocs(subcollectionRef);

        const s3DeletionPromises = snapshot.docs.map((doc) => {
            const media = doc.data();
            const deleteParams = {
                Bucket: 'bookinglite', // Your S3 bucket name
                Key: media.s3Key,
            };
            return s3.deleteObject(deleteParams).promise();
        });

        await Promise.all(s3DeletionPromises);
    };

// enhanced function to delete a document, its subcollections, and S3 media
    const deleteDocumentAndSubcollections = async (docPath) => {
        // first, delete media files from S3 in the 'media' subcollection
        await deleteMediaFilesFromS3(doc(db, docPath), 'media');

        // then, delete documents in subcollections
        const subcollections = ['media', 'jobtypes'];
        for (const subcollectionName of subcollections) {
            await deleteSubcollectionDocs(doc(db, docPath), subcollectionName);
        }

        // finally, delete the main document
        await deleteDoc(doc(db, docPath));
    };

    const handleBusinessDelete = async () => {
        const isConfirmed = window.confirm("Are you sure you want to delete your business?");
        if (!isConfirmed) {
            return;
        }
        setLoading(true);

        try {
            const docPath = `${collectionName}/${user.uid}`;
            await deleteDocumentAndSubcollections(docPath);

            navigate('/'); // navigate away after deletion
        } catch (error) {
            console.error('Error during deletion process:', error);
        } finally {
            setLoading(false);
        }
    };


    const handleUpdate = async () => {
        setLoading(true);
        try {
            // prevent upload if there are already more than 4 documents in the media collection
            if (mediaDocs.length > 4) {
                alert('Cannot upload more than 4 images.');
                return;
            }

            // handle multiple file uploads
            if (selectedFiles.length > 0) {
                for (let file of selectedFiles) {
                    let fileName = file.name;
                    let uniqueFileName = await getUniqueFilename('bookinglite', fileName);

                    const s3Key = `photos/${uniqueFileName}`;

                    const uploadParams = {
                        Bucket: 'bookinglite',
                        Key: s3Key,
                        Body: file,
                    };

                    // upload file to S3
                    await s3.upload(uploadParams).promise();

                    // get the download URL
                    const downloadURL = s3.getSignedUrl('getObject', {
                        Bucket: 'bookinglite',
                        Key: s3Key,
                        Expires: 9999999,
                    });

                    // create document in Firestore
                    const mediaCollectionRef = collection(db, collectionName, auth.currentUser.uid, 'media');
                    await addDoc(mediaCollectionRef, {
                        title: uniqueFileName,
                        url: downloadURL,
                        s3Key: s3Key,
                    });
                }
            }

            if (auth.currentUser) {
                const documentRef = doc(db, collectionName, auth.currentUser.uid);

                await updateDoc(documentRef, {
                    ...businessData,
                    slotDuration: parseInt(businessData.slotDuration, 10),
                    startHour: businessData.startHour,
                    endHour: businessData.endHour,
                    excludedDays,
                });

                console.log('Document updated successfully!');
                navigate("/");
            } else {
                console.log('No user is currently authenticated.');
            }

            for (const [index, jobType] of jobTypes.entries()) {
                if (jobType.id) {
                    // update existing job type
                    const jobTypeDocRef = doc(db, collectionName, user.uid, 'jobtypes', jobType.id);
                    await updateDoc(jobTypeDocRef, { name: jobType.name });
                } else if (jobType.name.trim() !== '') {
                    // add new job type if it has a name
                    const jobTypesRef = collection(db, collectionName, user.uid, 'jobtypes');
                    await addDoc(jobTypesRef, { name: jobType.name });
                }
            }

        } catch (error) {
            console.error('Error during update:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="list-form-container">
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
                        <label>Phone:</label>
                        <input placeholder="eg: 0871234567" type="text" name="Phone" value={businessData.Phone} onChange={handleChange} />
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
                        <br />
                        {jobTypes.slice(0, 10).map((jobType, index) => (
                            <div key={index}>
                                <label>Job Type {index + 1}:</label>
                                <input
                                    type="text"
                                    name={`jobType-${index}`}
                                    value={jobType.name}
                                    onChange={(e) => handleChangeJobType(index, e.target.value)}
                                />
                                <br />
                            </div>
                        ))}
                        <br />
                        <button
                            type="button"
                            onClick={() => {
                                if (jobTypes.length < 10) {
                                    setJobTypes([...jobTypes, { id: null, name: '' }]);
                                } else {
                                    alert('You can only add up to 10 job types.');
                                }
                            }}
                            disabled={jobTypes.length >= 10}
                        >
                            Add Job Type
                        </button>
                        <br/>
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
                        <br/>
                        <div className="exclude-days-container">
                            {mediaDocs.map((doc, index) => (
                                <div key={index} className="photo-container">
                                    <img src={doc.url} alt={doc.title} style={{ width: '100px', height: '100px' }} />
                                    <button
                                        className="delete-button"
                                        onClick={(e) => deletePhoto(e, doc.id, doc.s3Key)}
                                    >
                                        X
                                    </button>
                                </div>
                            ))}
                            <br />
                        </div>
                        <br />
                        <label>Upload Images (Max 4)</label>
                        <input type="file" multiple onChange={handleFileChange} disabled={loading || mediaDocs.length >= 4} />
                        {loading && <p>Please Wait...</p>}
                        <br/>
                        <button type="button" onClick={handleUpdate} disabled={loading}>
                            {loading ? 'Updating...' : 'Update'}
                        </button>
                        <button type="button" onClick={handleBusinessDelete}>
                            Delete Business
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );

}

export default ManageBusiness;

