import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import SignUp from "../Common/signup";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";


jest.mock('firebase/auth', () => ({
    getAuth: jest.fn(() => ({})),
    createUserWithEmailAndPassword: jest.fn(),
    sendEmailVerification: jest.fn(),
}));


jest.mock('firebase/firestore', () => ({
    getFirestore: jest.fn(),
    setDoc: jest.fn(),
    doc: jest.fn(),
}));

jest.mock('firebase/app', () => ({
    initializeApp: jest.fn().mockReturnValue({}),
}));

jest.mock('react-router-dom', () => ({
    useNavigate: jest.fn(),
}));

describe('Email Verification', () => {
    beforeEach(() => {
        // clear all mocks before each test
        jest.clearAllMocks();

        // setup mock resolved values
        const mockCreateUserWithEmailAndPassword = createUserWithEmailAndPassword;
        const mockSendEmailVerification = sendEmailVerification;
        const mockSetDoc = require('firebase/firestore').setDoc;

        mockCreateUserWithEmailAndPassword.mockResolvedValue({ user: { uid: 'testUid' } });
        mockSendEmailVerification.mockResolvedValue();
        mockSetDoc.mockResolvedValue();

        // mocking useNavigate
        const mockUseNavigate = require('react-router-dom').useNavigate;
        mockUseNavigate.mockReturnValue(jest.fn());
    });

    it('calls sendEmailVerification on successful sign up', async () => {
        // mocking alert before triggering the action
        window.alert = jest.fn();

        render(<SignUp />);

        fireEvent.change(screen.getByPlaceholderText("Email..."), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByPlaceholderText("Password..."), { target: { value: 'password123' } });
        fireEvent.change(screen.getByTestId('user-type-select'), { target: { value: 'Customers' } });
        fireEvent.click(screen.getByTestId('sign-up-button'));

        // waitFor async operations and window.alert to be called
        await waitFor(() => {
            expect(window.alert).toHaveBeenCalledWith("Sign Up successful! Please verify your email.");
        });

        expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(expect.anything(), 'test@example.com', 'password123');
        expect(sendEmailVerification).toHaveBeenCalled();
    });
});
