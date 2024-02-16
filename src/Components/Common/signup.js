import React, { useState } from 'react';
import { auth } from '../../firebase.js'; // Assuming this contains your Firebase config and initialization
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc } from 'firebase/firestore'; // Import functions to interact with Firestore
import { db } from '../../firebase.js'; // Import your Firestore database instance

export default function SignUp() {
    const [signupEmail, setSignupEmail] = useState("");
    const [signupPassword, setSignupPassword] = useState("");
    const [isCustomer, setIsCustomer] = useState(false); // State to manage the checkbox
    const navigate = useNavigate();

    const signup = async () => {
        try {
            // Create user account
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                signupEmail,
                signupPassword
            );

            const user = userCredential.user;
            await sendEmailVerification(user);

            // Check if the user is marked as a customer
            if (isCustomer) {
                // Save the email to the "Customers" collection with the user's UID as the document ID
                await setDoc(doc(db, "Customers", user.uid), {
                    email: signupEmail
                });
            }

            alert("Sign Up successful! Please verify your email.");
            await auth.signOut();
            navigate("/login"); // Redirect to the login page after sign-up
        } catch (error) {
            alert("Error signing up. Please try again.");
            console.log(error);
        }
    }

    return (
        <div className="login-container">
            <h1>Sign Up</h1>
            <div className="form-group">
                <label>Email:</label>
                <input
                    type="email"
                    placeholder="Email..."
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    className="logSign"
                />
            </div>
            <div className="form-group">
                <label>Password:</label>
                <input
                    type="password"
                    placeholder="Password..."
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    className="logSign"
                />
            </div>
            <div className="form-group">
                <label>
                    <input
                        type="checkbox"
                        checked={isCustomer}
                        onChange={(e) => setIsCustomer(e.target.checked)}
                    /> Customer
                </label>
            </div>
            <button type="button" onClick={signup}>Sign Up</button>
        </div>
    );
}
