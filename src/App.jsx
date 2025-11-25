import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Distritos from './pages/Distritos'
import ComparativaDistritos from './pages/ComparativaDistritos'
import ComparativaPactosFicticiosDistritos from './pages/ComparativaPactosFicticiosDistritos'
import HemicicloPage from './pages/HemicicloPage'
import Comparativa from './pages/Comparativa'
import ComparativaPactosFicticiosHemiciclo from './pages/ComparativaPactosFicticiosHemiciclo'
import NotFound from './pages/NotFound'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/distritos" element={<Distritos />} />
      <Route path="/comparativa-distritos" element={<ComparativaDistritos />} />
      <Route path="/comparativa-pactos-ficticios-distritos" element={<ComparativaPactosFicticiosDistritos />} />
      <Route path="/hemiciclo" element={<HemicicloPage />} />
      <Route path="/comparativa" element={<Comparativa />} />
      <Route path="/comparativa-pactos-ficticios-hemiciclo" element={<ComparativaPactosFicticiosHemiciclo />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App
