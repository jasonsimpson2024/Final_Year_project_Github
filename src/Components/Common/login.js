import React, { useState, useEffect } from 'react';
import { auth, getUserEmail } from '../../firebase.js';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

export default function Login() {
    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");
    const [isEmailVerified, setIsEmailVerified] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                setIsEmailVerified(user.emailVerified);
            }
        });

        return () => unsubscribe();
    }, []);

    const login = async () => {
        try {
            const userCredential = await signInWithEmailAndPassword(
                auth,
                loginEmail,
                loginPassword
            );

            const user = userCredential.user;

            // Check if the email is verified before allowing login
            if (user.emailVerified) {
                alert("Log In successful!");
                console.log(getUserEmail());
                navigate("/");
            } else {
                // If email is not verified, sign the user out
                await auth.signOut();
                alert("Please verify your email before logging in.");
            }
        } catch (error) {
            alert("Invalid Username/Password");
            window.location.reload();
        }
    }

    return (
        <div className="login-container">
            <h1>Login</h1>
            {!isEmailVerified && (
                <div className="verification-message">
                    <p>Please verify your email before logging in.</p>
                </div>
            )}
            <div className="form-group">
                <label>Email:</label>
                <input
                    type="email"
                    placeholder="Email..."
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="logSign"
                />
            </div>
            <div className="form-group">
                <label>Password:</label>
                <input
                    type="password"
                    placeholder="Password..."
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="logSign"
                />
            </div>
            <button className='login-button' type="button" onClick={login} disabled={!isEmailVerified}>
                Login
            </button>
        </div>
    );
}
