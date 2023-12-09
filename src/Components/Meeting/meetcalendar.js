import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import moment from 'moment';
import { db } from '../../firebase.js';
import { collection, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import { startOfDay, addMinutes } from 'date-fns';

// ... (existing imports)

// ... (existing imports)

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
            const automotiveCollection = collection(db, 'Meeting');
            const carDoc = doc(automotiveCollection, doc1);

            try {
                const bookedCollection = collection(carDoc, 'booking');
                const querySnapshot = await getDocs(bookedCollection);

                const eventsData = [];

                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    if (data.selectedSlot) {
                        // Split the hour into 30-minute slots and add separate events for each slot
                        let startSlot = data.selectedSlot.toDate();
                        const endSlot = addMinutes(data.selectedSlot.toDate(), 30);

                        while (startSlot < endSlot) {
                            eventsData.push({
                                id: doc.id, // Use document ID as the event ID
                                title: data.name, // Display name in the event title
                                start: startSlot,
                                end: addMinutes(startSlot, 30), // 30 minutes duration for each slot
                            });
                            startSlot = addMinutes(startSlot, 30);
                        }
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
        const selectedSlotStart = slotInfo.start.getTime();
        const selectedSlotEnd = addMinutes(slotInfo.start, 30).getTime();

        const slotTaken = events.some(
            (event) =>
                (selectedSlotStart >= event.start.getTime() && selectedSlotStart < event.end.getTime()) ||
                (selectedSlotEnd > event.start.getTime() && selectedSlotEnd <= event.end.getTime()) ||
                (selectedSlotStart <= event.start.getTime() && selectedSlotEnd >= event.end.getTime())
        );

        console.log('Is Slot Taken:', slotTaken);

        setIsSlotAlreadyBooked(slotTaken);

        if (!slotTaken) {
            setSelectedSlot(slotInfo.start);
        }
    };

    const handleConfirmBooking = async () => {
        if (selectedSlot && documentId) {
            try {
                const automotiveCollection = collection(db, 'Meeting');
                const carDoc = doc(automotiveCollection, doc1);
                const bookedCollection = collection(carDoc, 'booking');
                const bookedDoc = doc(bookedCollection, documentId);

                const docSnapshot = await getDoc(bookedDoc);

                if (docSnapshot.exists()) {
                    const name = docSnapshot.data().name;
                    const jobType = docSnapshot.data().jobType;

                    await updateDoc(bookedDoc, {
                        selectedSlot: selectedSlot,
                    });

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
                view="day"
                views={['day']}
                selectable
                onSelectSlot={handleSelect}
                step={30} // 30 min selections
                timeslots={1} // 1 selection per slot
                style={{ height: 600, width: 1000 }}
                min={minTime}
                max={maxTime}
                eventPropGetter={(event) => {
                    return {
                        style: {
                            backgroundColor: event.end.getTime() === addMinutes(event.start, 30).getTime() ? 'green' : 'red',
                        },
                    };
                }}
                tooltipAccessor={(event) => `${event.title} - ${moment(event.start).format('LT')}`}
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

