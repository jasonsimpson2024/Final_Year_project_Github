import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import HairSalon from "../HairSalons/hairsalon";
import { getDocs } from 'firebase/firestore';

jest.mock('../../firebase', () => ({
    db: {},
}));
jest.mock('firebase/firestore');

describe('Search Functionality', () => {
    beforeEach(() => {
        getDocs.mockImplementation(() => {
            return Promise.resolve({
                docs: [
                    { id: '1', data: () => ({ Name: 'Salon A', Street: '123 Main St', Town: 'Townsville', County: 'Dublin', Eircode: 'D01' }) },
                    { id: '2', data: () => ({ Name: 'Salon B', Street: '456 Side St', Town: 'Village', County: 'Cork', Eircode: 'C02' }) },
                ],
            });
        });
    });

    test('filters displayed data based on search input', async () => {
        render(
            <Router>
                <HairSalon />
            </Router>
        );

        // the text "Salon A" is within a link, therefore we can directly use findByText with a regex
        const linkToSalonA = await screen.findByText(/Salon A/);

        // ensures the link is in the document
        expect(linkToSalonA).toBeInTheDocument();

        // simulates typing into the search input
        fireEvent.change(screen.getByPlaceholderText('Browse services'), { target: { value: 'Dublin' } });

        expect(await screen.findByText(/Salon A/)).toBeInTheDocument();

        expect(screen.queryByText(/Salon B/)).not.toBeInTheDocument();
    });
});
