"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Phone, Mail, MapPin, Calendar, Users, Clock, FileText } from "lucide-react"
import type { MedicalResidency } from "../types/residency"

interface ResidencyPanelProps {
  selectedProvince: string | null
  residencies: MedicalResidency[]
  onAddResidency: (residency: Omit<MedicalResidency, "id" | "lastUpdated">) => void
  onUpdateResidency: (id: string, updates: Partial<MedicalResidency>) => void
  onAddNote: (residencyId: string, note: string, type: string) => void
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
]

export default function ResidencyPanel({
  selectedProvince,
  residencies,
  onAddResidency,
  onUpdateResidency,
  onAddNote,
}: ResidencyPanelProps) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedResidency, setSelectedResidency] = useState<string | null>(null)
  const [newNote, setNewNote] = useState("")
  const [noteType, setNoteType] = useState("general")

  const [newResidency, setNewResidency] = useState({
    name: "",
    hospital: "",
    province: selectedProvince || "",
    city: "",
    specialty: "",
    duration: 3,
    positions: 1,
    contact: {
      name: "",
      email: "",
      phone: "",
      position: "",
    },
    notes: [],
    status: "pending" as const,
    requirements: [],
    benefits: [],
  })

  const provinceResidencies = residencies.filter((r) => (selectedProvince ? r.province === selectedProvince : true))

  const handleAddResidency = () => {
    onAddResidency(newResidency)
    setNewResidency({
      name: "",
      hospital: "",
      province: selectedProvince || "",
      city: "",
      specialty: "",
      duration: 3,
      positions: 1,
      contact: { name: "", email: "", phone: "", position: "" },
      notes: [],
      status: "pending",
      requirements: [],
      benefits: [],
    })
    setShowAddForm(false)
  }

  const handleAddNote = () => {
    if (selectedResidency && newNote.trim()) {
      onAddNote(selectedResidency, newNote.trim(), noteType)
      setNewNote("")
    }
  }

  const getStatusColor = (status: string) => {
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
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Pendiente"
      case "contacted":
        return "Contactado"
      case "visited":
        return "Visitado"
      case "completed":
        return "Completado"
      default:
        return "Pendiente"
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">
          {selectedProvince ? `Residencias en ${selectedProvince}` : "Todas las Residencias"}
        </h2>
        <Button onClick={() => setShowAddForm(true)} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Agregar Residencia
        </Button>
      </div>

      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Nueva Residencia Médica</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="Nombre de la residencia"
                value={newResidency.name}
                onChange={(e) => setNewResidency({ ...newResidency, name: e.target.value })}
              />
              <Input
                placeholder="Hospital/Institución"
                value={newResidency.hospital}
                onChange={(e) => setNewResidency({ ...newResidency, hospital: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <Input
                placeholder="Ciudad"
                value={newResidency.city}
                onChange={(e) => setNewResidency({ ...newResidency, city: e.target.value })}
              />
              <Select
                value={newResidency.specialty}
                onValueChange={(value) => setNewResidency({ ...newResidency, specialty: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Especialidad" />
                </SelectTrigger>
                <SelectContent>
                  {specialties.map((specialty) => (
                    <SelectItem key={specialty} value={specialty}>
                      {specialty}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="number"
                placeholder="Duración (años)"
                value={newResidency.duration}
                onChange={(e) => setNewResidency({ ...newResidency, duration: Number.parseInt(e.target.value) || 3 })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="Contacto - Nombre"
                value={newResidency.contact.name}
                onChange={(e) =>
                  setNewResidency({
                    ...newResidency,
                    contact: { ...newResidency.contact, name: e.target.value },
                  })
                }
              />
              <Input
                placeholder="Contacto - Cargo"
                value={newResidency.contact.position}
                onChange={(e) =>
                  setNewResidency({
                    ...newResidency,
                    contact: { ...newResidency.contact, position: e.target.value },
                  })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="Email"
                type="email"
                value={newResidency.contact.email}
                onChange={(e) =>
                  setNewResidency({
                    ...newResidency,
                    contact: { ...newResidency.contact, email: e.target.value },
                  })
                }
              />
              <Input
                placeholder="Teléfono"
                value={newResidency.contact.phone}
                onChange={(e) =>
                  setNewResidency({
                    ...newResidency,
                    contact: { ...newResidency.contact, phone: e.target.value },
                  })
                }
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleAddResidency}>Guardar</Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {provinceResidencies.map((residency) => (
          <Card key={residency.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold">{residency.name}</h3>
                    <Badge className={getStatusColor(residency.status)}>{getStatusText(residency.status)}</Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {residency.hospital}, {residency.city}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {residency.specialty} - {residency.duration} años
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {residency.positions} posiciones
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(residency.lastUpdated).toLocaleDateString()}
                    </div>
                  </div>

                  {residency.contact.name && (
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        {residency.contact.phone}
                      </div>
                      <div className="flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        {residency.contact.email}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Select
                    value={residency.status}
                    onValueChange={(value) => onUpdateResidency(residency.id, { status: value as any })}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pendiente</SelectItem>
                      <SelectItem value="contacted">Contactado</SelectItem>
                      <SelectItem value="visited">Visitado</SelectItem>
                      <SelectItem value="completed">Completado</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedResidency(selectedResidency === residency.id ? null : residency.id)}
                  >
                    <FileText className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {selectedResidency === residency.id && (
                <div className="mt-4 pt-4 border-t">
                  <Tabs defaultValue="notes">
                    <TabsList>
                      <TabsTrigger value="notes">Notas</TabsTrigger>
                      <TabsTrigger value="details">Detalles</TabsTrigger>
                    </TabsList>

                    <TabsContent value="notes" className="space-y-3">
                      <div className="flex gap-2">
                        <Select value={noteType} onValueChange={setNoteType}>
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="general">General</SelectItem>
                            <SelectItem value="contact">Contacto</SelectItem>
                            <SelectItem value="visit">Visita</SelectItem>
                            <SelectItem value="requirement">Requisito</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          placeholder="Agregar nota..."
                          value={newNote}
                          onChange={(e) => setNewNote(e.target.value)}
                          onKeyPress={(e) => e.key === "Enter" && handleAddNote()}
                        />
                        <Button onClick={handleAddNote} size="sm">
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {residency.notes.map((note, index) => (
                          <div key={index} className="p-2 bg-gray-50 rounded text-sm">
                            {note}
                          </div>
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="details">
                      <div className="space-y-2 text-sm">
                        <div>
                          <strong>Contacto:</strong> {residency.contact.name} - {residency.contact.position}
                        </div>
                        <div>
                          <strong>Email:</strong> {residency.contact.email}
                        </div>
                        <div>
                          <strong>Teléfono:</strong> {residency.contact.phone}
                        </div>
                        <div>
                          <strong>Última actualización:</strong> {new Date(residency.lastUpdated).toLocaleString()}
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {provinceResidencies.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No hay residencias registradas {selectedProvince ? `en ${selectedProvince}` : ""}</p>
            <p className="text-sm">Haz clic en "Agregar Residencia" para comenzar</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
