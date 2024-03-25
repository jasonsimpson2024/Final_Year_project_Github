import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Login from "../Common/login";
import { BrowserRouter as Router } from 'react-router-dom';
import { signInWithEmailAndPassword, auth } from 'firebase/auth';
import { waitFor } from "@testing-library/react";

// mocking Firebase Auth and Firestore
jest.mock('firebase/auth', () => {
    const originalModule = jest.requireActual('firebase/auth');

    return {
        __esModule: true,
        ...originalModule,
        auth: jest.fn(() => ({  })),
        signInWithEmailAndPassword: jest.fn(),
    };
});
jest.mock('firebase/firestore');

describe('Login Component', () => {
    test('does not allow unregistered user to login', async () => {
        //mock implementation
        signInWithEmailAndPassword.mockImplementation((auth, email, password) => {
            if (email === 'unregistered@example.com') {
                throw { code: "auth/email-already-in-use" };
            }
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

        // waitFor the alert to be called
        await waitFor(() => {
            expect(window.alert).toHaveBeenCalledWith("Invalid Username/Password");
        });

        expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
            expect.anything(),
            'unregistered@example.com',
            'password123'
        );
    });
});
