import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import moment from 'moment';
import { db } from '../../firebase.js';
import {collection, getDocs, doc, updateDoc, setDoc, query, getDoc} from 'firebase/firestore';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import { startOfDay, addHours, isBefore } from 'date-fns';

const localizer = momentLocalizer(moment);

function CalendarSlotSelector() {
    const [events, setEvents] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [isSlotAlreadyBooked, setIsSlotAlreadyBooked] = useState(false);
    const navigate = useNavigate();
    const { doc1, documentId } = useParams();

    // Define the start and end hours for slot selection
    const startHour = 9; // Start at 9 AM
    const endHour = 18; // End at 6 PM

    // Calculate the minimum and maximum times for slot selection
    const minTime = startOfDay(new Date()).setHours(startHour, 0, 0, 0);
    const maxTime = startOfDay(new Date()).setHours(endHour, 0, 0, 0);

    useEffect(() => {
        const fetchData = async () => {
            const automotiveCollection = collection(db, 'Automotive');
            const carDoc = doc(automotiveCollection, doc1); // Reference to the car document

            try {
                // Now, access the "booked" subcollection within the car document
                const bookedCollection = collection(carDoc, 'booking');
                const querySnapshot = await getDocs(bookedCollection);

                const eventsData = [];

                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    if (data.selectedSlot) {
                        eventsData.push({
                            start: data.selectedSlot.toDate(),
                            end: addHours(data.selectedSlot.toDate(), 1),
                        });
                    }
                });

                setEvents(eventsData);

            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    }, [doc1, documentId]);

    const handleSelect = async (slotInfo) => {
        const automotiveCollection = collection(db, 'Automotive');
        const carDoc = doc(automotiveCollection, doc1);
        const bookedCollection = collection(carDoc, 'booking');
        console.log('Query Path:', bookedCollection.path);
        const carsQuery = query(bookedCollection);

        try {
            const querySnapshot = await getDocs(carsQuery);

            const selectedSlotTimestamp = slotInfo.start.getTime(); // JavaScript timestamp
            console.log(selectedSlotTimestamp);

            const bookedSlots = querySnapshot.docs.map((doc) => {
                const data = doc.data();
                console.log('selectedSlot Type: ',typeof data.selectedSlot);

                if (data.selectedSlot) {
                    // Convert Firestore timestamp to Unix timestamp and directly return
                    return data.selectedSlot.toMillis();
                }
                return null;
            });
            console.log('Query Snapshot:', querySnapshot.docs);
            console.log('Booked Slots (Unix Timestamps):', bookedSlots);

            const slotTaken = bookedSlots.includes(selectedSlotTimestamp);

            console.log('Is Slot Taken:', slotTaken);

            setIsSlotAlreadyBooked(slotTaken);

            if (!slotTaken) {
                setSelectedSlot(slotInfo.start);
            }
        } catch (error) {
            console.error('Error fetching car data:', error);
        }
    };


    const handleConfirmBooking = async () => {
        if (selectedSlot && documentId) {
            try {
                const automotiveCollection = collection(db, 'Automotive');
                const carDoc = doc(automotiveCollection, doc1);

                // Reference the 'booked' subcollection within the car document
                const bookedCollection = collection(carDoc, 'booking');

                // Fetch the document based on the documentId
                const bookedDoc = doc(bookedCollection, documentId);

                // Get the actual name and jobType values from the Firestore document
                const docSnapshot = await getDoc(bookedDoc);

                if (docSnapshot.exists()) {
                    const name = docSnapshot.data().name; // Replace 'name' with the actual field name in the document
                    const jobType = docSnapshot.data().jobType; // Replace 'jobType' with the actual field name in the document

                    // Update the 'selectedSlot' field in the first 'booked' document
                    await updateDoc(bookedDoc, {
                        selectedSlot: selectedSlot,
                    });

                    // Redirect to the Booking Confirmation page and pass the data
                    navigate('/confirmation', {
                        state: {
                            name: name,
                            jobType: jobType,
                            selectedSlot: moment(selectedSlot).format('LLL'),
                        },
                    });
                } else {
                    console.error('Document not found');
                }
            } catch (error) {
                console.error('Error updating booking document:', error);
            }
        }
    };


    return (
        <div className="calendar-slot-selector">
            <h3>Select a Time Slot</h3>
            <Calendar
                localizer={localizer}
                events={events}
                view="week"
                views={['week']}
                selectable
                onSelectSlot={handleSelect}
                step={60}
                timeslots={1}
                style={{ height: 550, width: 700 }}
                min={minTime}
                max={maxTime}
            />

            {selectedSlot && (
        <div className='slot-confirm'>
            <p>Selected Slot: {moment(selectedSlot).format('LLL')}</p>
            {isSlotAlreadyBooked ? (
                <p>Selected slot is outside the allowed time frame or already booked.</p>
            ) : (
                <button onClick={handleConfirmBooking}>Confirm Booking</button>
            )}
        </div>
    )}
</div>
);
}

export default CalendarSlotSelector;