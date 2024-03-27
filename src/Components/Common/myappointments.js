import React, { useState, useEffect } from 'react';
import { Link, useNavigate} from 'react-router-dom';
import { db } from '../../firebase.js';
import { collection, doc, getDocs, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

function ManageBusiness() {
    const auth = getAuth();
    const navigate = useNavigate();
    const user = auth.currentUser ? auth.currentUser.uid : null;
    const [bookings, setBookings] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const bookingsPerPage = 3;

    useEffect(() => {



        const loadBookingsFromLocalStorage = () => {
            const storedBookings = localStorage.getItem('bookings');
            if (storedBookings) {
                setBookings(JSON.parse(storedBookings));
            }
        };

        loadBookingsFromLocalStorage();

        if (user) {
            const topLevelCollections = ['Automotive', 'HairSalon', 'Barber', 'BeautySalon', 'SPA', 'Other'];
            const currentTimestamp = new Date().getTime();

            const fetchAllBookings = async () => {
                const bookingData = [];

                for (const collectionName of topLevelCollections) {
                    const businessCollectionRef = collection(db, collectionName);
                    const businessQuerySnapshot = await getDocs(businessCollectionRef);

                    for (const businessDoc of businessQuerySnapshot.docs) {
                        const businessDocId = businessDoc.id; // stores the business document ID

                        const bookingDocRef = doc(db, collectionName, businessDocId, 'booking', user);

                        try {
                            const bookingDocSnapshot = await getDoc(bookingDocRef);
                            if (bookingDocSnapshot.exists()) {
                                const data = bookingDocSnapshot.data();
                                const selectedSlot = data.selectedSlot ? data.selectedSlot.toMillis() : 0;
                                if (selectedSlot > currentTimestamp) {
                                    bookingData.push({
                                        businessDocId,
                                        collectionName,
                                        name: data.name,
                                        jobType: data.jobType,
                                        selectedSlot: data.selectedSlot,
                                    });
                                }
                            }
                        } catch (error) {
                            console.error("Error fetching booking:", error);
                        }
                    }
                }

                bookingData.sort((a, b) => {
                    const timestampA = a.selectedSlot ? a.selectedSlot.toMillis() : 0;
                    const timestampB = b.selectedSlot ? b.selectedSlot.toMillis() : 0;
                    return Math.abs(timestampA - currentTimestamp) - Math.abs(timestampB - currentTimestamp);
                });

                localStorage.setItem('bookings', JSON.stringify(bookingData));
                setBookings(bookingData);
            };

            fetchAllBookings();
        }
    }, [user, navigate]);

    // calculate the index of the last booking on the current page
    const indexOfLastBooking = currentPage * bookingsPerPage;
    // calculate the index of the first booking on the current page
    const indexOfFirstBooking = indexOfLastBooking - bookingsPerPage;
    // get the current page's bookings
    const currentBookings = bookings.slice(indexOfFirstBooking, indexOfLastBooking);

    return (
        <div>
            <div className='booking-confirmation'>
                <h2>Your Appointments:</h2>
                <div>
                    {currentBookings.map((booking) => (
                        <div key={booking.businessDocId} className="car-details">
                            <Link to={`/appointinfo/${booking.collectionName}/${booking.businessDocId}/${user}`}>
                                <p>
                                    <strong>Name:</strong> {booking.name}
                                </p>
                                <p>
                                    <strong>Job Type:</strong> {booking.jobType}
                                </p>
                                <p>
                                    <strong>Booking date and time:</strong>{' '}
                                    {booking.selectedSlot
                                        ? (() => {
                                            const timestamp = booking.selectedSlot.seconds * 1000; // convert seconds to milliseconds
                                            const datePart = new Date(timestamp).toLocaleDateString();
                                            const timePart = new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                            return `${datePart} ${timePart}`;
                                        })()
                                        : 'N/A'}
                                </p>
                            </Link>
                        </div>
                    ))}
                </div>
                <div className='pagination'>
                    <button
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        Previous
                    </button>
                    <button
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={indexOfLastBooking >= bookings.length}
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ManageBusiness;
