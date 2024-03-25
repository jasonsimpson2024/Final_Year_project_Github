import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SignUp from "../Common/signup";
import { BrowserRouter as Router } from 'react-router-dom';
import { createUserWithEmailAndPassword, auth, sendEmailVerification } from 'firebase/auth';
import { waitFor } from "@testing-library/react";


jest.mock('firebase/auth', () => {
    const originalModule = jest.requireActual('firebase/auth');

    const mockGetAuth = jest.fn(() => ({

    }));

    return {
        __esModule: true,
        ...originalModule,
        getAuth: mockGetAuth,
        auth: jest.fn(() => ({

        })),
        createUserWithEmailAndPassword: jest.fn(),
        sendEmailVerification: jest.fn(),
    };
});

jest.mock('firebase/firestore');

describe('SignUp Component', () => {
    beforeEach(() => {
        // reset mocks before each test
        createUserWithEmailAndPassword.mockClear();
        sendEmailVerification.mockClear();
        window.alert = jest.fn(); // ensuring alert is mocked if not done elsewhere
    });

    test('does not allow signup with already registered email', async () => {
        createUserWithEmailAndPassword.mockImplementation(() => {
            throw new Error("auth/email-already-in-use");
        });

        render(
            <Router>
                <SignUp />
            </Router>
        );
        const emailInput = screen.getByPlaceholderText('Email...');
        const passwordInput = screen.getByPlaceholderText('Password...');
        const userTypeSelect = screen.getByTestId('user-type-select');
        const signUpButton = screen.getByTestId('sign-up-button');

        fireEvent.change(emailInput, { target: { value: 'registered@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        fireEvent.change(userTypeSelect, { target: { value: 'Customers' } });
        fireEvent.click(signUpButton);

        //waitFor for async operations
        await waitFor(() => {
            expect(window.alert).toHaveBeenCalledWith("Error signing up. Please try again.");
        });

        expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
            expect.anything(),
            'registered@example.com',
            'password123'
        );
    });
});
