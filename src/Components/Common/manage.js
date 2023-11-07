import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../../firebase.js';
import { collection, doc, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

function ManageBusiness() {
    const auth = getAuth();
    const getUser = auth.currentUser;
    const user = getUser ? getUser.uid : null;
    console.log('user: ', user);
    const [bookings, setBookings] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const bookingsPerPage = 3;

    useEffect(() => {
        if (user) {
            const topLevelCollections = ['Automotive', 'HairSalon', 'Barber'];

            const fetchAllBookings = async () => {
                const bookingData = [];

                for (const collectionName of topLevelCollections) {
                    const userDocRef = doc(collection(db, collectionName), user);
                    const bookingCollectionRef = collection(userDocRef, 'booking');

                    const bookingQuerySnapshot = await getDocs(bookingCollectionRef);

                    bookingQuerySnapshot.forEach((doc) => {
                        if (doc.exists()) {
                            const data = doc.data();
                            bookingData.push({
                                id: doc.id,
                                collectionName, // Add collectionName to distinguish the collection
                                name: data.name,
                                jobType: data.jobType,
                                selectedSlot: data.selectedSlot,
                            });
                        }
                    });
                }

                // Sort the bookingData array based on timestamp proximity to the current time
                const currentTimestamp = new Date().getTime();
                bookingData.sort((a, b) => {
                    const timestampA = a.selectedSlot ? a.selectedSlot.toMillis() : 0;
                    const timestampB = b.selectedSlot ? b.selectedSlot.toMillis() : 0;

                    return Math.abs(timestampA - currentTimestamp) - Math.abs(timestampB - currentTimestamp);
                });

                console.log('All Booking data:', bookingData);
                setBookings(bookingData);
            };

            fetchAllBookings();
        }
    }, [user]);

    console.log('Rendered with bookings:', bookings);

    // Calculate the index of the last booking on the current page
    const indexOfLastBooking = currentPage * bookingsPerPage;
    // Calculate the index of the first booking on the current page
    const indexOfFirstBooking = indexOfLastBooking - bookingsPerPage;
    // Get the current page's bookings
    const currentBookings = bookings.slice(indexOfFirstBooking, indexOfLastBooking);

    return (
        <div>
            <div className='booking-confirmation'>
                <h2>Your bookings:</h2>
                <div>
                    {currentBookings.map((booking) => (
                        <div key={booking.id} className="car-details">
                            <Link
                                to={`/bookinginfo/${booking.collectionName}/${user}/${booking.id}`}
                            >
                                <p>
                                    <strong>Name:</strong> {booking.name}
                                </p>
                                <p>
                                    <strong>Job Type:</strong> {booking.jobType}
                                </p>
                                <p>
                                    <strong>Booking date and time:</strong>{' '}
                                    {booking.selectedSlot
                                        ? booking.selectedSlot.toDate().toLocaleString()
                                        : 'N/A'}
                                </p>
                            </Link>
                        </div>
                    ))}
                </div>
                <div>
                    {/* Pagination buttons */}
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
