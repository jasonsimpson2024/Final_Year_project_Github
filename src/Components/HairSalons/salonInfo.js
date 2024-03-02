import React, {useEffect, useState} from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { db, auth } from '../../firebase.js';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';

function SalonDetails() {
    const user = auth.currentUser;
    const uid = user ? user.uid : null;
    const [hair, setHair] = React.useState(null);
    const [photos, setPhotos] = useState([]);
    const [selectedImageUrl, setSelectedImageUrl] = useState(null);
    const [isZoomed, setIsZoomed] = useState(false);
    const [isLoading, setIsLoading] = React.useState(true);
    const location = useLocation();
    const hairId = location.pathname.split('/').pop();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchBarberDataAndPhotos = async () => {
            setIsLoading(true);
            try {
                const docRef = doc(db, 'HairSalon', hairId);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setHair(docSnap.data());
                } else {
                    console.log("No such document!");
                }

                const mediaCollectionRef = collection(db, 'HairSalon', hairId, 'media');
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

        fetchBarberDataAndPhotos();
    }, [hairId]);

    const handleImageClick = (imageUrl) => {
        setSelectedImageUrl(imageUrl);
        setIsZoomed(true); // Indicate that the image is zoomed in
    };

    const handleCloseImage = () => {
        setIsZoomed(false); // Start zooming out
        setTimeout(() => setSelectedImageUrl(null), 300); // Wait for animation to complete
    };


    const handleAppointmentBooking = () => {
        if (hairId == uid) {
            alert("You may not book an appointment with your own business.");
        }
        else {
            navigate(`/bookhairsalon/${hairId}`);
        }
    };

    if (isLoading) {
        return <p>Loading...</p>;
    }

    if (!hair) {
        return <p>No Hair Salon found.</p>;
    }

    return (
        <div>
            <div className='page-header'>
                <div className='normal-container'>
                    <h2>{hair.Name}</h2>
                    <p>
                        Location: {hair.Street}, {hair.Town}, {hair.County} - Eircode: {hair.Eircode}
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
                    {/* Use handleAppointmentBooking instead of direct navigate */}
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

export default SalonDetails;
