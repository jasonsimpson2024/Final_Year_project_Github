import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import moment from 'moment';
import { db } from '../../firebase.js';
import { collection, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';

function CalendarSlotSelector() {
    const [events, setEvents] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [isSlotAlreadyBooked, setIsSlotAlreadyBooked] = useState(false);
    const [slotDuration, setSlotDuration] = useState(60); // Default slot duration in minutes
    const [businessHours, setBusinessHours] = useState({ startHour: 9, endHour: 17 }); // Default business hours in 24-hour format
    const navigate = useNavigate();
    const { doc1, documentId } = useParams();

    const daysOfWeek = Array.from({ length: 7 }, (_, i) => ({
        day: moment().add(i, 'days').format('ddd'),
        date: moment().add(i, 'days').format('(DD/MM/YY)')
    }));

    useEffect(() => {
        const fetchData = async () => {
            const automotiveCollection = collection(db, 'Barber'); // Adjust collection name as needed
            const carDoc = doc(automotiveCollection, doc1);

            try {
                const businessDoc = await getDoc(carDoc);
                if (businessDoc.exists()) {
                    const { slotDuration: sd, startHour: sh, endHour: eh } = businessDoc.data();
                    setSlotDuration(sd || 60);
                    setBusinessHours({
                        startHour: convertTimeTo24HourFormat(sh || '9 AM'),
                        endHour: convertTimeTo24HourFormat(eh || '5 PM')
                    });
                }

                const bookedCollection = collection(carDoc, 'booking');
                const querySnapshot = await getDocs(bookedCollection);

                const eventsData = querySnapshot.docs.map(doc => {
                    const data = doc.data();
                    if (data.selectedSlot) {
                        return {
                            start: data.selectedSlot.toDate(),
                            end: moment(data.selectedSlot.toDate()).add(slotDuration, 'minutes').toDate(),
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
    }, [doc1, documentId, slotDuration]);


    const convertTimeTo24HourFormat = (time) => {
        const [hour, amPm] = time.split(' ');
        let hourConverted = parseInt(hour, 10);
        if (amPm === 'PM' && hourConverted !== 12) hourConverted += 12;
        if (amPm === 'AM' && hourConverted === 12) hourConverted = 0;
        return hourConverted;
    };

    const generateTimeSlots = () => {
        const slots = [];
        const start = businessHours.startHour;
        const end = businessHours.endHour;
        const duration = slotDuration; // Duration in minutes

        let currentTime = moment({hour: start, minute: 0, second: 0}); // Start of business hours
        const endTime = moment({hour: end, minute: 0, second: 0}); // End of business hours

        while (currentTime.isBefore(endTime)) {
            slots.push(currentTime.format('HH:mm'));
            currentTime = currentTime.clone().add(duration, 'minutes'); // Move to next slot
        }

        return slots;
    };


    const handleSlotSelect = async (dayIndex, time) => {
        const [hour, minute] = time.split(':').map(Number);
        const slotTime = moment().add(dayIndex, 'days').hour(hour).minute(minute).second(0);

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
            const automotiveCollection = collection(db, 'Barber'); // Adjust collection name as needed
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

    const hours = generateTimeSlots(); // Use the dynamically generated slots

    return (
        <div className="calendar-slot-selector">
            <div className="custom-calendar">
                <div className="days-header">
                    {daysOfWeek.map((dayObj, index) => (
                        <div key={index} className="day-header">{dayObj.day} {dayObj.date}</div>
                    ))}
                </div>
                <div className="slots">
                    {daysOfWeek.map((dayObj, dayIndex) => (
                        <div key={dayIndex} className="day-column">
                            {hours.map((time, timeIndex) => {
                                const slotTime = moment().add(dayIndex, 'days').startOf('day').add(moment.duration(time)).toDate();
                                const isBooked = events.some(event => moment(event.start).isSame(slotTime, 'minute'));

                                return (
                                    <div
                                        key={`${dayIndex}-${timeIndex}`}
                                        className={`time-slot ${selectedSlot && moment(selectedSlot).isSame(slotTime, 'minute') ? 'selected' : ''} ${isBooked ? 'booked' : ''}`}
                                        onClick={() => !isBooked && handleSlotSelect(dayIndex, time)}
                                    >
                                        {time}
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
                        <p>This slot is already booked. Please select another.</p>
                    ) : (
                        <button onClick={handleConfirmBooking}>Confirm Booking</button>
                    )}
                </div>
            )}
        </div>
    );

}

export default CalendarSlotSelector;
