import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Home from './pages/Home'
import Distritos from './pages/Distritos'
import ComparativaDistritos from './pages/ComparativaDistritos'
import ComparativaPactosFicticiosDistritos from './pages/ComparativaPactosFicticiosDistritos'
import HemicicloPage from './pages/HemicicloPage'
import ComparativaHemiciclo from './pages/ComparativaHemiciclo'
import ComparativaPactosFicticiosHemiciclo from './pages/ComparativaPactosFicticiosHemiciclo'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
      <Route path="/distritos" element={<ProtectedRoute><Distritos /></ProtectedRoute>} />
      <Route path="/comparativa-distritos" element={<ProtectedRoute><ComparativaDistritos /></ProtectedRoute>} />
      <Route path="/comparativa-pactos-ficticios-distritos" element={<ProtectedRoute><ComparativaPactosFicticiosDistritos /></ProtectedRoute>} />
      <Route path="/hemiciclo" element={<ProtectedRoute><HemicicloPage /></ProtectedRoute>} />
      <Route path="/comparativa-hemiciclo" element={<ProtectedRoute><ComparativaHemiciclo /></ProtectedRoute>} />
      <Route path="/comparativa-pactos-ficticios-hemiciclo" element={<ProtectedRoute><ComparativaPactosFicticiosHemiciclo /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App
