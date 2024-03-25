import React, { useState } from 'react';
import { auth, db } from '../../firebase.js';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

export default function SignUp() {
    const [signupEmail, setSignupEmail] = useState("");
    const [signupPassword, setSignupPassword] = useState("");
    const [userType, setUserType] = useState("");
    const navigate = useNavigate();

    const signup = async () => {
        if (!userType) {
            alert("Please select an account type.");
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, signupEmail, signupPassword);
            const user = userCredential.user;
            await sendEmailVerification(user); // sends verification email

            // store the email in the selected collection based on userType
            await setDoc(doc(db, userType, user.uid), {
                email: signupEmail
            });

            alert("Sign Up successful! Please verify your email.");
            await auth.signOut();
            navigate("/login");
        } catch (error) {
            alert("Error signing up. Please try again.");
            console.log(error);
        }
    }

    return (
        <div className="login-container">
            <h1>Sign Up</h1>
            <div className="form-group">
                <label htmlFor="signupEmail">Email:</label>
                <input
                    id="signupEmail"
                    type="email"
                    placeholder="Email..."
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    className="logSign"
                />
            </div>
            <div className="form-group">
                <label htmlFor="signupPassword">Password:</label>
                <input
                    id="signupPassword"
                    type="password"
                    placeholder="Password..."
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    className="logSign"
                />
            </div>
            <div className="form-group">
                <select
                    id="userType"
                    value={userType}
                    onChange={(e) => setUserType(e.target.value)}
                    data-testid="user-type-select"
                    className="userTypeSelect"
                    required
                >
                    <option value="">Choose Account Type...</option>
                    <option value="Customers">Personal</option>
                    <option value="Business">Business</option>
                </select>
            </div>
            <button className='login-button' type="button" onClick={signup} data-testid="sign-up-button">Sign Up</button>
        </div>
    );
}
