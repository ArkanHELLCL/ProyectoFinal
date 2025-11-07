import { useState, useEffect } from 'react'
import nombresDistritos from '../mock/nombresDistritos.json'

const PACTO_NOMBRES = {
  A: "Partido Ecologista Verde",
  B: "Verdes, Regionalistas y Humanistas (FRVS, AH)",
  C: "Unidad por Chile (FA, PS, DC, PPD, PL, PR)",
  D: "Izquierda Ecologista Popular Animalista y Humanista",
  E: "Movimiento Amarillos por Chile",
  F: "Partido de Trabajadores Revolucionarios",
  G: "Partido Alianza Verde Popular",
  H: "Popular",
  I: "Partido de la Gente",
  J: "Chile Grande y Unido (UDI, RN, Evópoli, Demócratas)",
  K: "Cambio por Chile (PSC, PNL)",
};

function App() {
  const [candidatos, setCandidatos] = useState([])
  const [distritos, setDistritos] = useState([])
  const [selectedDistrito, setSelectedDistrito] = useState('')
  const [mostrarSoloConVotos, setMostrarSoloConVotos] = useState(true)
  const [votosAcumulados, setVotosAcumulados] = useState([])
  const [partidosAcumulados, setPartidosAcumulados] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingVotos, setLoadingVotos] = useState(false)
  const [error, setError] = useState(null)

  // Función para normalizar el distrito ID
  const normalizarDistritoId = (zona) => {
    if (zona && zona.startsWith('60')) {
      let distritoId = zona.substring(2).trim()
      // Para distritos menores a 10, eliminar el 0 inicial si existe
      if (distritoId.startsWith('0') && distritoId.length === 2) {
        distritoId = distritoId.substring(1)
      }
      return distritoId
    }
    return zona
  }

  // Función para obtener el nombre completo del distrito
  const getDistritoNombre = (id) => {
    const distrito = nombresDistritos.find(d => d.id === id)
    return distrito ? distrito.name : `Distrito ${id}`
  }

  // Función para obtener el nombre completo del pacto
  const getPactoNombre = (codigo) => {
    return PACTO_NOMBRES[codigo] || codigo
  }

  // Función para obtener el color del pacto
  const getPactoColor = (codigo) => {
    const colores = {
      A: "bg-green-100 text-green-800",      // Ecologista Verde
      B: "bg-emerald-100 text-emerald-800",  // Verdes, Regionalistas
      C: "bg-red-100 text-red-800",          // Unidad por Chile (centro-izquierda)
      D: "bg-purple-100 text-purple-800",    // Izquierda Ecologista
      E: "bg-yellow-100 text-yellow-800",    // Amarillos por Chile
      F: "bg-red-200 text-red-900",          // Trabajadores Revolucionarios
      G: "bg-green-200 text-green-900",      // Alianza Verde Popular
      H: "bg-gray-100 text-gray-800",        // Popular
      I: "bg-orange-100 text-orange-800",    // Partido de la Gente
      J: "bg-blue-100 text-blue-800",        // Chile Grande y Unido (centro-derecha)
      K: "bg-indigo-100 text-indigo-800",    // Cambio por Chile
    };
    return colores[codigo] || "bg-gray-100 text-gray-800";
  }

  // Función para verificar si un candidato tiene votos
  const tieneVotos = (candidato) => {
    return (candidato.votos_reales && candidato.votos_reales > 0) || 
           (candidato.votos_encuesta && candidato.votos_encuesta > 0)
  }

  // Función para obtener candidatos filtrados
  const getCandidatosFiltrados = () => {
    let candidatosDis = candidatos.filter(c => normalizarDistritoId(c.zona) === selectedDistrito)
    
    if (mostrarSoloConVotos) {
      candidatosDis = candidatosDis.filter(tieneVotos)
    }
    
    return candidatosDis
  }

  // Función para obtener votos acumulados por lista del distrito seleccionado
  const getListasDistrito = () => {
    if (!selectedDistrito || !votosAcumulados.length) return []
    
    let filtrados = votosAcumulados
    
    if (mostrarSoloConVotos) {
      filtrados = votosAcumulados.filter(lista => {
        return (lista.votos_reales && lista.votos_reales > 0) || 
               (lista.votos_encuesta && lista.votos_encuesta > 0)
      })
    }
    
    return filtrados
  }

  /*
  // Función para obtener el pacto de una lista desde los partidos
  const getPactoDelista = (codigoLista) => {
    // Buscar en los partidos acumulados uno que coincida con el código de la lista
    const partido = partidosAcumulados.find(p => p.codigo === codigoLista)
    return partido ? partido.pacto : null
  } */

  // Función para obtener votos acumulados por partido del distrito seleccionado
  const getPartidosDistrito = () => {
    if (!selectedDistrito || !partidosAcumulados.length) return []
    
    let filtrados = partidosAcumulados
    
    if (mostrarSoloConVotos) {
      filtrados = partidosAcumulados.filter(partido => {
        return (partido.votos_reales && partido.votos_reales > 0) || 
               (partido.votos_encuesta && partido.votos_encuesta > 0)
      })
    }
    
    return filtrados
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Obtener candidatos
        const candidatosResponse = await fetch('http://127.0.0.1:5000/api/candidatos')
        if (!candidatosResponse.ok) {
          throw new Error('Error al obtener los candidatos')
        }
        const candidatosData = await candidatosResponse.json()
        setCandidatos(candidatosData)
        
        // Extraer distritos únicos usando la función normalizar
        const distritosUnicos = [...new Set(candidatosData.map(candidato => 
          normalizarDistritoId(candidato.zona)
        ))].filter(distrito => distrito && distrito !== '')
        
        // Mapear con nombres completos y ordenar
        const distritosConNombres = distritosUnicos.map(id => ({
          id,
          nombre: getDistritoNombre(id)
        })).sort((a, b) => parseInt(a.id) - parseInt(b.id))
        
        setDistritos(distritosConNombres)
        setLoading(false)
      } catch (err) {
        setError(err.message)
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleDistritoChange = (e) => {
    const distrito = e.target.value
    setSelectedDistrito(distrito)
    
    // Obtener votos acumulados cuando se selecciona un distrito
    if (distrito) {
      fetchVotosAcumulados(distrito)
    } else {
      setVotosAcumulados([])
      setPartidosAcumulados([])
    }
  }

  const fetchVotosAcumulados = async (distrito) => {
    try {
      setLoadingVotos(true)
      
      // Intentar con parámetro de distrito primero
      let url = `http://127.0.0.1:5000/api/votos_acumulados?distrito=${distrito}`
      let response = await fetch(url)
      
      // Si no funciona con parámetro, intentar sin él
      if (!response.ok) {
        url = 'http://127.0.0.1:5000/api/votos_acumulados'
        response = await fetch(url)
      }
      
      if (!response.ok) {
        throw new Error('Error al obtener los votos acumulados')
      }
      
      const votosData = await response.json()
      console.log('Datos de votos acumulados:', votosData)
      
      // Extraer listas y partidos
      const listas = Array.isArray(votosData) ? votosData : (votosData.listas || [])
      const partidos = votosData.partidos || []
      
      console.log('Listas extraídas:', listas.length)
      console.log('Partidos extraídos:', partidos.length)
      
      setVotosAcumulados(listas)
      setPartidosAcumulados(partidos)
      setLoadingVotos(false)
    } catch (err) {
      console.error('Error al obtener votos acumulados:', err)
      setVotosAcumulados([])
      setPartidosAcumulados([])
      setLoadingVotos(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando datos...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Sistema D'Hondt</h1>
          <p className="text-gray-600">Seleccione un distrito para continuar</p>
        </header>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="mb-6">
            <label htmlFor="distrito-select" className="block text-sm font-medium text-gray-700 mb-2">
              Seleccionar Distrito
            </label>
            <div className="relative">
              <select
                id="distrito-select"
                value={selectedDistrito}
                onChange={handleDistritoChange}
                className="block w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm 
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                         bg-white text-gray-900 appearance-none cursor-pointer
                         transition duration-200 ease-in-out
                         hover:border-gray-400"
              >
                <option value="">-- Seleccione un distrito --</option>
                {distritos.map((distrito, index) => (
                  <option key={index} value={distrito.id} className="py-2">
                    {distrito.nombre}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </div>
            </div>
          </div>

          {/* Checkbox para filtrar candidatos con votos */}
          <div className="mt-4">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={mostrarSoloConVotos}
                onChange={(e) => setMostrarSoloConVotos(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
              <span className="ml-2 text-sm font-medium text-gray-700">
                Mostrar solo candidatos con votos
              </span>
            </label>
          </div>

          {selectedDistrito && (
            <div className="mt-6">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 mb-6">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">
                  {getDistritoNombre(selectedDistrito)}
                </h3>
                <div className="text-sm text-gray-600">
                  Candidatos en este distrito: {getCandidatosFiltrados().length}
                  {mostrarSoloConVotos && (
                    <span className="text-gray-500 ml-1">
                      (con votos de {candidatos.filter(c => normalizarDistritoId(c.zona) === selectedDistrito).length} total)
                    </span>
                  )}
                </div>
              </div>

              {/* Tabla de Candidatos */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                  <div className="flex items-center">
                    <div className="flex items-center text-purple-600 mr-3">
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                      </svg>
                      <span className="font-medium">Candidatos cargados</span>
                    </div>
                    <span className="text-gray-500">
                      Total: {getCandidatosFiltrados().length}
                    </span>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Nombre
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Partido
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Pacto
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Votos Reales
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Votos Encuesta
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {getCandidatosFiltrados()
                        .map((candidato, index) => {
                          // Función para obtener el color de fondo según el partido
                          const getPartidoColor = (partido) => {
                            const colores = {
                              'FA': 'bg-red-100',
                              'RN': 'bg-blue-100', 
                              'PC': 'bg-red-200',
                              'UDI': 'bg-blue-200',
                              'REP': 'bg-yellow-100',
                              'PPD': 'bg-red-100',
                              'PNL': 'bg-yellow-200',
                              'PS': 'bg-red-100',
                              'DC': 'bg-purple-100'
                            };
                            return colores[partido] || 'bg-gray-100';
                          };

                          return (
                            <tr key={index} className={`${getPartidoColor(candidato.partido)} hover:bg-opacity-75 transition-colors duration-150`}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {candidato.nombre}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                {candidato.partido}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-700">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPactoColor(candidato.pacto)}`}>
                                  {getPactoNombre(candidato.pacto)}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                <span className="font-medium">
                                  {candidato.votos_reales ? candidato.votos_reales.toLocaleString() : '0'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                <span className="font-medium">
                                  {candidato.votos_encuesta ? candidato.votos_encuesta.toLocaleString() : '0'}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Tabla de Votos Acumulados por Lista y Partido */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden mt-8">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                  <div className="flex items-center">
                    <div className="flex items-center text-green-600 mr-3">
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd"/>
                      </svg>
                      <span className="font-medium">Votos Acumulados por Lista</span>
                    </div>
                    <span className="text-gray-500">
                      Total Listas: {getListasDistrito().length}
                    </span>
                  </div>
                </div>
                
                {loadingVotos ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                      <p className="text-gray-600">Cargando votos acumulados...</p>
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Código
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Nombre Lista
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Votos Reales
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Votos Encuesta
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {getListasDistrito().map((lista, index) => {
                          // El código de la lista ES el código del pacto
                          const pactoLista = lista.codigo
                          return (
                            <tr key={index} className="hover:bg-gray-50 transition-colors duration-150">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  {lista.codigo}
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-700">
                                {pactoLista ? (
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPactoColor(pactoLista)}`}>
                                    {getPactoNombre(pactoLista)}
                                  </span>
                                ) : (
                                  <span className="text-gray-400 text-xs">Sin pacto</span>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                <span className="font-medium">
                                  {lista.votos_reales ? lista.votos_reales.toLocaleString() : '0'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                <span className="font-medium">
                                  {lista.votos_encuesta ? lista.votos_encuesta.toFixed(1) + '%' : '0%'}
                                </span>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Tabla de Partidos Acumulados */}
              {(loadingVotos || getPartidosDistrito().length > 0) && (
                <div className="bg-white rounded-lg shadow-md overflow-hidden mt-6">
                  <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                    <div className="flex items-center">
                      <div className="flex items-center text-blue-600 mr-3">
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 3a1 1 0 00-1.447-.894L8.763 6H5a3 3 0 000 6h.28l1.771 5.316A1 1 0 008 18h1a1 1 0 001-1v-4.382l6.553 3.276A1 1 0 0018 15V3z" clipRule="evenodd"/>
                        </svg>
                        <span className="font-medium">Votos Acumulados por Partido</span>
                      </div>
                      <span className="text-gray-500">
                        Total Partidos: {getPartidosDistrito().length}
                      </span>
                    </div>
                  </div>
                  
                  {loadingVotos ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Cargando votos por partido...</p>
                      </div>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Código
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Nombre Partido
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Pacto
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Votos Reales
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Votos Encuesta
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {getPartidosDistrito().map((partido, index) => (
                            <tr key={index} className="hover:bg-gray-50 transition-colors duration-150">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  {partido.codigo}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  {partido.nombre}
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-700">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPactoColor(partido.pacto)}`}>
                                  {getPactoNombre(partido.pacto)}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                <span className="font-medium">
                                  {partido.votos_reales ? partido.votos_reales.toLocaleString() : '0'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                <span className="font-medium">
                                  {partido.votos_encuesta ? partido.votos_encuesta.toFixed(1) + '%' : '0%'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="mt-6 text-sm text-gray-500">
            <p>Total de distritos disponibles: {distritos.length}</p>
            <p>Total de candidatos: {candidatos.length}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
