"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  FileText, 
  Upload, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  Eye,
  Download,
  Trash2
} from "lucide-react"

interface PDFProcessorProps {
  onTextExtracted: (text: string, fileName: string) => void
}

interface ProcessedFile {
  name: string
  size: number
  text: string
  status: "pending" | "processing" | "completed" | "error"
  error?: string
}

export default function PDFProcessor({ onTextExtracted }: PDFProcessorProps) {
  const [files, setFiles] = useState<ProcessedFile[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentProgress, setCurrentProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = Array.from(event.target.files || [])
    
    const newFiles: ProcessedFile[] = uploadedFiles.map(file => ({
      name: file.name,
      size: file.size,
      text: "",
      status: "pending"
    }))
    
    setFiles(prev => [...prev, ...newFiles])
  }

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const processFiles = async () => {
    if (files.length === 0) return
    
    setIsProcessing(true)
    setCurrentProgress(0)
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      
      // Actualizar estado del archivo
      setFiles(prev => prev.map((f, index) => 
        index === i ? { ...f, status: "processing" } : f
      ))
      
      try {
        // Simular procesamiento de PDF
        await simulatePDFProcessing(file.name)
        
        // Simular texto extraído
        const extractedText = await simulateTextExtraction(file.name)
        
        // Actualizar archivo procesado
        setFiles(prev => prev.map((f, index) => 
          index === i ? { 
            ...f, 
            status: "completed", 
            text: extractedText 
          } : f
        ))
        
        // Notificar al componente padre
        onTextExtracted(extractedText, file.name)
        
      } catch (error) {
        setFiles(prev => prev.map((f, index) => 
          index === i ? { 
            ...f, 
            status: "error", 
            error: error instanceof Error ? error.message : "Error desconocido"
          } : f
        ))
      }
      
      // Actualizar progreso
      setCurrentProgress(((i + 1) / files.length) * 100)
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simular delay
    }
    
    setIsProcessing(false)
  }

  const simulatePDFProcessing = async (fileName: string): Promise<void> => {
    // En implementación real, aquí usarías:
    // - pdfplumber para Python
    // - pdf-parse para Node.js
    // - PyPDF2 para Python
    // - pdfjs-dist para JavaScript
    
    return new Promise((resolve) => {
      setTimeout(resolve, 2000) // Simular tiempo de procesamiento
    })
  }

  const simulateTextExtraction = async (fileName: string): Promise<string> => {
    // Simular texto extraído de diferentes tipos de PDFs
    const mockTexts = {
      "residencias-medicas.pdf": `
        RESIDENCIAS MÉDICAS - ARGENTINA 2024
        
        HOSPITAL ITALIANO DE BUENOS AIRES
        Residencia de Medicina Interna
        - Duración: 3 años
        - Posiciones: 2
        - Vacantes disponibles: 1
        - Financiamiento: Público
        - Contacto: Dr. Juan Pérez, jperez@hospitalitaliano.org
        
        HOSPITAL ALEMÁN
        Residencia de Cirugía General
        - Duración: 4 años
        - Posiciones: 3
        - Vacantes disponibles: 0
        - Financiamiento: Privado
        - Contacto: Dra. María González, mgonzalez@hospitalaleman.com
        
        HOSPITAL BRITÁNICO
        Residencia de Pediatría
        - Duración: 3 años
        - Posiciones: 1
        - Vacantes disponibles: 1
        - Financiamiento: Mixto
        - Contacto: Dr. Carlos López, clopez@hospitalbritanico.com
      `,
      "programas-especialidades.pdf": `
        PROGRAMAS DE ESPECIALIDADES MÉDICAS
        
        PROVINCIA DE CÓRDOBA
        Hospital Universitario de Córdoba
        - Residencia de Cardiología (3 años, 2 posiciones)
        - Residencia de Neurología (3 años, 1 posición)
        - Residencia de Radiología (4 años, 1 posición)
        
        PROVINCIA DE MENDOZA
        Hospital Central de Mendoza
        - Residencia de Anestesiología (3 años, 3 posiciones)
        - Residencia de Ginecología y Obstetricia (4 años, 2 posiciones)
        
        PROVINCIA DE SANTA FE
        Hospital Provincial de Rosario
        - Residencia de Traumatología (4 años, 2 posiciones)
        - Residencia de Oftalmología (3 años, 1 posición)
      `,
      "default": `
        DOCUMENTO DE RESIDENCIAS MÉDICAS
        
        Información general sobre programas de residencia médica
        en diferentes hospitales e instituciones de Argentina.
        
        Incluye detalles sobre especialidades, duración,
        posiciones disponibles y requisitos de ingreso.
      `
    }
    
    const text = mockTexts[fileName as keyof typeof mockTexts] || mockTexts.default
    
    return new Promise((resolve) => {
      setTimeout(() => resolve(text), 1000)
    })
  }

  const downloadExtractedText = (file: ProcessedFile) => {
    if (!file.text) return
    
    const blob = new Blob([file.text], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${file.name.replace(/\.[^/.]+$/, "")}_extracted.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const getStatusIcon = (status: ProcessedFile["status"]) => {
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

  const getStatusText = (status: ProcessedFile["status"]) => {
    switch (status) {
      case "completed":
        return "Completado"
      case "error":
        return "Error"
      case "processing":
        return "Procesando"
      default:
        return "Pendiente"
    }
  }

  const completedFiles = files.filter(f => f.status === "completed")
  const errorFiles = files.filter(f => f.status === "error")
  const pendingFiles = files.filter(f => f.status === "pending")

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Procesador de PDFs
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Área de carga */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm text-gray-600 mb-2">
              Arrastra archivos PDF aquí o haz clic para seleccionar
            </p>
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              disabled={isProcessing}
            >
              Seleccionar Archivos
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>

          {/* Estadísticas */}
          {files.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded">
                <div className="text-2xl font-bold text-blue-600">{files.length}</div>
                <div className="text-sm text-blue-600">Total</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded">
                <div className="text-2xl font-bold text-green-600">{completedFiles.length}</div>
                <div className="text-sm text-green-600">Completados</div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded">
                <div className="text-2xl font-bold text-red-600">{errorFiles.length}</div>
                <div className="text-sm text-red-600">Con Error</div>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded">
                <div className="text-2xl font-bold text-yellow-600">{pendingFiles.length}</div>
                <div className="text-sm text-yellow-600">Pendientes</div>
              </div>
            </div>
          )}

          {/* Progreso */}
          {isProcessing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Procesando archivos...</span>
                <span>{Math.round(currentProgress)}%</span>
              </div>
              <Progress value={currentProgress} className="h-2" />
            </div>
          )}

          {/* Lista de archivos */}
          {files.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Archivos</h4>
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(file.status)}
                    <div>
                      <div className="font-medium">{file.name}</div>
                      <div className="text-sm text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant={
                      file.status === "completed" ? "default" :
                      file.status === "error" ? "destructive" :
                      file.status === "processing" ? "secondary" : "outline"
                    }>
                      {getStatusText(file.status)}
                    </Badge>
                    
                    {file.status === "completed" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => downloadExtractedText(file)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      disabled={isProcessing}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Botón de procesamiento */}
          {files.length > 0 && !isProcessing && (
            <Button 
              onClick={processFiles}
              className="w-full"
              disabled={files.filter(f => f.status === "pending").length === 0}
            >
              <FileText className="h-4 w-4 mr-2" />
              Procesar {files.filter(f => f.status === "pending").length} Archivos
            </Button>
          )}

          {/* Alertas */}
          {errorFiles.length > 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {errorFiles.length} archivo(s) tuvieron errores durante el procesamiento.
                Revisa los detalles y vuelve a intentar.
              </AlertDescription>
            </Alert>
          )}

          {completedFiles.length > 0 && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                {completedFiles.length} archivo(s) procesados exitosamente.
                El texto extraído está listo para ser analizado por el agente LLM.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
