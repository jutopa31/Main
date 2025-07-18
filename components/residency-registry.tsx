"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Save, Edit, Trash2, MapPin, Users, DollarSign, Building, GraduationCap, FileText, Phone, User, Database } from "lucide-react"
import type { MedicalResidency, Contact } from "../types/residency"
import { Switch } from "@/components/ui/switch"
import { migrarTodasLasResidencias } from "../lib/residencias-migration"


interface RegistryProps {
  selectedProvince: string | null
  residencies: MedicalResidency[]
  contacts: Contact[]
  onAddResidency: (residency: Omit<MedicalResidency, "id" | "lastUpdated">) => void
  onAddResidencies: (residencies: Omit<MedicalResidency, "id" | "lastUpdated">[]) => void
  onUpdateResidency: (id: string, updates: Partial<MedicalResidency>) => void
  onDeleteResidency: (id: string) => void
  onNavigateToContacts?: (residencyId?: string) => void
}

const specialties = [
  "Medicina Interna",
  "Cirugía General",
  "Pediatría",
  "Ginecología y Obstetricia",
  "Anestesiología",
  "Radiología",
  "Cardiología",
  "Neurología",
  "Psiquiatría",
  "Dermatología",
  "Oftalmología",
  "Otorrinolaringología",
  "Traumatología",
  "Medicina Familiar",
  "Medicina de Emergencias",
  "Patología",
  "Oncología",
  "Endocrinología",
  "Gastroenterología",
  "Neumología",
  "Nefrología",
  "Urología",
]

const provinces = [
  "Buenos Aires",
  "Catamarca",
  "Chaco",
  "Chubut",
  "Córdoba",
  "Corrientes",
  "Entre Ríos",
  "Formosa",
  "Jujuy",
  "La Pampa",
  "La Rioja",
  "Mendoza",
  "Misiones",
  "Neuquén",
  "Río Negro",
  "Salta",
  "San Juan",
  "San Luis",
  "Santa Cruz",
  "Santa Fe",
  "Santiago del Estero",
  "Tierra del Fuego",
  "Tucumán",
  "Ciudad Autónoma de Buenos Aires",
]

export default function ResidencyRegistry({
  selectedProvince,
  residencies,
  contacts,
  onAddResidency,
  onAddResidencies,
  onUpdateResidency,
  onDeleteResidency,
  onNavigateToContacts,
}: RegistryProps) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState({
    specialty: "all",
    fundingSource: "all",
    vacancyStatus: "all",
    contactada: "all",
    encuesta: "all",
  })

  const [formData, setFormData] = useState<Partial<MedicalResidency>>({
    name: "",
    hospital: "",
    province: selectedProvince || "",
    city: "",
    specialty: "",
    subspecialty: "",
    duration: 3,
    totalPositions: 1,
    availableVacancies: 0,
    filledPositions: 1,
    vacancyStatus: "unknown",
    fundingSource: "public",
    registryStatus: "active",
    contactada: false,
    encuesta: false,
    programType: "basic",
    notes: [],
    benefits: [],
  })

  const filteredResidencies = residencies.filter((residency) => {
    const matchesSearch =
      !searchTerm ||
      residency.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      residency.hospital.toLowerCase().includes(searchTerm.toLowerCase()) ||
      residency.city.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesProvince = !selectedProvince || residency.province === selectedProvince
    const matchesSpecialty = !filters.specialty || 
      filters.specialty === "all" || 
      residency.specialty === filters.specialty
    const matchesFunding = !filters.fundingSource || 
      filters.fundingSource === "all" || 
      residency.fundingDetails === filters.fundingSource
    const matchesVacancy = !filters.vacancyStatus || 
      filters.vacancyStatus === "all" || 
      residency.vacancyStatus === filters.vacancyStatus
    const matchesContactada = !filters.contactada || 
      filters.contactada === "all" ||
      (filters.contactada === "true" && residency.contactada) ||
      (filters.contactada === "false" && !residency.contactada)
    const matchesEncuesta = !filters.encuesta || 
      filters.encuesta === "all" ||
      (filters.encuesta === "true" && residency.encuesta) ||
      (filters.encuesta === "false" && !residency.encuesta)

    return matchesSearch && matchesProvince && matchesSpecialty && matchesFunding && matchesVacancy && matchesContactada && matchesEncuesta
  })

  const handleSubmit = () => {
    if (editingId) {
      onUpdateResidency(editingId, formData)
      setEditingId(null)
    } else {
      onAddResidency(formData as Omit<MedicalResidency, "id" | "lastUpdated">)
    }
    resetForm()
  }

  const resetForm = () => {
    setFormData({
      name: "",
      hospital: "",
      province: selectedProvince || "",
      city: "",
      specialty: "",
      subspecialty: "",
      duration: 3,
      totalPositions: 1,
      availableVacancies: 0,
      filledPositions: 1,
      vacancyStatus: "unknown",
      fundingSource: "public",
      registryStatus: "active",
      contactada: false,
      encuesta: false,
      programType: "basic",
      notes: [],
      benefits: [],
    })
    setShowAddForm(false)
    setEditingId(null)
  }

  const handleEdit = (residency: MedicalResidency) => {
    setFormData(residency)
    setEditingId(residency.id)
    setShowAddForm(true)
  }

  const getStatusColor = (status: string, type: "registry" | "survey" | "vacancy") => {
    if (type === "registry") {
      switch (status) {
        case "active":
          return "bg-green-500"
        case "inactive":
          return "bg-gray-500"
        case "suspended":
          return "bg-red-500"
        case "under_review":
          return "bg-yellow-500"
        default:
          return "bg-gray-500"
      }
    } else if (type === "survey") {
      switch (status) {
        case "pending":
          return "bg-gray-500"
        case "contacted":
          return "bg-blue-500"
        case "visited":
          return "bg-yellow-500"
        case "completed":
          return "bg-green-500"
        default:
          return "bg-gray-500"
      }
    } else {
      switch (status) {
        case "open":
          return "bg-green-500"
        case "closed":
          return "bg-red-500"
        case "pending":
          return "bg-yellow-500"
        case "unknown":
          return "bg-gray-500"
        default:
          return "bg-gray-500"
      }
    }
  }

  const getResidencyContacts = (residencyId: string) => {
    return contacts.filter(contact => contact.residencyId === residencyId)
  }

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Registro de Residencias Médicas</h2>
          <p className="text-gray-600">
            {selectedProvince ? `Mostrando residencias en ${selectedProvince}` : "Todas las residencias"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowAddForm(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Nueva Residencia
          </Button>
          <Button 
            onClick={() => {
              const residenciasOficiales = migrarTodasLasResidencias()
              const residenciasConIds = residenciasOficiales.map((residencia) => ({
                ...residencia,
                id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                lastUpdated: new Date(),
              }))
              onAddResidencies(residenciasConIds)
            }} 
            variant="outline"
            className="flex items-center gap-2"
          >
            <Database className="w-4 h-4" />
            Recargar Datos Oficiales
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-2">
              <Label className="text-sm font-medium text-gray-700 mb-2 block">Buscar</Label>
              <Input
                placeholder="Buscar residencias..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">Especialidad</Label>
              <Select value={filters.specialty} onValueChange={(value) => setFilters({ ...filters, specialty: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Especialidad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {specialties.map((specialty) => (
                    <SelectItem key={specialty} value={specialty}>
                      {specialty}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">Financiamiento</Label>
              <Select
                value={filters.fundingSource}
                onValueChange={(value) => setFilters({ ...filters, fundingSource: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Financiamiento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="nacional">Nacional</SelectItem>
                  <SelectItem value="Mixto">Mixto</SelectItem>
                  <SelectItem value="sin especificar">Sin especificar</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">Vacantes</Label>
              <Select
                value={filters.vacancyStatus}
                onValueChange={(value) => setFilters({ ...filters, vacancyStatus: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Vacantes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="open">Abiertas</SelectItem>
                  <SelectItem value="closed">Cerradas</SelectItem>
                  <SelectItem value="pending">Pendientes</SelectItem>
                  <SelectItem value="unknown">Desconocido</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">Contactada</Label>
              <Select
                value={filters.contactada}
                onValueChange={(value) => setFilters({ ...filters, contactada: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Contactada" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="true">Contactada</SelectItem>
                  <SelectItem value="false">No Contactada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">Encuesta</Label>
              <Select
                value={filters.encuesta}
                onValueChange={(value) => setFilters({ ...filters, encuesta: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Encuesta" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="true">Encuestada</SelectItem>
                  <SelectItem value="false">No Encuestada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? "Editar Residencia" : "Nueva Residencia"}</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="basic" className="space-y-4">
              <TabsList>
                <TabsTrigger value="basic">Información Básica</TabsTrigger>
                <TabsTrigger value="program">Programa</TabsTrigger>
                <TabsTrigger value="vacancies">Vacantes</TabsTrigger>
                <TabsTrigger value="funding">Financiamiento</TabsTrigger>
                <TabsTrigger value="additional">Información Adicional</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nombre de la Residencia</Label>
                    <Input
                      id="name"
                      value={formData.name || ""}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="ej. Residencia de Medicina Interna"
                    />
                  </div>

                  <div>
                    <Label htmlFor="hospital">Hospital/Institución</Label>
                    <Input
                      id="hospital"
                      value={formData.hospital || ""}
                      onChange={(e) => setFormData({ ...formData, hospital: e.target.value })}
                      placeholder="ej. Hospital Italiano"
                    />
                  </div>

                  <div>
                    <Label htmlFor="province">Provincia</Label>
                    <Select
                      value={formData.province || "all"}
                      onValueChange={(value) => setFormData({ ...formData, province: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar provincia" />
                      </SelectTrigger>
                      <SelectContent>
                        {provinces.map((province) => (
                          <SelectItem key={province} value={province}>
                            {province}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="city">Ciudad</Label>
                    <Input
                      id="city"
                      value={formData.city || ""}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="ej. Buenos Aires"
                    />
                  </div>

                  <div>
                    <Label htmlFor="specialty">Especialidad</Label>
                    <Select
                      value={formData.specialty || "all"}
                      onValueChange={(value) => setFormData({ ...formData, specialty: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar especialidad" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas</SelectItem>
                        {specialties.map((specialty) => (
                          <SelectItem key={specialty} value={specialty}>
                            {specialty}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="subspecialty">Subespecialidad (opcional)</Label>
                    <Input
                      id="subspecialty"
                      value={formData.subspecialty || ""}
                      onChange={(e) => setFormData({ ...formData, subspecialty: e.target.value })}
                      placeholder="ej. Cardiología Intervencionista"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="program" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="duration">Duración (años)</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={formData.duration || 3}
                      onChange={(e) => setFormData({ ...formData, duration: Number.parseInt(e.target.value) || 3 })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="programType">Tipo de Programa</Label>
                    <Select
                      value={formData.programType || "basic"}
                      onValueChange={(value) => setFormData({ ...formData, programType: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="basic">Básico</SelectItem>
                        <SelectItem value="advanced">Avanzado</SelectItem>
                        <SelectItem value="subspecialty">Subespecialidad</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="accreditation">Acreditación (opcional)</Label>
                    <Input
                      id="accreditation"
                      value={formData.accreditation || ""}
                      onChange={(e) => setFormData({ ...formData, accreditation: e.target.value })}
                      placeholder="ej. CONAREME"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="requirements">Requisitos (opcional)</Label>
                  <Textarea
                    id="requirements"
                    value={formData.requirements || ""}
                    onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                    placeholder="Describe los requisitos para aplicar a esta residencia..."
                    rows={3}
                  />
                </div>
              </TabsContent>

              <TabsContent value="vacancies" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="totalPositions">Posiciones Totales</Label>
                    <Input
                      id="totalPositions"
                      type="number"
                      value={formData.totalPositions || 1}
                      onChange={(e) =>
                        setFormData({ ...formData, totalPositions: Number.parseInt(e.target.value) || 1 })
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="filledPositions">Posiciones Ocupadas</Label>
                    <Input
                      id="filledPositions"
                      type="number"
                      value={formData.filledPositions || 0}
                      onChange={(e) =>
                        setFormData({ ...formData, filledPositions: Number.parseInt(e.target.value) || 0 })
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="availableVacancies">Vacantes Disponibles</Label>
                    <Input
                      id="availableVacancies"
                      type="number"
                      value={formData.availableVacancies || 0}
                      onChange={(e) =>
                        setFormData({ ...formData, availableVacancies: Number.parseInt(e.target.value) || 0 })
                      }
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="vacancyStatus">Estado de Vacantes</Label>
                  <Select
                    value={formData.vacancyStatus || "unknown"}
                    onValueChange={(value) => setFormData({ ...formData, vacancyStatus: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Abiertas</SelectItem>
                      <SelectItem value="closed">Cerradas</SelectItem>
                      <SelectItem value="pending">Pendientes</SelectItem>
                      <SelectItem value="unknown">Desconocido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>

              <TabsContent value="funding" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fundingSource">Fuente de Financiamiento</Label>
                    <Select
                      value={formData.fundingSource || "public"}
                      onValueChange={(value) => setFormData({ ...formData, fundingSource: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Público</SelectItem>
                        <SelectItem value="private">Privado</SelectItem>
                        <SelectItem value="mixed">Mixto</SelectItem>
                        <SelectItem value="other">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="salary">Salario (opcional)</Label>
                    <Input
                      id="salary"
                      type="number"
                      value={formData.salary || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, salary: Number.parseInt(e.target.value) || undefined })
                      }
                      placeholder="Salario mensual en pesos"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="fundingDetails">Detalles de Financiamiento (opcional)</Label>
                  <Textarea
                    id="fundingDetails"
                    value={formData.fundingDetails || ""}
                    onChange={(e) => setFormData({ ...formData, fundingDetails: e.target.value })}
                    placeholder="Información adicional sobre el financiamiento..."
                    rows={3}
                  />
                </div>
              </TabsContent>

              <TabsContent value="additional" className="space-y-4">
                <div>
                  <Label htmlFor="description">Descripción (opcional)</Label>
                  <Textarea
                    id="description"
                    value={formData.description || ""}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descripción general del programa de residencia..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="additionalInfo">Información Adicional (opcional)</Label>
                  <Textarea
                    id="additionalInfo"
                    value={formData.additionalInfo || ""}
                    onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
                    placeholder="Cualquier información adicional relevante..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contactada">Contactada</Label>
                    <div className="flex items-center space-x-2 mt-2">
                      <Switch
                        id="contactada"
                        checked={formData.contactada || false}
                        onCheckedChange={(checked) => setFormData({ ...formData, contactada: checked })}
                      />
                      <Label htmlFor="contactada" className="text-sm">
                        {formData.contactada ? "Sí" : "No"}
                      </Label>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="encuesta">Encuesta Completada</Label>
                    <div className="flex items-center space-x-2 mt-2">
                      <Switch
                        id="encuesta"
                        checked={formData.encuesta || false}
                        onCheckedChange={(checked) => setFormData({ ...formData, encuesta: checked })}
                      />
                      <Label htmlFor="encuesta" className="text-sm">
                        {formData.encuesta ? "Sí" : "No"}
                      </Label>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleSubmit}>
                <Save className="w-4 h-4 mr-2" />
                {editingId ? "Actualizar" : "Guardar"}
              </Button>
              <Button variant="outline" onClick={resetForm}>
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Residencies List */}
      <div className="space-y-4">
        {filteredResidencies.map((residency) => (
          <Card key={residency.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold">{residency.name}</h3>
                    <Badge className={residency.contactada ? "bg-green-500" : "bg-gray-500"}>
                      {residency.contactada ? "Contactada" : "No Contactada"}
                    </Badge>
                    <Badge className={residency.encuesta ? "bg-blue-500" : "bg-yellow-500"}>
                      {residency.encuesta ? "Encuestada" : "No Encuestada"}
                    </Badge>
                    <Badge className={getStatusColor(residency.vacancyStatus, "vacancy")}>
                      {residency.vacancyStatus === 'open' ? 'Abierta' :
                       residency.vacancyStatus === 'closed' ? 'Cerrada' :
                       residency.vacancyStatus === 'pending' ? 'Pendiente' :
                       residency.vacancyStatus === 'unknown' ? 'Desconocido' : residency.vacancyStatus}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Building className="w-4 h-4" />
                      <span>{residency.hospital}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>
                        {residency.city}, {residency.province}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <GraduationCap className="w-4 h-4" />
                      <span>{residency.specialty}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>
                        {residency.availableVacancies}/{residency.totalPositions} vacantes
                      </span>
                    </div>
                  </div>

                  {residency.salary && (
                    <div className="flex items-center gap-1 text-sm text-gray-600 mt-2">
                      <DollarSign className="w-4 h-4" />
                      <span>${residency.salary.toLocaleString()}/mes</span>
                    </div>
                  )}

                  {/* Sección de Contactos */}
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-gray-700">Contactos Asociados</h4>
                      {onNavigateToContacts && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onNavigateToContacts(residency.id)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Phone className="w-4 h-4 mr-1" />
                          Ver todos los contactos
                        </Button>
                      )}
                    </div>
                    
                    {(() => {
                      const residencyContacts = getResidencyContacts(residency.id)
                      if (residencyContacts.length === 0) {
                        return (
                          <div className="text-sm text-gray-500 flex items-center gap-2">
                            <User className="w-4 h-4" />
                            <span>No hay contactos registrados</span>
                            {onNavigateToContacts && (
                              <Button
                                variant="link"
                                size="sm"
                                onClick={() => onNavigateToContacts(residency.id)}
                                className="p-0 h-auto text-blue-600 hover:text-blue-800"
                              >
                                Agregar contacto
                              </Button>
                            )}
                          </div>
                        )
                      }
                      
                      return (
                        <div className="space-y-2">
                          {residencyContacts.slice(0, 3).map((contact) => (
                            <div key={contact.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-gray-400" />
                                <div>
                                  <div className="text-sm font-medium">{contact.name}</div>
                                  <div className="text-xs text-gray-500">{contact.position}</div>
                                </div>
                              </div>
                              {onNavigateToContacts && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => onNavigateToContacts(residency.id)}
                                  className="text-blue-600 hover:text-blue-800"
                                >
                                  Ver
                                </Button>
                              )}
                            </div>
                          ))}
                          {residencyContacts.length > 3 && (
                            <div className="text-xs text-gray-500 text-center">
                              +{residencyContacts.length - 3} contactos más
                            </div>
                          )}
                        </div>
                      )
                    })()}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(residency)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => onDeleteResidency(residency.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {(residency.description || residency.requirements) && (
                <div className="border-t pt-4 space-y-2">
                  {residency.description && (
                    <div>
                      <span className="text-sm font-medium">Descripción: </span>
                      <span className="text-sm text-gray-600">{residency.description}</span>
                    </div>
                  )}
                  {residency.requirements && (
                    <div>
                      <span className="text-sm font-medium">Requisitos: </span>
                      <span className="text-sm text-gray-600">{residency.requirements}</span>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {filteredResidencies.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No se encontraron residencias con los filtros aplicados</p>
              <p className="text-sm">Intenta ajustar los criterios de búsqueda</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
