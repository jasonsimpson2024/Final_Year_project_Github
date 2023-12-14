import React, { useEffect, useState } from 'react';
import { db } from '../../firebase.js';
import { collection, getDocs, query, orderBy, limit, startAfter } from 'firebase/firestore';
import { Link } from 'react-router-dom';

function Meeting() {
    const [meetingData, setMeetingData] = useState([]);
    const [page, setPage] = useState(1);
    const meetingsPerPage = 5;
    const [lastDocumentName, setLastDocumentName] = useState(null);
    const [hasMoreMeetings, setHasMoreMeetings] = useState(true);

    useEffect(() => {
        const fetchData = async (pageNumber) => {
            try {
                const meetingsCollection = collection(db, 'Meeting');
                let q = query(meetingsCollection, orderBy('Name'), limit(meetingsPerPage));

                if (pageNumber > 1 && lastDocumentName) {
                    q = query(meetingsCollection, orderBy('Name'), startAfter(lastDocumentName), limit(meetingsPerPage));
                }

                const snapshot = await getDocs(q);

                const newMeetingData = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    Name: doc.data().Name,
                    Street: doc.data().Street,
                    Town: doc.data().Town,
                    County: doc.data().County,
                    Eircode: doc.data().Eircode,
                }));

                if (newMeetingData.length > 0) {
                    const lastMeeting = newMeetingData[newMeetingData.length - 1];
                    setLastDocumentName(lastMeeting.Name);
                    setHasMoreMeetings(newMeetingData.length === meetingsPerPage);
                } else {
                    setHasMoreMeetings(false);
                }

                setMeetingData(newMeetingData);
                console.log("data updated:", newMeetingData);
            } catch (error) {
                console.error('Error fetching data:', error);
                setHasMoreMeetings(false);
            }
        };

        fetchData(page);
    }, [page]);

    const nextPage = () => {
        if (hasMoreMeetings) {
            setPage(page + 1);
        }
    };

    const prevPage = () => {
        if (page > 1) {
            if (page === 2) {
                setLastDocumentName(null);
            }
            setPage(page - 1);
        }
    };

    return (
        <div>
            <div className='page-header'>
                <a href="/" className="my-button arrow-button">Browse Other Services</a>
                <div className="header-buttons">
                </div>
                <div className="car-details-list">
                    {meetingData.map((meet) => (
                        <div key={meet.id} className="car-details">
                            <Link to={`/meeting/${meet.id}`} className="car-detail">
                                Name: {meet.Name} <br />
                                Location: {meet.Street} {meet.Town} {meet.County} {meet.Eircode}
                            </Link>
                        </div>
                    ))}
                </div>
                <div className="pagination">
                    <button onClick={prevPage} disabled={page === 1}>Previous</button>
                    <button onClick={nextPage} disabled={!hasMoreMeetings}>Next</button>
                </div>
            </div>
        </div>
    );
}

export default Meeting;
