import { Link } from 'react-router-dom'

const Comparativa = () => {
  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <div className="flex items-center mb-6">
            <Link
              to="/"
              className="inline-flex items-center text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="ml-2 font-medium">Volver</span>
            </Link>
            <h1 className="text-4xl font-bold text-gray-800 ml-auto">Comparativa Electoral</h1>
          </div>
          <p className="text-gray-600">Comparación entre votos de encuesta y votos reales</p>
        </header>

        {/* Contenido "En construcción" */}
        <div className="bg-white rounded-lg shadow-lg p-12 text-center">
          <div className="flex flex-col items-center">
            {/* Icono de construcción */}
            <div className="w-32 h-32 bg-yellow-100 rounded-full flex items-center justify-center mb-6">
              <svg className="w-16 h-16 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>

            <h2 className="text-3xl font-bold text-gray-800 mb-4">Página en Construcción</h2>
            <p className="text-lg text-gray-600 mb-6 max-w-xl">
              Esta sección estará disponible próximamente. Aquí podrás comparar los resultados entre votos de encuesta y votos reales.
            </p>

            {/* Características futuras */}
            <div className="mt-8 grid md:grid-cols-2 gap-4 w-full max-w-2xl">
              <div className="bg-gray-50 rounded-lg p-4 text-left">
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-indigo-600 shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">Comparación por Distrito</h3>
                    <p className="text-sm text-gray-600">Visualiza las diferencias entre encuestas y resultados reales por cada distrito</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 text-left">
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-indigo-600 shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">Hemiciclo Comparado</h3>
                    <p className="text-sm text-gray-600">Visualiza lado a lado la composición del hemiciclo según cada tipo de voto</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 text-left">
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-indigo-600 shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">Análisis de Diferencias</h3>
                    <p className="text-sm text-gray-600">Estadísticas sobre la precisión de las encuestas vs resultados</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 text-left">
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-indigo-600 shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">Gráficos Interactivos</h3>
                    <p className="text-sm text-gray-600">Visualizaciones detalladas de las variaciones entre ambos tipos de datos</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Botón volver */}
            <Link
              to="/"
              className="mt-8 inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-md"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Comparativa
