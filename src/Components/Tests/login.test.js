import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Login from "../Common/login";
import { BrowserRouter as Router } from 'react-router-dom';
import { signInWithEmailAndPassword, auth } from 'firebase/auth';
import { waitFor } from "@testing-library/react";

// Mock Firebase Auth and Firestore
jest.mock('firebase/auth', () => {
    const originalModule = jest.requireActual('firebase/auth');

    return {
        __esModule: true,
        ...originalModule,
        auth: jest.fn(() => ({ /* mock properties and methods relevant to your auth object */ })),
        signInWithEmailAndPassword: jest.fn(),
    };
});
jest.mock('firebase/firestore');

describe('Login Component', () => {
    test('does not allow unregistered user to login', async () => {
        // Provide the mock implementation
        signInWithEmailAndPassword.mockImplementation((auth, email, password) => {
            if (email === 'unregistered@example.com') {
                throw { code: "auth/email-already-in-use" };
            }
            // Return a mock userCredential if needed for other scenarios
        });


        window.alert = jest.fn();

        render(
            <Router>
                <Login />
            </Router>
        );
        const emailInput = screen.getByPlaceholderText('Email...');
        const passwordInput =
            screen.getByPlaceholderText('Password...');
        const loginButton = screen.getByTestId('login-button');

        fireEvent.change(emailInput, { target: { value: 'unregistered@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        fireEvent.click(loginButton);

        // Use waitFor to wait for the alert to be called
        await waitFor(() => {
            expect(window.alert).toHaveBeenCalledWith("Invalid Username/Password");
        });

        // Update the expect statement to match the arguments used in the test
        expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
            expect.anything(), // auth object
            'unregistered@example.com',
            'password123'
        );
    });
});
