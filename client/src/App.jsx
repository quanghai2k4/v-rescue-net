import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import SOSForm from './pages/SOSForm';
import CommandCenter from './pages/CommandCenter';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/sos" element={<SOSForm />} />
        <Route path="/command" element={<CommandCenter />} />
      </Routes>
    </Router>
  );
}

export default App;
