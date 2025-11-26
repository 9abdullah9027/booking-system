import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import Properties from './pages/Properties';
import Units from './pages/Units';
import Bookings from './pages/Bookings';  
import CalendarView from './pages/CalendarView';
import Users from './pages/Users';  
 import Housekeeping from './pages/Housekeeping';
 import Guests from './pages/Guests';
 import ServicesSettings from './pages/ServicesSettings';
 import Logs from './pages/Logs';


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
            <Route path="/users" element={<Users />} />
             <Route path="/housekeeping" element={<Housekeeping />} />s
             <Route path="/guests" element={<Guests />} />
             <Route path="/settings" element={<ServicesSettings />} />
             <Route path="/logs" element={<Logs />} />
        </Route>

      </Routes>
    </Router>
  );
}

export default App;