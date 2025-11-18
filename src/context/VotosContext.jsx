import React, { createContext, useContext, useState } from 'react'

const VotosContext = createContext()

export const useVotos = () => {
  const context = useContext(VotosContext)
  if (!context) {
    throw new Error('useVotos debe ser usado dentro de un VotosProvider')
  }
  return context
}

export const VotosProvider = ({ children }) => {
  const [tipoVotos, setTipoVotos] = useState('encuesta') // 'encuesta' o 'reales'

  return (
    <VotosContext.Provider value={{ tipoVotos, setTipoVotos }}>
      {children}
    </VotosContext.Provider>
  )
}
