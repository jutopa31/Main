import { getListadoCompleto, getResumen } from './residencias-service'
import type { MedicalResidency } from '../types/residency'

// Mapeo de financiamiento del JSON al formato del sistema
const mapFinanciamiento = (financiamiento: string): "public" | "private" | "mixed" | "other" => {
  switch (financiamiento) {
    case 'nacional':
      return 'public'
    case 'Mixto':
      return 'mixed'
    case 'sin especificar':
      return 'other'
    default:
      return 'public'
  }
}

// Mapeo de provincias del JSON al formato del sistema
const mapProvincia = (provincia: string): string => {
  const provinciaMap: Record<string, string> = {
    'BUENOS AIRES': 'Buenos Aires',
    'C.A.B.A.': 'Ciudad Autónoma de Buenos Aires',
    'CATAMARCA': 'Catamarca',
    'CHACO': 'Chaco',
    'CHUBUT': 'Chubut',
    'CORDOBA': 'Córdoba',
    'CORRIENTES': 'Corrientes',
    'ENTRE RIOS': 'Entre Ríos',
    'FORMOSA': 'Formosa',
    'JUJUY': 'Jujuy',
    'LA PAMPA': 'La Pampa',
    'LA RIOJA': 'La Rioja',
    'MISIONES': 'Misiones',
    'RIO NEGRO': 'Río Negro',
    'SALTA': 'Salta',
    'SAN JUAN': 'San Juan',
    'SAN LUIS': 'San Luis',
    'SANTA CRUZ': 'Santa Cruz',
    'SANTA FE': 'Santa Fe',
    'SANTIAGO DEL ESTERO': 'Santiago del Ester',
    'TIERRA DEL FUEGO': 'Tierra del Fuego',
    'TUCUMAN': 'Tucumán'
  }
  
  return provinciaMap[provincia] || provincia
}

// Función para migrar una residencia del JSON al formato del sistema
export function migrarResidencia(residenciaJSON: any): Omit<MedicalResidency, "id" | "lastUpdated"> {
  return {
    name: residenciaJSON.institucion,
    hospital: residenciaJSON.institucion,
    province: mapProvincia(residenciaJSON.provincia),
    city: '', // No tenemos datos de ciudad en el JSON
    specialty: '', // No tenemos datos de especialidad en el JSON
    subspecialty: '',
    duration: 3, // Valor por defecto
    currentYear: undefined,
    accreditation: undefined,
    programType: 'basic',
    totalPositions: residenciaJSON.cantidad_cupos,
    availableVacancies: residenciaJSON.cantidad_cupos,
    filledPositions: 0,
    vacancyStatus: residenciaJSON.cantidad_cupos > 0 ? 'open' : 'closed',
    applicationDeadline: undefined,
    fundingSource: mapFinanciamiento(residenciaJSON.financiamiento),
    fundingDetails: residenciaJSON.financiamiento,
    salary: undefined,
    benefits: [],
    registryStatus: 'active',
    contactada: false, // Por defecto no contactada
    encuesta: false, // Por defecto encuesta no completada
    // lastUpdated se agregará automáticamente por el sistema
    description: `Residencia en ${residenciaJSON.institucion}`,
    requirements: '',
    additionalInfo: '',
    notes: [`Migrado desde datos oficiales. Financiamiento: ${residenciaJSON.financiamiento}`],
    createdBy: 'sistema',
    verificationStatus: 'verified',
    dataSource: 'datos_oficiales'
  }
}

// Función para migrar todas las residencias
export function migrarTodasLasResidencias(): Omit<MedicalResidency, "id" | "lastUpdated">[] {
  const residenciasJSON = getListadoCompleto()
  return residenciasJSON.map(migrarResidencia)
}

// Función para obtener estadísticas de migración
export function getEstadisticasMigracion() {
  const resumen = getResumen()
  const residenciasJSON = getListadoCompleto()
  
  const estadisticas = {
    totalResidencias: resumen.numero_total_residencias,
    totalCupos: resumen.total_cupos,
    provinciasCubiertas: resumen.provincias_cubiertas,
    porFinanciamiento: {} as Record<string, number>,
    porProvincia: {} as Record<string, number>
  }
  
  // Contar por financiamiento
  residenciasJSON.forEach(r => {
    estadisticas.porFinanciamiento[r.financiamiento] = (estadisticas.porFinanciamiento[r.financiamiento] || 0) + 1
  })
  
  // Contar por provincia
  residenciasJSON.forEach(r => {
    estadisticas.porProvincia[r.provincia] = (estadisticas.porProvincia[r.provincia] || 0) + 1
  })
  
  return estadisticas
}

// Función para migrar solo residencias de una provincia específica
export function migrarResidenciasPorProvincia(provincia: string): Omit<MedicalResidency, "id" | "lastUpdated">[] {
  const residenciasJSON = getListadoCompleto()
  const residenciasFiltradas = residenciasJSON.filter(r => r.provincia === provincia)
  return residenciasFiltradas.map(migrarResidencia)
}

// Función para migrar solo residencias con cupos disponibles
export function migrarResidenciasConCupos(): Omit<MedicalResidency, "id" | "lastUpdated">[] {
  const residenciasJSON = getListadoCompleto()
  const residenciasConCupos = residenciasJSON.filter(r => r.cantidad_cupos > 0)
  return residenciasConCupos.map(migrarResidencia)
}
