import React, {useEffect, useState} from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { db, auth } from '../../firebase.js';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';

function BeautyDetails() {
    const user = auth.currentUser;
    const uid = user ? user.uid : null;
    const [hair, setHair] = React.useState(null);
    const [photos, setPhotos] = useState([]);
    const [selectedImageUrl, setSelectedImageUrl] = useState(null);
    const [isZoomed, setIsZoomed] = useState(false);
    const [isLoading, setIsLoading] = React.useState(true);
    const [isBusinessAccount, setIsBusinessAccount] = useState(false);
    const location = useLocation();
    const hairId = location.pathname.split('/').pop();
    const navigate = useNavigate();

    useEffect(() => {

        const checkIfBusinessAccount = async () => {
            if (uid) {
                const docRef = doc(db, 'Business', uid);
                const docSnap = await getDoc(docRef);
                setIsBusinessAccount(docSnap.exists()); // set true if user is a business account, else false
            }
        };

        const fetchBarberDataAndPhotos = async () => {
            setIsLoading(true);
            try {
                const docRef = doc(db, 'BeautySalon', hairId);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setHair(docSnap.data());
                } else {
                    console.log("No such document!");
                }

                const mediaCollectionRef = collection(db, 'BeautySalon', hairId, 'media');
                const querySnapshot = await getDocs(mediaCollectionRef);
                const mediaDocuments = querySnapshot.docs.map(doc => ({
                    url: doc.data().url,
                    id: doc.id,
                }));
                setPhotos(mediaDocuments);
            } catch (error) {
                console.error('Error fetching barber and photos:', error);
            } finally {
                setIsLoading(false);
            }
        };
        checkIfBusinessAccount();
        fetchBarberDataAndPhotos();
    }, [hairId]);

    const handleImageClick = (imageUrl) => {
        setSelectedImageUrl(imageUrl);
        setIsZoomed(true);
    };

    const handleCloseImage = () => {
        setIsZoomed(false);
        setTimeout(() => setSelectedImageUrl(null), 300);
    };


    const handleAppointmentBooking = () => {
        if (isBusinessAccount) { // prevents booking if the user has a business account
            alert("Business accounts cannot book appointments.");
        } else {
            navigate(`/bookbeautysalon/${hairId}`);
        }
    };

    if (isLoading) {
        return <p>Loading...</p>;
    }

    if (!hair) {
        return <p>No BeautySalon found.</p>;
    }

    return (
        <div>
            <div className='page-header'>
                <div className='normal-container'>
                    <h2>{hair.Name}</h2>
                    <p>
                        Location: {hair.Street}, {hair.Town},
                        <br/>
                        {hair.County} {hair.Eircode}
                    </p>
                    <p>
                        Phone:
                        {hair.Phone ? (
                            <a href={`tel:${hair.Phone}`}> {hair.Phone}</a>
                        ) : (
                            ' N/A'
                        )}
                    </p>
                    <p>{hair.Description}</p>
                    <div className="photos-container">
                        {photos.map((photo, index) => (
                            <img
                                className='photos'
                                key={index}
                                src={photo.url}
                                alt="Barber media"
                                onClick={() => handleImageClick(photo.url)}
                            />
                        ))}
                    </div>

                    <button onClick={handleAppointmentBooking}>Book an Appointment</button>
                </div>
            </div>
            {selectedImageUrl && (
                <div
                    className="image-overlay"
                    onClick={handleCloseImage}
                >
                    <img
                        className={`enlarged-photo ${isZoomed ? 'zoomIn' : 'zoomOut'}`}
                        src={selectedImageUrl}
                        alt="Enlarged"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </div>
    );
}

export default BeautyDetails;
