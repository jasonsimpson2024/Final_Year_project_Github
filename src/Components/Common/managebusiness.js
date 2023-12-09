import React, { useState, useEffect } from 'react';
import { db, auth } from '../../firebase.js';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useParams } from 'react-router-dom';

function ManageBusiness() {
    const { collectionName, id } = useParams();
    const [businessData, setBusinessData] = useState({
        Name: '',
        Street: '',
        Town: '',
        County: '',
        Eircode: '',
    });

    useEffect(() => {
        const fetchBusinessData = async () => {
            try {
                const user = auth.currentUser;

                if (user) {
                    const documentRef = doc(db, collectionName, user.uid);
                    const documentSnapshot = await getDoc(documentRef);

                    if (documentSnapshot.exists()) {
                        const docData = documentSnapshot.data();
                        setBusinessData({
                            id: documentSnapshot.id,
                            Name: docData.Name,
                            Street: docData.Street,
                            Town: docData.Town,
                            County: docData.County,
                            Eircode: docData.Eircode,
                        });
                    }
                } else {
                    console.log('No user is currently authenticated.');
                }
            } catch (error) {
                console.error('Error fetching business data:', error);
            }
        };

        fetchBusinessData();
    }, [collectionName, id]);

    const handleUpdate = async () => {
        try {
            const user = auth.currentUser;

            if (user) {
                const documentRef = doc(db, collectionName, user.uid);
                await updateDoc(documentRef, businessData);
                console.log('Document updated successfully!');
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
                <button type="button" onClick={handleUpdate}>
                    Update
                </button>
            </form>
                </div>
            </div>
        </div>
    );
}

export default ManageBusiness;
