import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import Properties from './pages/Properties';
import Units from './pages/Units';
import Bookings from './pages/Bookings';  
import CalendarView from './pages/CalendarView';


function App() {
  return (
    <Router>
      <Routes>
        {/* Public Route */}
        <Route path="/" element={<Login />} />

        {/* Protected Routes (Only logged in users can see these) */}
        <Route element={<ProtectedRoute />}>
             <Route path="/dashboard" element={<Dashboard />} />
             <Route path="/properties" element={<Properties />} />
             <Route path="/properties/units" element={<Units />} />
              <Route path="/bookings" element={<Bookings />} />
              <Route path="/calendar" element={<CalendarView />} />
            
        </Route>

      </Routes>
    </Router>
  );
}

export default App;