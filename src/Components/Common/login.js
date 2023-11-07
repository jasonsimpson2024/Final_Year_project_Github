import React, { useState } from 'react';
import {getUserEmail } from '../../firebase.js';
import { useNavigate } from 'react-router-dom';

export default function Login() {
    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");
    const navigate = useNavigate();

    const login = async () => {
        try {
            alert("Log In successful!");
            console.log(getUserEmail()); // Assuming getUserEmail is a function
            navigate("/");
        } catch (error) {
            alert("Invalid Username/Password");
            window.location.reload();
        }
    }

    return (
        <div className="login-container">
            <h1>Login</h1>
            <div className="form-group">
                <label>Email:</label>
                <input
                    type="email" // Changed to "email" type for email input
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
            <button type="button" onClick={login}>Login</button>
        </div>
    );
}
