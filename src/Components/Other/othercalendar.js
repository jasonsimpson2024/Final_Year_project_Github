import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import moment from 'moment';
import { db } from '../../firebase.js';
import { collection, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';

function CalendarSlotSelector() {
    const [events, setEvents] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [isSlotAlreadyBooked, setIsSlotAlreadyBooked] = useState(false);
    const [slotDuration, setSlotDuration] = useState(60);
    const [businessHours, setBusinessHours] = useState({ startHour: 9, endHour: 17 });
    const [excludedDays, setExcludedDays] = useState([]);
    const [currentWeekStart, setCurrentWeekStart] = useState(moment().startOf('week'));
    const navigate = useNavigate();
    const { doc1, documentId } = useParams();

    useEffect(() => {
        const fetchData = async () => {
            const automotiveCollection = collection(db, 'Other');
            const carDoc = doc(automotiveCollection, doc1);

            try {
                const businessDoc = await getDoc(carDoc);
                if (businessDoc.exists()) {
                    const { slotDuration: sd, startHour: sh, endHour: eh, excludedDays: ed } = businessDoc.data();
                    setSlotDuration(sd || 60);
                    setBusinessHours({
                        startHour: convertTimeTo24HourFormat(sh || '9 AM'),
                        endHour: convertTimeTo24HourFormat(eh || '5 PM')
                    });
                    setExcludedDays(ed || []);
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

    const isCurrentDay = () => {
        return currentWeekStart.isSame(moment(), 'day');
    };

    const isCurrentWeek = () => {
        return currentWeekStart.isSame(moment(), 'week');
    };

    const nextWeek = () => {
        setCurrentWeekStart(prev => prev.clone().add(1, 'week'));
    };

    const previousWeek = () => {
        if (!currentWeekStart.isSame(moment().startOf('week'))) {
            setCurrentWeekStart(prev => prev.clone().subtract(1, 'week'));
        }
    };

    const convertTimeTo24HourFormat = (time) => {
        const [hour, part] = time.split(' ');
        let hours = parseInt(hour, 10);
        if (part === 'PM' && hours < 12) hours += 12;
        if (part === 'AM' && hours === 12) hours = 0;
        return hours;
    };

    const generateTimeSlots = () => {
        const slots = [];
        const startHour = businessHours.startHour;
        const endHour = businessHours.endHour;
        let currentTime = moment().startOf('day').hour(startHour);

        while (currentTime.hour() < endHour) {
            slots.push(currentTime.format('HH:mm'));
            currentTime.add(slotDuration, 'minutes');
        }

        return slots;
    };

    const daysOfWeek = () => {
        let start = currentWeekStart.clone().startOf('week');
        if (currentWeekStart.isSame(moment(), 'week')) {
            start = moment(); // Start from the current day if it's the current week
        }
        return Array.from({ length: 7 }, (_, i) => start.clone().add(i, 'days'))
            .filter(day => !excludedDays.includes(day.format('dddd')))
            .map(day => ({
                day,
                label: day.format('ddd (DD/MM/YY)'),
                isPast: day.endOf('day').isBefore(moment()) // Check if the day is in the past
            }));
    };


    const handleSlotSelect = async (dayIndex, time) => {
        const dayInfo = daysOfWeek()[dayIndex];
        const day = dayInfo.day;
        if (dayInfo.isPast) { // Do not allow selecting days in the past
            console.log("Cannot select a day in the past.");
            return;
        }

        const [hour, minute] = time.split(':').map(Number);
        const slotTime = day.clone().hour(hour).minute(minute);

        if (slotTime.isBefore(moment())) {
            console.log("Cannot select a slot in the past.");
            return; // Early return to prevent selecting past slots
        }

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
            // Document references
            const bookingDocRef = doc(db, 'Other', doc1, 'booking', documentId);
            const companyDocRef = doc(db, 'Other', doc1);

            try {
                // Update the booking document with the selected slot
                await updateDoc(bookingDocRef, {
                    selectedSlot: selectedSlot,
                });

                // Fetch the booking document to get the customer's email
                const bookingDoc = await getDoc(bookingDocRef);
                const bookingData = bookingDoc.data();

                // Fetch the company document to get the company name
                const companyDoc = await getDoc(companyDocRef);
                const companyName = companyDoc.exists() ? companyDoc.data().Name : "Unknown Company";

                // Define the email data
                const emailData = {
                    to: bookingData.email, // Use the email from the booking document
                    from: 'bookinglite@outlook.com', // your verified sender email address
                    subject: 'Booking Confirmation',
                    text: `Dear Customer,\n\nYour booking has been confirmed with ${companyName} for ${moment(selectedSlot).format('LLL')}.\n\nThank you for using BookingLite.\n\nIf you have a customer account, you can cancel online. Otherwise, please contact ${companyName} to cancel this booking.`
                };

                const functionUrl = 'https://us-central1-fyp---car-dealership.cloudfunctions.net/sendEmail';


                const response = await fetch(functionUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(emailData),
                });

                if (!response.ok) {
                    throw new Error('Failed to send email');
                }

                console.log('Email sent successfully');
                navigate('/confirmation', {
                    state: {
                        selectedSlot: moment(selectedSlot).format('LLL'),
                    },
                });
            } catch (error) {
                console.error('Error updating booking document or sending email:', error);
            }
        }
    };




    // Corrected usage in the return statement:
    return (
        <div className="calendar-slot-selector">
            <div className="custom-calendar">
                <div className="navigation">
                    <button onClick={previousWeek}>Previous Week</button>
                    <button onClick={nextWeek}>Next Week</button>
                </div>
                <div className="days-header">
                    {daysOfWeek().map(({ label }, index) => (
                        <div key={index} className="day-header">{label}</div>
                    ))}
                </div>
                <div className="slots">
                    {daysOfWeek().map(({ day }, dayIndex) => (
                        <div key={day.format('YYYY-MM-DD')} className="day-column">
                            {generateTimeSlots().map((time, timeIndex) => {
                                const slotDateTime = day.clone().startOf('day').add(moment.duration(time));
                                const isBooked = events.some(event => moment(event.start).isSame(slotDateTime, 'minute')) || slotDateTime.isBefore(moment());

                                return (
                                    <div
                                        key={`${dayIndex}-${timeIndex}`}
                                        className={`time-slot ${isBooked ? 'booked' : ''} ${selectedSlot && moment(selectedSlot).isSame(slotDateTime, 'minute') ? 'selected' : ''}`}
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
                        <p>This slot is already booked or in the past. Please select another.</p>
                    ) : (
                        <button onClick={handleConfirmBooking}>Confirm Booking</button>
                    )}
                </div>
            )}
        </div>
    );
}

export default CalendarSlotSelector;
