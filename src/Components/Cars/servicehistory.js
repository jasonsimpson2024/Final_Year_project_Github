import React, { useState, useEffect } from 'react';
import { db } from '../../firebase.js';
import { doc, getDoc, updateDoc} from 'firebase/firestore';
import { useParams } from 'react-router-dom';

function ServiceHistory() {
    const { documentId } = useParams();
    const [carData, setCarData] = useState(null);
    const [editable, setEditable] = useState(false);
    const [serviceHistory, setServiceHistory] = useState([]);
    const [newRecord, setNewRecord] = useState({ date: '', task: '', parts: '' });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const carDocument = doc(db, 'cars', documentId);
                const carSnapshot = await getDoc(carDocument);

                if (carSnapshot.exists()) {
                    const carData = carSnapshot.data();
                    setCarData(carData);
                    const serviceHistoryData = carData['service history'] || [];
                    setServiceHistory(serviceHistoryData);
                } else {
                    console.error('Car not found');
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                alert(error);
            }
        };

        fetchData();
    }, [documentId]);

    const handleEditNotes = () => {
        setEditable(true);
    };

    const handleCancelEdit = () => {
        setEditable(false);
    };

    const handleSaveNotes = async () => {
        try {
            const carDocument = doc(db, 'cars', documentId);
            await updateDoc(carDocument, {
                'service history': serviceHistory,
            });
            setEditable(false);
            alert('Changes Saved');
        } catch (error) {
            console.error('Error saving notes:', error);
        }
    };

    const handleAddNewRecord = () => {
        const updatedServiceHistory = [...serviceHistory, newRecord];
        setServiceHistory(updatedServiceHistory);
        setNewRecord({ date: '', task: '', parts: '' });
    };

    if (!carData) {
        return <div>Loading...</div>;
    }

    return (
        <div className="page-header">
            <div className="car-details">
                <h1>{carData.Make} {carData.Model} {carData.Year}</h1>
            </div>
            <div className="service-history">
                <h4>Service History</h4>
                {editable ? (
                    // Edit mode
                    <div className="table-container"> {/* Wrap the table in a div with the "table-container" class */}
                        <table>
                            <thead>
                            <tr>
                                <th>Date</th>
                                <th>Maintenance Task</th>
                                <th>Parts Replaced</th>
                            </tr>
                            </thead>
                            <tbody>
                            {serviceHistory.map((record, index) => (
                                <tr key={index}>
                                    <td>
                                        <input
                                            type="text"
                                            value={record.date}
                                            onChange={(e) => {
                                                const updatedRecord = { ...record, date: e.target.value };
                                                const updatedServiceHistory = [...serviceHistory];
                                                updatedServiceHistory[index] = updatedRecord;
                                                setServiceHistory(updatedServiceHistory);
                                            }}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            value={record.task}
                                            onChange={(e) => {
                                                const updatedRecord = { ...record, task: e.target.value };
                                                const updatedServiceHistory = [...serviceHistory];
                                                updatedServiceHistory[index] = updatedRecord;
                                                setServiceHistory(updatedServiceHistory);
                                            }}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            value={record.parts}
                                            onChange={(e) => {
                                                const updatedRecord = { ...record, parts: e.target.value };
                                                const updatedServiceHistory = [...serviceHistory];
                                                updatedServiceHistory[index] = updatedRecord;
                                                setServiceHistory(updatedServiceHistory);
                                            }}
                                        />
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    // View mode
                    <div className="table-container"> {/* Wrap the table in a div with the "table-container" class */}
                        <table>
                            <thead>
                            <tr>
                                <th>Date</th>
                                <th>Maintenance Task</th>
                                <th>Parts Replaced</th>
                            </tr>
                            </thead>
                            <tbody>
                            {serviceHistory.map((record, index) => (
                                <tr key={index}>
                                    <td>{record.date}</td>
                                    <td>{record.task}</td>
                                    <td>{record.parts}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            <div className="service-history-button">
                {editable ? (
                    // Edit mode buttons
                    <>
                        <button onClick={handleSaveNotes}>Save Changes</button>
                        <button onClick={handleCancelEdit}>Cancel</button>
                    </>
                ) : (
                    // View mode button
                    <button onClick={handleEditNotes}>Edit</button>
                )}
                {editable && (
                    <button onClick={handleAddNewRecord}>Add New Record</button>
                )}
            </div>
        </div>

    );
}

export default ServiceHistory;
