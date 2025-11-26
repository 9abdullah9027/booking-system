import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    // Ensure this matches your actual local API path
    const API_URL = "http://localhost/booking-system/backend/login.php";

    try {
      const response = await axios.post(API_URL, {
        email: email,
        password: password
      });

   if (response.data.jwt) {
        localStorage.setItem('token', response.data.jwt);
        localStorage.setItem('user_role', response.data.user.role);
        // Instant Redirect - No Alert needed anymore for production feel
        navigate('/dashboard'); 
        
        // Alert and Redirect
        alert("Login Successful! Welcome " + response.data.user.full_name);
        // We will create Dashboard later, for now verify it works
        // navigate('/dashboard'); 
        console.log("Logged in:", response.data);
      }
    } catch (err) {
      if(err.response) {
          setError(err.response.data.message);
      } else {
          setError("Connection Error. Is XAMPP running?");
      }
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2>System Login</h2>
        <form onSubmit={handleLogin}>
          <div style={styles.inputGroup}>
            <label>Email</label>
            <input 
              type="email" 
              required
              style={styles.input} 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div style={styles.inputGroup}>
            <label>Password</label>
            <input 
              type="password" 
              required
              style={styles.input} 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && <p style={styles.error}>{error}</p>}
          <button type="submit" style={styles.button}>Login</button>
        </form>
      </div>
    </div>
  );
}

// Basic Internal CSS for Quick UI
const styles = {
  container: { height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' },
  card: { background: 'white', padding: '2rem', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', width: '350px' },
  inputGroup: { marginBottom: '15px' },
  input: { width: '100%', padding: '10px', marginTop: '5px', border: '1px solid #ccc', borderRadius: '5px' },
  button: { width: '100%', padding: '10px', background: '#007BFF', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' },
  error: { color: 'red', fontSize: '14px', marginBottom: '10px' }
};

export default Login;