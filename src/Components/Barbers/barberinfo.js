import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { db, auth } from '../../firebase.js';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';

function BarberDetails() {
    const user=auth.currentUser;
    const uid = user ? user.uid : null;
    const [barber, setBarber] = useState(null);
    const [photos, setPhotos] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedImageUrl, setSelectedImageUrl] = useState(null);
    const [isZoomed, setIsZoomed] = useState(false);
    const location = useLocation();
    const barberId = location.pathname.split('/').pop();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchBarberDataAndPhotos = async () => {
            setIsLoading(true);
            try {
                const docRef = doc(db, 'Barber', barberId);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setBarber(docSnap.data());
                } else {
                    console.log("No such document!");
                }

                const mediaCollectionRef = collection(db, 'Barber', barberId, 'media');
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
    }, [barberId]);

    const handleImageClick = (imageUrl) => {
        setSelectedImageUrl(imageUrl);
        setIsZoomed(true); // Indicate that the image is zoomed in
    };

    const handleCloseImage = () => {
        setIsZoomed(false); // Start zooming out
        setTimeout(() => setSelectedImageUrl(null), 300); // Wait for animation to complete
    };

    const handleAppointmentBooking = () => {
        if (barberId == uid) {
            alert("You may not book an appointment with your own business.");
        }
        else {
            navigate(`/barber/${barberId}`);
        }
    };

    if (isLoading) return <p>Loading...</p>;
    if (!barber) return <p>No barber found.</p>;

    return (
        <div>
            <div className='page-header'>
                <div className='normal-container'>
                    <h2>{barber.Name}</h2>
                    <p>
                        Location: {barber.Street}, {barber.Town}, {barber.County} - Eircode: {barber.Eircode}
                    </p>
                    <p>{barber.Description}</p>
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

export default BarberDetails;
