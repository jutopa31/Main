// Servicio para integración con LLMs para extracción de datos
export interface LLMConfig {
  provider: "openai" | "anthropic" | "local"
  model: string
  apiKey?: string
  temperature: number
  maxTokens: number
}

export interface ExtractionRequest {
  text: string
  schema: any
  instructions: string
}

export interface ExtractionResult {
  success: boolean
  data?: any
  error?: string
  confidence?: number
}

export class LLMService {
  private config: LLMConfig

  constructor(config: LLMConfig) {
    this.config = config
  }

  async extractData(request: ExtractionRequest): Promise<ExtractionResult> {
    try {
      switch (this.config.provider) {
        case "openai":
          return await this.extractWithOpenAI(request)
        case "anthropic":
          return await this.extractWithAnthropic(request)
        case "local":
          return await this.extractWithLocalModel(request)
        default:
          throw new Error(`Proveedor no soportado: ${this.config.provider}`)
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido"
      }
    }
  }

  private async extractWithOpenAI(request: ExtractionRequest): Promise<ExtractionResult> {
    if (!this.config.apiKey) {
      throw new Error("API Key requerida para OpenAI")
    }

    const prompt = this.buildPrompt(request)
    
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.config.apiKey}`
      },
      body: JSON.stringify({
        model: this.config.model,
        messages: [
          {
            role: "system",
            content: "Eres un asistente especializado en extraer información estructurada de documentos médicos."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: this.config.temperature,
        max_tokens: this.config.maxTokens
      })
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Error de OpenAI: ${error}`)
    }

    const data = await response.json()
    const extractedText = data.choices[0]?.message?.content

    if (!extractedText) {
      throw new Error("No se pudo extraer respuesta del LLM")
    }

    try {
      const parsedData = JSON.parse(extractedText)
      return {
        success: true,
        data: parsedData,
        confidence: 0.9 // Simulado
      }
    } catch (parseError) {
      return {
        success: false,
        error: "Error al parsear respuesta JSON del LLM"
      }
    }
  }

  private async extractWithAnthropic(request: ExtractionRequest): Promise<ExtractionResult> {
    if (!this.config.apiKey) {
      throw new Error("API Key requerida para Anthropic")
    }

    const prompt = this.buildPrompt(request)
    
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.config.apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: this.config.model,
        max_tokens: this.config.maxTokens,
        messages: [
          {
            role: "user",
            content: prompt
          }
        ]
      })
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Error de Anthropic: ${error}`)
    }

    const data = await response.json()
    const extractedText = data.content[0]?.text

    if (!extractedText) {
      throw new Error("No se pudo extraer respuesta del LLM")
    }

    try {
      const parsedData = JSON.parse(extractedText)
      return {
        success: true,
        data: parsedData,
        confidence: 0.9
      }
    } catch (parseError) {
      return {
        success: false,
        error: "Error al parsear respuesta JSON del LLM"
      }
    }
  }

  private async extractWithLocalModel(request: ExtractionRequest): Promise<ExtractionResult> {
    // Implementación para modelos locales (Ollama, etc.)
    // Esta es una simulación
    return {
      success: true,
      data: {
        residencies: [
          {
            name: "Residencia de Medicina Interna",
            hospital: "Hospital Italiano",
            province: "Buenos Aires",
            city: "Buenos Aires",
            specialty: "Medicina Interna",
            duration: 3,
            totalPositions: 2,
            availableVacancies: 1,
            fundingSource: "public"
          }
        ]
      },
      confidence: 0.8
    }
  }

  private buildPrompt(request: ExtractionRequest): string {
    return `
${request.instructions}

TEXTO A ANALIZAR:
${request.text}

INSTRUCCIONES:
1. Analiza el texto proporcionado
2. Extrae toda la información relevante sobre residencias médicas
3. Estructura los datos según el esquema especificado
4. Devuelve SOLO un JSON válido sin texto adicional

ESQUEMA REQUERIDO:
${JSON.stringify(request.schema, null, 2)}

IMPORTANTE:
- Devuelve únicamente JSON válido
- Si no encuentras información para un campo, usa null o string vacío
- Asegúrate de que los tipos de datos coincidan con el esquema
- No incluyas explicaciones, solo el JSON
`
  }
}

// Configuraciones predefinidas
export const LLM_CONFIGS = {
  openai: {
    provider: "openai" as const,
    model: "gpt-4",
    temperature: 0.1,
    maxTokens: 2000
  },
  anthropic: {
    provider: "anthropic" as const,
    model: "claude-3-sonnet-20240229",
    temperature: 0.1,
    maxTokens: 2000
  },
  local: {
    provider: "local" as const,
    model: "llama2",
    temperature: 0.1,
    maxTokens: 2000
  }
}

// Esquema para residencias médicas
export const RESIDENCY_SCHEMA = {
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

// Instrucciones específicas para residencias médicas
export const RESIDENCY_INSTRUCTIONS = `
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
