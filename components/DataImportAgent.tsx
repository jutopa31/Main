"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Upload, 
  FileText, 
  Database, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  Download,
  Eye,
  Trash2,
  Settings,
  Brain
} from "lucide-react"
import type { MedicalResidency } from "../types/residency"

interface DataImportAgentProps {
  onImportResidencies: (residencies: Omit<MedicalResidency, "id" | "lastUpdated">[]) => void
}

interface ImportResult {
  success: boolean
  message: string
  data?: any
  errors?: string[]
}

interface ProcessingStep {
  name: string
  status: "pending" | "processing" | "completed" | "error"
  progress: number
  message?: string
}

export default function DataImportAgent({ onImportResidencies }: DataImportAgentProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [processingSteps, setProcessingSteps] = useState<ProcessingStep[]>([])
  const [importResults, setImportResults] = useState<ImportResult[]>([])
  const [extractedData, setExtractedData] = useState<any[]>([])
  const [validationResults, setValidationResults] = useState<any[]>([])
  const [llmConfig, setLlmConfig] = useState({
    model: "gpt-4",
    temperature: 0.1,
    maxTokens: 2000,
    useAdvancedExtraction: true
  })
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Configuración del agente LLM
  const llmPrompt = `
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
    
    Devuelve los datos en formato JSON con esta estructura:
    {
      "residencies": [
        {
          "name": "Nombre de la residencia",
          "hospital": "Hospital o institución",
          "province": "Provincia",
          "city": "Ciudad",
          "specialty": "Especialidad",
          "duration": 3,
          "totalPositions": 1,
          "availableVacancies": 0,
          "fundingSource": "public",
          "description": "Descripción opcional"
        }
      ]
    }
  `

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setUploadedFiles(prev => [...prev, ...files])
  }

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const validateExtractedData = (data: any): string[] => {
    const errors: string[] = []
    
    if (!data.name || data.name.trim() === "") {
      errors.push("Nombre de residencia requerido")
    }
    
    if (!data.hospital || data.hospital.trim() === "") {
      errors.push("Hospital requerido")
    }
    
    if (!data.province || data.province.trim() === "") {
      errors.push("Provincia requerida")
    }
    
    if (!data.specialty || data.specialty.trim() === "") {
      errors.push("Especialidad requerida")
    }
    
    if (!data.duration || data.duration < 1) {
      errors.push("Duración debe ser mayor a 0")
    }
    
    return errors
  }

  const processFileWithLLM = async (file: File): Promise<ImportResult> => {
    try {
      // Simulación del procesamiento con LLM
      // En implementación real, aquí iría la llamada a la API del LLM
      
      const text = await extractTextFromFile(file)
      
      // Simular respuesta del LLM
      const mockLLMResponse = {
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
            fundingSource: "public",
            description: "Residencia médica en medicina interna"
          }
        ]
      }
      
      return {
        success: true,
        message: `Extraídos ${mockLLMResponse.residencies.length} registros de ${file.name}`,
        data: mockLLMResponse.residencies
      }
    } catch (error) {
      return {
        success: false,
        message: `Error procesando ${file.name}: ${error}`,
        errors: [error as string]
      }
    }
  }

  const extractTextFromFile = async (file: File): Promise<string> => {
    // Simulación de extracción de texto
    // En implementación real, usar librerías como pdfplumber, PyPDF2, etc.
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        // Simular texto extraído
        resolve("Contenido del archivo extraído...")
      }
      reader.readAsText(file)
    })
  }

  const startProcessing = async () => {
    if (uploadedFiles.length === 0) return
    
    setIsProcessing(true)
    setProcessingSteps([
      { name: "Inicializando agente LLM", status: "pending", progress: 0 },
      { name: "Procesando archivos", status: "pending", progress: 0 },
      { name: "Extrayendo datos", status: "pending", progress: 0 },
      { name: "Validando información", status: "pending", progress: 0 },
      { name: "Preparando importación", status: "pending", progress: 0 }
    ])
    
    const results: ImportResult[] = []
    const allExtractedData: any[] = []
    
    try {
      // Paso 1: Inicializar agente
      updateStep(0, "processing", 50, "Agente LLM inicializado")
      await new Promise(resolve => setTimeout(resolve, 1000))
      updateStep(0, "completed", 100, "Agente LLM listo")
      
      // Paso 2: Procesar archivos
      updateStep(1, "processing", 0, "Iniciando procesamiento de archivos")
      
      for (let i = 0; i < uploadedFiles.length; i++) {
        const file = uploadedFiles[i]
        const progress = ((i + 1) / uploadedFiles.length) * 100
        
        updateStep(1, "processing", progress, `Procesando ${file.name}`)
        
        const result = await processFileWithLLM(file)
        results.push(result)
        
        if (result.success && result.data) {
          allExtractedData.push(...result.data)
        }
        
        await new Promise(resolve => setTimeout(resolve, 500))
      }
      
      updateStep(1, "completed", 100, "Todos los archivos procesados")
      
      // Paso 3: Validar datos
      updateStep(3, "processing", 0, "Validando datos extraídos")
      
      const validationResults = allExtractedData.map((data, index) => {
        const errors = validateExtractedData(data)
        return {
          index,
          data,
          isValid: errors.length === 0,
          errors
        }
      })
      
      const validData = validationResults.filter(r => r.isValid).map(r => r.data)
      const invalidData = validationResults.filter(r => !r.isValid)
      
      updateStep(3, "completed", 100, `Validación completada: ${validData.length} válidos, ${invalidData.length} con errores`)
      
      // Paso 4: Preparar importación
      updateStep(4, "processing", 50, "Preparando datos para importación")
      
      setExtractedData(allExtractedData)
      setValidationResults(validationResults)
      setImportResults(results)
      
      updateStep(4, "completed", 100, "Listo para importar")
      
    } catch (error) {
      console.error("Error en procesamiento:", error)
      updateStep(4, "error", 0, `Error: ${error}`)
    } finally {
      setIsProcessing(false)
    }
  }

  const updateStep = (index: number, status: ProcessingStep["status"], progress: number, message?: string) => {
    setProcessingSteps(prev => prev.map((step, i) => 
      i === index ? { ...step, status, progress, message } : step
    ))
  }

  const importValidData = () => {
    const validData = validationResults.filter(r => r.isValid).map(r => r.data)
    
    const residenciesToImport: Omit<MedicalResidency, "id" | "lastUpdated">[] = validData.map(data => ({
      name: data.name,
      hospital: data.hospital,
      province: data.province,
      city: data.city,
      specialty: data.specialty,
      duration: data.duration,
      totalPositions: data.totalPositions || 1,
      availableVacancies: data.availableVacancies || 0,
      filledPositions: (data.totalPositions || 1) - (data.availableVacancies || 0),
      vacancyStatus: "unknown",
      fundingSource: data.fundingSource || "public",
      registryStatus: "active",
      surveyStatus: "pending",
      notes: [],
      benefits: [],
      description: data.description || ""
    }))
    
    onImportResidencies(residenciesToImport)
    
    // Limpiar estado
    setUploadedFiles([])
    setExtractedData([])
    setValidationResults([])
    setImportResults([])
    setProcessingSteps([])
  }

  const getStepIcon = (status: ProcessingStep["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case "processing":
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
      default:
        return <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Agente de Importación Inteligente
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs defaultValue="upload" className="w-full">
            <TabsList>
              <TabsTrigger value="upload">Cargar Archivos</TabsTrigger>
              <TabsTrigger value="config">Configuración LLM</TabsTrigger>
              <TabsTrigger value="results">Resultados</TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <Label htmlFor="file-upload" className="cursor-pointer">
                  <span className="text-blue-600 hover:text-blue-800">Subir archivos</span> o arrastrar y soltar
                </Label>
                <Input
                  id="file-upload"
                  type="file"
                  multiple
                  accept=".pdf,.txt,.doc,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Soporta PDF, TXT, DOC, DOCX
                </p>
              </div>

              {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Archivos cargados:</h4>
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <span>{file.name}</span>
                        <Badge variant="secondary">{file.size} bytes</Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <Button 
                onClick={startProcessing}
                disabled={uploadedFiles.length === 0 || isProcessing}
                className="w-full"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4 mr-2" />
                    Iniciar Procesamiento Inteligente
                  </>
                )}
              </Button>
            </TabsContent>

            <TabsContent value="config" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Modelo LLM</Label>
                  <Select
                    value={llmConfig.model}
                    onValueChange={(value) => setLlmConfig(prev => ({ ...prev, model: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt-4">GPT-4</SelectItem>
                      <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                      <SelectItem value="claude-3">Claude 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Temperatura</Label>
                  <Input
                    type="number"
                    min="0"
                    max="2"
                    step="0.1"
                    value={llmConfig.temperature}
                    onChange={(e) => setLlmConfig(prev => ({ 
                      ...prev, 
                      temperature: parseFloat(e.target.value) 
                    }))}
                  />
                </div>
              </div>

              <div>
                <Label>Prompt de Extracción</Label>
                <Textarea
                  value={llmPrompt}
                  onChange={(e) => {/* Actualizar prompt */}}
                  rows={10}
                  placeholder="Configura el prompt para el LLM..."
                />
              </div>
            </TabsContent>

            <TabsContent value="results" className="space-y-4">
              {processingSteps.length > 0 && (
                <div className="space-y-4">
                  <h4 className="font-medium">Progreso del Procesamiento</h4>
                  {processingSteps.map((step, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center gap-2">
                        {getStepIcon(step.status)}
                        <span className="text-sm font-medium">{step.name}</span>
                        {step.message && (
                          <span className="text-xs text-gray-500">- {step.message}</span>
                        )}
                      </div>
                      <Progress value={step.progress} className="h-2" />
                    </div>
                  ))}
                </div>
              )}

              {validationResults.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Resultados de Validación</h4>
                    <Button onClick={importValidData} disabled={validationResults.filter(r => r.isValid).length === 0}>
                      <Database className="h-4 w-4 mr-2" />
                      Importar Datos Válidos
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-green-600">
                          Datos Válidos ({validationResults.filter(r => r.isValid).length})
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {validationResults.filter(r => r.isValid).map((result, index) => (
                          <div key={index} className="p-2 bg-green-50 rounded mb-2">
                            <div className="font-medium">{result.data.name}</div>
                            <div className="text-sm text-gray-600">
                              {result.data.hospital} - {result.data.specialty}
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-red-600">
                          Con Errores ({validationResults.filter(r => !r.isValid).length})
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {validationResults.filter(r => !r.isValid).map((result, index) => (
                          <div key={index} className="p-2 bg-red-50 rounded mb-2">
                            <div className="font-medium">{result.data.name || "Sin nombre"}</div>
                            <div className="text-xs text-red-600">
                              {result.errors?.join(", ")}
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
