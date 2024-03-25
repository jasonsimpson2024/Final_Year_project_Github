import React from 'react';
import { render, waitFor } from '@testing-library/react';
import Barber from "../Barbers/barber";
import * as firestore from 'firebase/firestore';

// mocking firestore
jest.mock('firebase/firestore', () => ({
    getFirestore: jest.fn(() => ({})),
    collection: jest.fn(),
    getDocs: jest.fn(),
    query: jest.fn(),
    orderBy: jest.fn(),
    limit: jest.fn(),
    startAfter: jest.fn(),
}));


describe('Fetch data from Firestore', () => {
    it('fetches barber data on mount', async () => {
        //mock return value for getDocs
        const mockGetDocs = firestore.getDocs.mockResolvedValue({
            docs: [
                {
                    id: '1',
                    data: () => ({
                        Name: 'Barber Shop 1',
                        Street: '123 Main St',
                        Town: 'Anytown',
                        County: 'Antrim',
                        Eircode: '12345',
                    }),
                },
            ],
        });

        //rendering barber component
        render(<Barber />);

        // waitFor the component to call getDocs and update state
        await waitFor(() => expect(mockGetDocs).toHaveBeenCalled());

    });
});
