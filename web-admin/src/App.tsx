import {BrowserRouter as Router, Routes, Route} from 'react-router-dom'
import Login from "./Login.tsx";
import Dashboard from "./Dashboard.tsx";

function App() {
  return (
    <Router basename="/blue-book-admin">
      <Routes>
        <Route path="" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  )
}

export default App
