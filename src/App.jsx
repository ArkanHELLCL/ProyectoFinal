import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Distritos from './pages/Distritos'
import HemicicloPage from './pages/HemicicloPage'
import Comparativa from './pages/Comparativa'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/distritos" element={<Distritos />} />
      <Route path="/hemiciclo" element={<HemicicloPage />} />
      <Route path="/comparativa" element={<Comparativa />} />
    </Routes>
  )
}

export default App
