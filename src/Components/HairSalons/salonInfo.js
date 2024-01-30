import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { db } from '../../firebase.js';
import { doc, getDoc } from 'firebase/firestore';

function SalonDetails() {
    const [hair, setHair] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const location = useLocation();
    const hairId = location.pathname.split('/').pop();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchBarberData = async () => {
            try {
                const docRef = doc(db, 'HairSalon', hairId);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const hairData = {
                        id: docSnap.id, // Explicitly include the document ID
                        ...docSnap.data()
                    };
                    setHair(hairData);
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
    }, [hairId]);


    const handleAppointmentBooking = () => {
        navigate(`/bookhairsalon/${hair.id}`);
    };

    if (isLoading) {
        return <p>Loading...</p>;
    }

    if (!hair) {
        return <p>No barber found.</p>;
    }

    return (
        <div>
            <div className='page-header'>
                <div className='normal-container'>
                    <h2>{hair.Name}</h2>
                    <p>
                        Location:
                        {hair.Street && ` ${hair.Street}`}
                        {hair.Town && `, ${hair.Town}`}
                        {hair.County && `, ${hair.County}`}
                        {hair.Eircode && ` - Eircode: ${hair.Eircode}`}
                    </p>
                    {hair.Description && <p>Description: {hair.Description}</p>}
                    <button onClick={handleAppointmentBooking}>Book an Appointment</button>
                </div>
            </div>
        </div>

    );
}

export default SalonDetails;
