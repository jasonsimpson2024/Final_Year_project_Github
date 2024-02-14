import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { db, auth } from '../../firebase.js';
import { doc, getDoc } from 'firebase/firestore';

function BarberDetails() {
    const user = auth.currentUser;
    const uid = user ? user.uid : null;
    const [barber, setBarber] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const location = useLocation();
    const barberId = location.pathname.split('/').pop();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchBarberData = async () => {
            try {
                const docRef = doc(db, 'Barber', barberId);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setBarber(docSnap.data());
                } else {
                    console.log("No such document!");
                }
            } catch (error) {
                console.error('Error fetching barber:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchBarberData();
    }, [barberId]);

    const handleAppointmentBooking = () => {
        // Check if uid is not null and equal to barberId
        if(uid !== null && barberId == uid){
            alert("You may not book an appointment with your own business.");
        } else {
            navigate(`/barber/${barber.id}`);
        }
    };

    if (isLoading) {
        return <p>Loading...</p>;
    }

    if (!barber) {
        return <p>No barber found.</p>;
    }

    return (
        <div>
            <div className='page-header'>
                <div className='normal-container'>
                    <h2>{barber.Name}</h2>
                    <p>
                        Location:
                        {barber.Street && ` ${barber.Street}`}
                        {barber.Town && `, ${barber.Town}`}
                        {barber.County && `, ${barber.County}`}
                        {barber.Eircode && ` - Eircode: ${barber.Eircode}`}
                    </p>
                    {barber.Description && <p>Description: {barber.Description}</p>}
                    <button onClick={handleAppointmentBooking}>Book an Appointment</button>
                </div>
            </div>
        </div>

    );
}

export default BarberDetails;
