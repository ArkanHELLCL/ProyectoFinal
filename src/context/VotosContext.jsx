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
  const [tipoVotos, setTipoVotos] = useState('reales') // 'encuesta', 'reales' o 'comparativa'
  const [tipoCalculo, setTipoCalculo] = useState('normal') // 'normal', 'derecha', 'izquierda'

  return (
    <VotosContext.Provider value={{ tipoVotos, setTipoVotos, tipoCalculo, setTipoCalculo }}>
      {children}
    </VotosContext.Provider>
  )
}
