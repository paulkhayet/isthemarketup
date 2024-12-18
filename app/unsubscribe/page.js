"use client";

import { useState } from 'react';

export default function UnsubscribePage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleUnsubscribe = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!email) {
      setMessage('Please enter your email.');
      return;
    }

    try {
      const res = await fetch('/api/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage('You have been unsubscribed.');
        setEmail('');
      } else {
        setMessage(data.error || 'Unable to unsubscribe.');
      }
    } catch (error) {
      console.error('Unsubscribe error:', error);
      setMessage('An error occurred. Please try again later.');
    }
  };

  return (
    <div style={containerStyle}>
      <h1>Unsubscribe</h1>
      <p>If you would like to stop receiving our emails, please enter your email below:</p>
      <form onSubmit={handleUnsubscribe} style={formStyle}>
        <input
          type="email"
          placeholder="Your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
        />
        <button type="submit" style={buttonStyle}>Unsubscribe</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

const containerStyle = {
  fontFamily: 'Arial, sans-serif',
  maxWidth: '400px',
  margin: '50px auto',
  textAlign: 'center',
};

const formStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
  marginTop: '20px',
};

const inputStyle = {
  padding: '10px',
  borderRadius: '5px',
  border: '1px solid #ccc',
};

const buttonStyle = {
  padding: '10px 20px',
  borderRadius: '5px',
  background: '#333',
  color: '#fff',
  border: 'none',
  cursor: 'pointer',
};
