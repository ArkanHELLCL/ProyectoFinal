import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Distritos from './pages/Distritos'
import HemicicloPage from './pages/HemicicloPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/distritos" element={<Distritos />} />
      <Route path="/hemiciclo" element={<HemicicloPage />} />
    </Routes>
  )
}

export default App
