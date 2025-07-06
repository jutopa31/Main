# Importación Masiva de Datos - Guía Completa

## Resumen Ejecutivo

Para realizar una carga masiva de datos desde fuentes externas (PDFs, documentos, etc.) y crear automáticamente una base de datos de residencias médicas, hemos implementado una **estrategia multicapa** que combina:

1. **Agente Inteligente con LLM** (Recomendado)
2. **Procesamiento de PDFs**
3. **Validación y Estructuración de Datos**
4. **Integración con APIs de LLM**

## Arquitectura Recomendada

### Opción A: Agente Inteligente con LLM (Recomendada)

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   PDF/Documento │───▶│  Procesador     │───▶│  Agente LLM     │
│                 │    │  de Texto       │    │  (GPT-4/Claude) │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                       │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Base de       │◀───│  Validador      │◀───│  Datos          │
│   Datos         │    │  de Datos       │    │  Estructurados  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Opción B: Herramientas Especializadas

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   PDF           │───▶│  PyPDF2/        │───▶│  Reglas de      │
│   Documento     │    │  pdfplumber     │    │  Negocio        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                       │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Base de       │◀───│  Normalizador   │◀───│  Datos          │
│   Datos         │    │  de Datos       │    │  Extraídos      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Implementación del Agente Inteligente

### 1. Componente DataImportAgent

El componente `DataImportAgent` proporciona:

- **Interfaz de usuario intuitiva** para carga de archivos
- **Configuración de LLM** (OpenAI, Anthropic, modelos locales)
- **Procesamiento en tiempo real** con indicadores de progreso
- **Validación automática** de datos extraídos
- **Importación masiva** a la base de datos

### 2. Servicio LLM

El servicio `LLMService` en `lib/llm-service.ts` incluye:

- **Integración con múltiples proveedores** (OpenAI, Anthropic, modelos locales)
- **Prompts especializados** para residencias médicas
- **Esquemas de validación** JSON
- **Manejo de errores** robusto

### 3. Procesador de PDFs

El componente `PDFProcessor` ofrece:

- **Extracción de texto** de PDFs
- **Soporte para múltiples formatos** (PDF, TXT, DOC, DOCX)
- **Procesamiento por lotes**
- **Descarga de texto extraído**

## Configuración del LLM

### Prompts Especializados

```typescript
const RESIDENCY_INSTRUCTIONS = `
Eres un agente especializado en extraer información de residencias médicas de Argentina.

Extrae la siguiente información de cada residencia encontrada:
- Nombre de la residencia
- Hospital o institución
- Provincia y ciudad
- Especialidad médica
- Duración en años
- Número total de posiciones
- Vacantes disponibles
- Fuente de financiamiento (público/privado/mixto)
- Información de contacto si está disponible

Clasifica las especialidades según las categorías estándar:
- Medicina Interna
- Cirugía General
- Pediatría
- Ginecología y Obstetricia
- Anestesiología
- Radiología
- Cardiología
- Neurología
- Psiquiatría
- Dermatología
- Oftalmología
- Otorrinolaringología
- Traumatología
- Medicina Familiar
- Medicina de Emergencias
- Patología
- Oncología

Normaliza las provincias según los nombres oficiales de Argentina.
`
```

### Esquema de Validación

```typescript
const RESIDENCY_SCHEMA = {
  type: "object",
  properties: {
    residencies: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          hospital: { type: "string" },
          province: { type: "string" },
          city: { type: "string" },
          specialty: { type: "string" },
          duration: { type: "number" },
          totalPositions: { type: "number" },
          availableVacancies: { type: "number" },
          fundingSource: { type: "string", enum: ["public", "private", "mixed"] },
          description: { type: "string" }
        },
        required: ["name", "hospital", "province", "specialty"]
      }
    }
  }
}
```

## Flujo de Trabajo

### 1. Carga de Archivos
- El usuario sube PDFs o documentos
- El sistema valida el formato y tamaño
- Se muestra progreso de carga

### 2. Procesamiento de Texto
- Extracción de texto de PDFs
- Limpieza y normalización
- Preparación para análisis LLM

### 3. Análisis con LLM
- Envío de texto al LLM configurado
- Extracción estructurada de información
- Validación contra esquema

### 4. Validación y Corrección
- Verificación de datos extraídos
- Corrección automática cuando es posible
- Reporte de errores para revisión manual

### 5. Importación a Base de Datos
- Transformación a formato de residencia
- Asignación de IDs únicos
- Integración con sistema existente

## Configuración de APIs

### OpenAI
```typescript
const openaiConfig = {
  provider: "openai",
  model: "gpt-4",
  apiKey: process.env.OPENAI_API_KEY,
  temperature: 0.1,
  maxTokens: 2000
}
```

### Anthropic
```typescript
const anthropicConfig = {
  provider: "anthropic",
  model: "claude-3-sonnet-20240229",
  apiKey: process.env.ANTHROPIC_API_KEY,
  temperature: 0.1,
  maxTokens: 2000
}
```

### Modelo Local (Ollama)
```typescript
const localConfig = {
  provider: "local",
  model: "llama2",
  temperature: 0.1,
  maxTokens: 2000
}
```

## Mejores Prácticas

### 1. Preparación de Datos
- **Limpieza de PDFs**: Asegúrate de que los PDFs sean de texto, no escaneados
- **Formato consistente**: Usa plantillas cuando sea posible
- **Validación previa**: Revisa la calidad de los documentos

### 2. Configuración del LLM
- **Temperatura baja** (0.1-0.3) para extracción precisa
- **Prompts específicos** para tu dominio
- **Esquemas de validación** estrictos
- **Manejo de errores** robusto

### 3. Validación de Datos
- **Verificación de campos requeridos**
- **Normalización de provincias y especialidades**
- **Validación de rangos** (duración, posiciones, etc.)
- **Detección de duplicados**

### 4. Seguridad
- **API Keys seguras** en variables de entorno
- **Validación de entrada** de archivos
- **Límites de tamaño** de archivos
- **Rate limiting** para APIs

## Casos de Uso

### 1. Importación desde PDFs Oficiales
- Documentos del Ministerio de Salud
- Catálogos de hospitales
- Informes anuales de residencias

### 2. Actualización Masiva
- Cambios en programas existentes
- Nuevas vacantes disponibles
- Modificaciones en requisitos

### 3. Migración de Datos
- Desde sistemas legacy
- Desde hojas de cálculo
- Desde bases de datos externas

## Monitoreo y Mantenimiento

### 1. Logs de Procesamiento
- Registro de archivos procesados
- Tasa de éxito de extracción
- Errores comunes y soluciones

### 2. Métricas de Calidad
- Precisión de extracción
- Tiempo de procesamiento
- Costos de API

### 3. Actualizaciones
- Nuevos formatos de documento
- Cambios en esquemas de datos
- Mejoras en prompts

## Solución de Problemas

### Problemas Comunes

1. **Extracción incorrecta de datos**
   - Revisar prompts del LLM
   - Ajustar esquema de validación
   - Mejorar calidad de documentos fuente

2. **Errores de API**
   - Verificar API keys
   - Revisar límites de rate
   - Comprobar conectividad

3. **Datos duplicados**
   - Implementar detección de duplicados
   - Validar antes de importar
   - Usar identificadores únicos

### Debugging

```typescript
// Habilitar logs detallados
const debugConfig = {
  ...llmConfig,
  debug: true,
  logLevel: "verbose"
}

// Verificar respuesta del LLM
console.log("LLM Response:", llmResponse)
console.log("Parsed Data:", parsedData)
console.log("Validation Errors:", validationErrors)
```

## Costos y Optimización

### Estimación de Costos (OpenAI GPT-4)
- **PDF de 10 páginas**: ~$0.10-0.20
- **Lote de 100 PDFs**: ~$10-20
- **Procesamiento mensual**: ~$50-200

### Optimizaciones
- **Procesamiento por lotes** para reducir costos
- **Caching** de respuestas similares
- **Compresión** de prompts
- **Modelos más económicos** para tareas simples

## Conclusión

La implementación del agente inteligente con LLM proporciona una solución robusta y escalable para la importación masiva de datos de residencias médicas. La combinación de procesamiento de PDFs, extracción inteligente con LLM, y validación automática asegura alta precisión y eficiencia en el proceso de carga de datos. 