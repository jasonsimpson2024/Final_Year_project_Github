import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ListBusiness from "../Common/add"; // Verify the path is correct
import { BrowserRouter } from 'react-router-dom';

// Assuming these are correctly imported based on your actual paths and usage
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import * as firebaseUtils from '../../firebase'; // Assuming firebaseUtils is the actual import name

// Mock Firebase initialization and services
jest.mock('firebase/app', () => ({
    initializeApp: jest.fn().mockReturnValue({
        auth: jest.fn(),
        firestore: jest.fn(),
    }),
    getAuth: jest.fn().mockReturnValue({
        currentUser: null,
    }),
}));

jest.mock('firebase/auth');

// Assuming Firestore is also used and mocked accordingly
jest.mock('firebase/firestore', () => ({
    getFirestore: jest.fn(),
    collection: jest.fn(),
    addDoc: jest.fn(),
}));

// Mocking your specific Firebase utility functions, including setDoc
jest.mock('../../firebase', () => ({
    setDoc: jest.fn(() => Promise.resolve()),
}));

describe('ListBusiness Form Submission', () => {
    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();
    });

    it('submits form correctly', async () => {
        render(
            <BrowserRouter>
                <ListBusiness />
            </BrowserRouter>
        );

        const nameInput = screen.getByLabelText(/Name:/i);
        const countySelect = screen.getByLabelText(/County:/i);
        const businessModelSelect = screen.getByLabelText(/Business Model:/i);
        const descriptionTextarea = screen.getByLabelText(/Description/i);
        const submitButton = screen.getByRole('button', { name: /Submit/i });

        // Simulate user input
        await userEvent.type(nameInput, 'Test Name');
        await userEvent.selectOptions(countySelect, ['Co. Dublin']);
        await userEvent.selectOptions(businessModelSelect, ['Automotive']);
        await userEvent.type(descriptionTextarea, 'Test Description');

        // Submit the form by clicking the submit button
        await userEvent.click(submitButton);

        // Wait for asynchronous operations to complete before asserting
        await waitFor(() => expect(firebaseUtils.setDoc).toHaveBeenCalled());
    });
});
