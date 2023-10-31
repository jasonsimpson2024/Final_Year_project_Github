/*import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import moment from 'moment';
import { db } from '../../firebase.js';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Calendar, momentLocalizer } from 'react-big-calendar';

const localizer = momentLocalizer(moment);

function CalendarSlotSelector() {
    const [events, setEvents] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [isSlotAlreadyBooked, setIsSlotAlreadyBooked] = useState(false);
    const navigate = useNavigate();
    const { documentId } = useParams();

    useEffect(() => {
        const fetchData = async () => {
            const carsCollection = collection(db, 'cars');
            const q = query(carsCollection);

            try {
                const querySnapshot = await getDocs(q);
                const eventsData = [];

                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    if (doc.id !== documentId && data.selectedSlot) { // Exclude the document specified in the URL
                        eventsData.push(data);
                    }
                });

                console.log('Fetched data:', eventsData); // Log the fetched data

                setEvents(eventsData);
            } catch (error) {
                console.error('Error fetching document:', error);
            }
        };

        fetchData();
    }, [documentId]);



    const handleSelect = async (slotInfo) => {
        const carsCollection = collection(db, 'cars');
        const carsQuery = query(carsCollection);

        const carsData = [];
        try {
            const querySnapshot = await getDocs(carsQuery);
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                if (doc.id !== documentId && data.selectedSlot) { // Exclude the document specified in the URL
                    carsData.push(data);
                }
            });
        } catch (error) {
            console.error('Error fetching car data:', error);
        }

        // Check if the selected slot is booked in any of the events
        const slotTaken = carsData.some((data) => {
            const selectedSlotTimestamp = slotInfo.start.getTime();
            const dataTimestamp = data.selectedSlot.toDate().getTime();
            return selectedSlotTimestamp === dataTimestamp;
        });

        setIsSlotAlreadyBooked(slotTaken);

        if (!slotTaken) {
            setSelectedSlot(slotInfo.start);
        }
    };

    const handleConfirmBooking = async () => {
        if (selectedSlot) {
            try {
                const newEvent = {
                    start: selectedSlot,
                    end: moment(selectedSlot).add(1, 'hour').toDate(),
                };
                setEvents([...events, newEvent]);

                const carsCollection = collection(db, 'cars');
                const carDoc = doc(carsCollection, documentId);
                await updateDoc(carDoc, {
                    selectedSlot: selectedSlot,
                });

                navigate('/home');
            } catch (error) {
                console.error('Error updating document:', error);
            }
        }
    };

    const minTime = new Date().setHours(9, 0, 0, 0);
    const maxTime = new Date().setHours(18, 0, 0, 0);

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
                <div>
                    <p>Selected Slot: {moment(selectedSlot).format('LLL')}</p>
                    {isSlotAlreadyBooked ? (
                        <p>Selected slot is already booked</p>
                    ) : (
                        <button onClick={handleConfirmBooking}>Confirm Booking</button>
                    )}
                </div>
            )}
        </div>
    );
}

export default CalendarSlotSelector;*/