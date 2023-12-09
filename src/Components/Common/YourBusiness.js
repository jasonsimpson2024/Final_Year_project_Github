import React, { useEffect, useState } from 'react';
import { db, auth } from '../../firebase.js';
import { doc, getDoc } from 'firebase/firestore';
import { Link } from 'react-router-dom';

function UserDocuments() {
    const [userDocs, setUserDocs] = useState([]);

    useEffect(() => {
        const fetchUserDocs = async () => {
            try {
                const user = auth.currentUser;

                if (user) {
                    const collections = ['Automotive', 'Barber', 'HairSalon', 'Meeting'];
                    const allUserDocs = [];

                    for (const collectionName of collections) {
                        const documentRef = doc(db, collectionName, user.uid);
                        const documentSnapshot = await getDoc(documentRef);

                        if (documentSnapshot.exists()) {
                            const docData = documentSnapshot.data();

                            allUserDocs.push({
                                id: documentSnapshot.id,
                                Name: docData.Name,
                                Street: docData.Street,
                                Town: docData.Town,
                                County: docData.County,
                                Eircode: docData.Eircode,
                                collection: collectionName,
                            });
                        }
                    }

                    setUserDocs(allUserDocs);

                    // Save the userDocs array to localStorage
                    localStorage.setItem('userDocs', JSON.stringify(allUserDocs));
                } else {
                    console.log('No user is currently authenticated.');
                }
            } catch (error) {
                console.error('Error fetching user documents:', error);
            }
        };

        // Fetch userDocs on component mount and whenever authentication changes
        const unsubscribe = auth.onAuthStateChanged(() => {
            fetchUserDocs();
        });

        // Cleanup function to unsubscribe from the auth state listener
        return () => unsubscribe();
    }, []); // Empty dependency array means this effect only runs on mount and unmount

    return (
        <div>
            <div className='page-header'>
                <div className="header-buttons">
                </div>
                <div className="car-details-list">
                    {userDocs.map((doc) => (
                        <div key={doc.id} className="car-details">
                            <Link to={`/managebusiness/${doc.collection}/${doc.id}`}>
                                Name: {doc.Name} <br />
                                Location: {doc.Street} {doc.Town} {doc.County} {doc.Eircode}
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default UserDocuments;
