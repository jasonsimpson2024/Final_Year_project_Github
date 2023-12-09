import React, { useState } from 'react';
import { auth } from '../../firebase.js'; // Import the 'auth' object
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth'; // Import the 'createUserWithEmailAndPassword' function
import { useNavigate } from 'react-router-dom';

export default function SignUp() {
    const [signupEmail, setSignupEmail] = useState("");
    const [signupPassword, setSignupPassword] = useState("");
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
            <button type="button" onClick={signup}>Sign Up</button>
        </div>
    );
}
