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
            const automotiveCollection = collection(db, 'Barber');
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
        let start = isCurrentWeek() ? moment() : currentWeekStart.startOf('week');
        return Array.from({ length: 7 }, (_, i) => start.clone().add(i, 'days'))
            .filter(day => !excludedDays.includes(day.format('dddd')))
            .map(day => ({
                day,
                label: day.format('ddd (DD/MM/YY)')
            }));
    };

    const handleSlotSelect = async (dayIndex, time) => {
        const day = daysOfWeek()[dayIndex].day;
        const [hour, minute] = time.split(':').map(Number);
        const slotTime = day.clone().hour(hour).minute(minute);

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
            const bookedDoc = doc(db, 'Barber', doc1, 'booking', documentId);

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

    // Corrected usage in the return statement:
    return (
        <div className="calendar-slot-selector">
            <div className="custom-calendar">
                <div className="navigation">
                    <button onClick={previousWeek} disabled={isCurrentDay()}>Previous Week</button>
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
                                const slotTime = day.clone().startOf('day').add(moment.duration(time));
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
