import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import CalendarSlotSelector from "../Barbers/barberCalendar";
import { useParams, useNavigate } from 'react-router-dom';
import fetchMock from 'jest-fetch-mock';
import { collection, getDocs, getDoc, updateDoc } from 'firebase/firestore';

jest.mock('../../firebase', () => ({
    db: {},
}));
jest.mock('firebase/firestore');

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: jest.fn(),
    useNavigate: jest.fn(),
}));
fetchMock.enableMocks();

beforeEach(() => {
    fetchMock.doMock();
    fetchMock.mockReset();
    useParams.mockReturnValue({ doc1: 'someDocId', documentId: 'someDocumentId' });
    useNavigate.mockReturnValue(jest.fn());

    collection.mockImplementation(() => ({}));
    getDocs.mockResolvedValue({
        docs: [
            { data: () => ({ selectedSlot: { toDate: () => new Date(2023, 3, 14, 10) }}) }
        ]
    });
    getDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({ slotDuration: 60, startHour: '9 AM', endHour: '5 PM', excludedDays: [] })
    });
    updateDoc.mockResolvedValue({});
});

describe('Sends Booking Confirmation Email', () => {
    test('sends confirmation email successfully', async () => {
        fetchMock.mockResponseOnce(JSON.stringify({ success: true }));

        render(
            <Router>
                <CalendarSlotSelector />
            </Router>
        );

        // using findAllByText to get all instances of "09:00" and then filter for non-booked slots if necessary
        const slotButtons = await screen.findAllByText('09:00');
        const availableSlotButton = slotButtons.find(button => !button.classList.contains('booked'));
        if (availableSlotButton) {
            fireEvent.click(availableSlotButton);
        } else {
            throw new Error('No available slots found.');
        }

        // find and click the "Confirm Booking" button
        const confirmButton = await screen.findByText('Confirm Booking');
        fireEvent.click(confirmButton);

        await waitFor(() => {
            expect(fetchMock).toHaveBeenCalledWith(
                'https://us-central1-fyp---car-dealership.cloudfunctions.net/sendEmail',
                expect.objectContaining({
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: expect.any(String),
                })
            );
        });


        expect(useNavigate).toHaveBeenCalled();
    });
});
