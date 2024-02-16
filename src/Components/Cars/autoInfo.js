import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { db, auth} from '../../firebase.js';
import { doc, getDoc } from 'firebase/firestore';

function AutoDetails() {
    const user=auth.currentUser;
    const uid = user ? user.uid : null;
    const [car, setCar] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const location = useLocation();
    const carId = location.pathname.split('/').pop();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchBarberData = async () => {
            try {
                const docRef = doc(db, 'Automotive', carId);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const hairData = {
                        id: docSnap.id, // Explicitly include the document ID
                        ...docSnap.data()
                    };
                    setCar(hairData);
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
    }, [carId]);


    const handleAppointmentBooking = () => {
        if(carId==uid){
            alert("You may not book an appointment with your own business.");
        }
        else{
            navigate(`/bookingcars/${car.id}`);
        }
    };

    if (isLoading) {
        return <p>Loading...</p>;
    }

    if (!car) {
        return <p>No barber found.</p>;
    }

    return (
        <div>
            <div className='page-header'>
                <div className='normal-container'>
                    <h2>{car.Name}</h2>
                    <p>
                        Location:
                        {car.Street && ` ${car.Street}`}
                        {car.Town && `, ${car.Town}`}
                        {car.County && `, ${car.County}`}
                        {car.Eircode && ` - Eircode: ${car.Eircode}`}
                        {car.Description && <p>{car.Description}</p>}
                    </p>

                    <button onClick={handleAppointmentBooking}>Book an Appointment</button>
                </div>
            </div>
        </div>

    );
}

export default AutoDetails;
