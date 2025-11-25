import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Route */}
        <Route path="/" element={<Login />} />

        {/* Protected Routes (Only logged in users can see these) */}
        <Route element={<ProtectedRoute />}>
             <Route path="/dashboard" element={<Dashboard />} />
             {/* We will add Booking, Calendar, Unit pages here later */}
        </Route>

      </Routes>
    </Router>
  );
}

export default App;