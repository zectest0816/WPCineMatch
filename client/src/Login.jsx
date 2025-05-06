import React, { useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios';
import './login.css';
import bgImage from './assets/netflix-background-gs7hjuwvv2g0e9fj.jpg';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        axios.post('http://localhost:3001/login', { email, password })
            .then(result => {
                console.log(result);
                if (result.data === "Success") {
                    navigate('/home');
                } else {
                    setErrorMessage('Invalid email or password.');
                }
            })
            .catch(err => {
                console.log(err);
                setErrorMessage('Login failed. Please try again.');
            });
    }

    return (
        <div
            className="d-flex justify-content-center align-items-center vh-100"
            style={{
                backgroundImage: `url(${bgImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}
        >
            <div className="login-box login-box-shift">
                <h2>Login</h2>

                {errorMessage && (
                    <div className="alert alert-danger py-1">
                        {errorMessage}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label htmlFor="email">
                            <strong>Email</strong>
                        </label>
                        <input
                            type="email"
                            placeholder="Enter Email"
                            autoComplete="off"
                            name="email"
                            className="form-control rounded-0"
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="password">
                            <strong>Password</strong>
                        </label>
                        <input
                            type="password"
                            placeholder="Enter Password"
                            name="password"
                            className="form-control rounded-0"
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="btn btn-success w-100 rounded-0">
                        Login
                    </button>
                </form>
                <p>Already Have an Account</p>
                <Link to="/register" className="btn btn-default border w-100 bg-light rounded-0 text-decoration-none">
                    Sign Up
                </Link>
            </div>

            <div className="title-container">
                <h1> <span className="cine">Cine</span>
                <span className="match">Match</span></h1>
                <p className="slogan">Your ultimate movie matchmaker</p> 
            </div>
        </div>
    );
};

export default Login;

