import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { VotosProvider } from './context/VotosContext'
import { AuthProvider } from './context/AuthContext'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AuthProvider>
      <VotosProvider>
        <App />
      </VotosProvider>
    </AuthProvider>
  </BrowserRouter>
)
