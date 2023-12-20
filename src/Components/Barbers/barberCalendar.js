import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import moment from 'moment';
import { db } from '../../firebase.js';
import { collection, getDocs, doc, updateDoc, query, getDoc } from 'firebase/firestore';

function CalendarSlotSelector() {
    const [events, setEvents] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [isSlotAlreadyBooked, setIsSlotAlreadyBooked] = useState(false);
    const navigate = useNavigate();
    const { doc1, documentId } = useParams();

    // Define the start and end hours for slot selection
    const startHour = 9; // Start at 9 AM
    const endHour = 18; // End at 6 PM
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const hours = Array.from({ length: endHour - startHour }, (_, i) => startHour + i);

    useEffect(() => {
        const fetchData = async () => {
            const automotiveCollection = collection(db, 'Barber');
            const carDoc = doc(automotiveCollection, doc1);

            try {
                const bookedCollection = collection(carDoc, 'booking');
                const querySnapshot = await getDocs(bookedCollection);

                const eventsData = querySnapshot.docs.map(doc => {
                    const data = doc.data();
                    if (data.selectedSlot) {
                        return {
                            start: data.selectedSlot.toDate(),
                            end: moment(data.selectedSlot.toDate()).add(1, 'hours').toDate(),
                        };
                    }
                    return null;
                }).filter(event => event != null);

                setEvents(eventsData);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, [doc1, documentId]);

    const handleSlotSelect = async (day, hour) => {
        const slotTime = moment().day(day).hour(hour).minute(0).second(0);

        const selectedSlotTimestamp = slotTime.valueOf();
        const slotTaken = events.some(event => {
            const eventStart = moment(event.start).valueOf();
            return eventStart === selectedSlotTimestamp;
        });

        setIsSlotAlreadyBooked(slotTaken);

        if (!slotTaken) {
            setSelectedSlot(slotTime.toDate());
        }
    };

    const handleConfirmBooking = async () => {
        if (selectedSlot && documentId && !isSlotAlreadyBooked) {
            const automotiveCollection = collection(db, 'Barber');
            const carDoc = doc(automotiveCollection, doc1);
            const bookedDoc = doc(carDoc, 'booking', documentId);

            try {
                await updateDoc(bookedDoc, {
                    selectedSlot: selectedSlot,
                });

                navigate('/confirmation', {
                    state: {
                        selectedSlot: moment(selectedSlot).format('LLL'),
                    },
                });
            } catch (error) {
                console.error('Error updating booking document:', error);
            }
        }
    };

    return (
        <div className="calendar-slot-selector">
            <div className="custom-calendar">
                <div className="days-header">
                    {daysOfWeek.map(day => (
                        <div key={day} className="day-header">{day}</div>
                    ))}
                </div>
                <div className="slots">
                    {daysOfWeek.map(day => (
                        <div key={day} className="day-column">
                            {hours.map(hour => {
                                const slotTime = moment().day(day).hour(hour).minute(0).second(0).toDate();
                                const isBooked = events.some(event => moment(event.start).isSame(slotTime, 'minute'));

                                return (
                                    <div
                                        key={hour}
                                        className={`time-slot ${selectedSlot && moment(selectedSlot).isSame(slotTime, 'minute') ? 'selected' : ''} ${isBooked ? 'booked' : ''}`}
                                        onClick={() => !isBooked && handleSlotSelect(day, hour)}
                                        disabled={isBooked}
                                    >
                                        {hour}:00
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>
            {selectedSlot && (
                <div className='slot-confirm'>
                    <p>Selected Slot: {moment(selectedSlot).format('LLL')}</p>
                    {isSlotAlreadyBooked ? (
                        <p>This slot is already booked. Please select another time.</p>
                    ) : (
                        <button onClick={handleConfirmBooking}>Confirm Booking</button>
                    )}
                </div>
            )}
        </div>
    );
}

export default CalendarSlotSelector;
