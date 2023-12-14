import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../../firebase.js';
import { doc, getDoc, deleteDoc } from 'firebase/firestore'; // Import deleteDoc
import { useNavigate } from 'react-router-dom';

function BookingInfo() {
    const navigate = useNavigate();
    const { collectionName, userId, bookingId } = useParams();

    const [bookingData, setBookingData] = useState(null);

    useEffect(() => {
        const fetchBookingData = async () => {
            try {
                const bookingDocRef = doc(db, collectionName, userId, 'booking', bookingId);
                const bookingDocSnapshot = await getDoc(bookingDocRef);

                if (bookingDocSnapshot.exists()) {
                    const data = bookingDocSnapshot.data();
                    const Slot = data.selectedSlot
                        ? new Date(data.selectedSlot.seconds * 1000).toLocaleString()
                        : 'N/A';
                    setBookingData({ ...data, Slot });
                } else {
                    console.log('Booking not found.');
                }
            } catch (error) {
                console.error('Error fetching booking data:', error);
            }
        };

        fetchBookingData();
    }, [collectionName, userId, bookingId]);

    const handleDelete = async () => {
        const confirmDelete = window.confirm('Are you sure you want to cancel this booking?');

        if (confirmDelete) {
            try {
                const bookingDocRef = doc(db, collectionName, userId, 'booking', bookingId);
                await deleteDoc(bookingDocRef);
                alert('Booking Cancelled');
                navigate("/manage");
                // You may also redirect the user to a different page or perform any other action after deletion.
            } catch (error) {
                console.error('Error deleting booking:', error);
            }
        }
    };

    if (bookingData) {
        const fieldOrder =
            collectionName === 'Automotive'
                ? ['name', 'phone', 'Make', 'model', 'year', 'jobType', 'Slot']
                : ['name', 'phone', 'email', 'jobType', 'Slot'];

        return (
            <div className='booking-confirmation'>
                <div className='car-details'>
                    <h2>Booking Information</h2>
                    {fieldOrder.map((field) => (
                        <div key={field}>
                            <strong>{field}:</strong> {bookingData[field] ? bookingData[field].toString() : 'N/A'}
                        </div>
                    ))}
                    <button onClick={handleDelete}>Cancel Booking</button>
                </div>
            </div>
        );

    } else {
        return <div>Loading...</div>;
    }
}

export default BookingInfo;
