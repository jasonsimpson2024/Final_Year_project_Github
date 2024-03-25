import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Navbar from "../Common/Navbar";
import { BrowserRouter as Router } from 'react-router-dom';
import * as firebaseAuth from 'firebase/auth';
import * as firebaseFirestore from 'firebase/firestore';

// mocking the firebase services
jest.mock('firebase/auth', () => ({
    getAuth: jest.fn(),
    onAuthStateChanged: jest.fn(() => jest.fn()),
}));

jest.mock('firebase/firestore');

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useLocation: () => ({
        pathname: '/'
    })
}));

describe('Navbar Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();

        // defining the mock implementation
        firebaseAuth.getAuth.mockReturnValue({});
        firebaseAuth.onAuthStateChanged.mockImplementation(() => jest.fn());
        firebaseFirestore.getFirestore.mockReturnValue({});
    });

    it('renders without crashing', () => {
        render(
            <Router>
                <Navbar />
            </Router>
        );

        expect(screen.getByText('Sign In')).toBeInTheDocument();
    });
});
