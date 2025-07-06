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
import { Switch } from "@/components/ui/switch"
import { Plus, Save, Edit, Trash2, Phone, Mail, User, MessageSquare, Star, Clock, Building, Download, FileText, MessageCircle } from "lucide-react"
import type { Contact, ContactInteraction, MedicalResidency } from "../types/residency"
// @ts-ignore
import jsPDF from "jspdf"

interface ContactManagementProps {
  residencies: MedicalResidency[]
  contacts: Contact[]
  onAddContact: (contact: Omit<Contact, "id" | "createdAt" | "updatedAt">) => void
  onUpdateContact: (id: string, updates: Partial<Contact>) => void
  onDeleteContact: (id: string) => void
  onAddInteraction: (contactId: string, interaction: Omit<ContactInteraction, "id">) => void
}

export default function ContactManagement({
  residencies,
  contacts,
  onAddContact,
  onUpdateContact,
  onDeleteContact,
  onAddInteraction,
}: ContactManagementProps) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [selectedContact, setSelectedContact] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterRole, setFilterRole] = useState("all")

  const [formData, setFormData] = useState<Partial<Contact>>({
    name: "",
    position: "",
    department: "",
    email: "",
    phone: "",
    alternativePhone: "",
    title: "",
    role: "other",
    isPrimaryContact: false,
    preferredContactMethod: "email",
    notes: [],
    contactHistory: [],
  })

  const [newInteraction, setNewInteraction] = useState({
    type: "call" as const,
    outcome: "successful" as const,
    notes: "",
    followUpRequired: false,
    followUpDate: undefined as Date | undefined,
  })

  const filteredContacts = contacts.filter((contact) => {
    const matchesSearch =
      !searchTerm ||
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesRole = filterRole === "all" || contact.role === filterRole

    return matchesSearch && matchesRole
  })

  const handleSubmit = () => {
    if (editingId) {
      onUpdateContact(editingId, formData)
      setEditingId(null)
    } else {
      onAddContact(formData as Omit<Contact, "id" | "createdAt" | "updatedAt">)
    }
    resetForm()
  }

  const resetForm = () => {
    setFormData({
      name: "",
      position: "",
      department: "",
      email: "",
      phone: "",
      alternativePhone: "",
      title: "",
      role: "other",
      isPrimaryContact: false,
      preferredContactMethod: "email",
      notes: [],
      contactHistory: [],
    })
    setShowAddForm(false)
    setEditingId(null)
  }

  const handleEdit = (contact: Contact) => {
    setFormData(contact)
    setEditingId(contact.id)
    setShowAddForm(true)
  }

  const handleAddInteraction = () => {
    if (selectedContact && newInteraction.notes.trim()) {
      onAddInteraction(selectedContact, {
        ...newInteraction,
        date: new Date(),
      })
      setNewInteraction({
        type: "call",
        outcome: "successful",
        notes: "",
        followUpRequired: false,
        followUpDate: undefined,
      })
    }
  }

  const getResidencyName = (residencyId: string) => {
    const residency = residencies.find((r) => r.id === residencyId)
    return residency ? `${residency.name} - ${residency.hospital}` : "Residencia no encontrada"
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "director":
        return "bg-purple-500"
      case "coordinator":
        return "bg-blue-500"
      case "administrator":
        return "bg-green-500"
      case "secretary":
        return "bg-yellow-500"
      default:
        return "bg-gray-500"
    }
  }

  const getRoleText = (role: string) => {
    switch (role) {
      case "director":
        return "Director"
      case "coordinator":
        return "Coordinador"
      case "administrator":
        return "Administrador"
      case "secretary":
        return "Secretario"
      default:
        return "Otro"
    }
  }

  // Funciones de exportación
  const handleExportContactsPDF = () => {
    try {
      const doc = new jsPDF()
      
      // Título del reporte
      doc.setFontSize(20)
      doc.text("Reporte de Contactos - Residencias Médicas", 20, 20)
      
      // Información del reporte
      doc.setFontSize(12)
      doc.text(`Fecha de generación: ${new Date().toLocaleDateString('es-AR')}`, 20, 35)
      doc.text(`Total de contactos: ${contacts.length}`, 20, 45)
      
      // Estadísticas adicionales
      const primaryContacts = contacts.filter(c => c.isPrimaryContact).length
      const contactsByRole = contacts.reduce((acc, contact) => {
        acc[contact.role] = (acc[contact.role] || 0) + 1
        return acc
      }, {} as Record<string, number>)
      
      doc.text(`Contactos principales: ${primaryContacts}`, 20, 55)
      doc.text(`Contactos con interacciones: ${contacts.filter(c => c.contactHistory.length > 0).length}`, 20, 65)
      
      let yPosition = 80
      const pageHeight = 280
      let pageNumber = 1
      
      contacts.forEach((contact, index) => {
        // Verificar si necesitamos una nueva página
        if (yPosition > pageHeight) {
          doc.addPage()
          pageNumber++
          yPosition = 20
        }
        
        // Información básica del contacto
        doc.setFontSize(14)
        doc.setFont('helvetica', 'bold')
        doc.text(`${index + 1}. ${contact.name}`, 20, yPosition)
        
        yPosition += 8
        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')
        
        // Detalles del contacto
        doc.text(`Cargo: ${contact.position}`, 25, yPosition)
        yPosition += 5
        doc.text(`Email: ${contact.email}`, 25, yPosition)
        yPosition += 5
        doc.text(`Teléfono: ${contact.phone}`, 25, yPosition)
        yPosition += 5
        doc.text(`Rol: ${getRoleText(contact.role)}`, 25, yPosition)
        yPosition += 5
        doc.text(`Residencia: ${getResidencyName(contact.residencyId)}`, 25, yPosition)
        
        if (contact.department) {
          yPosition += 5
          doc.text(`Departamento: ${contact.department}`, 25, yPosition)
        }
        
        if (contact.isPrimaryContact) {
          yPosition += 5
          doc.text(`Contacto Principal: Sí`, 25, yPosition)
        }
        
        if (contact.lastContactDate) {
          yPosition += 5
          doc.text(`Último contacto: ${new Date(contact.lastContactDate).toLocaleDateString('es-AR')}`, 25, yPosition)
        }
        
        // Historial de contactos (últimos 3)
        if (contact.contactHistory.length > 0) {
          yPosition += 8
          doc.setFontSize(10)
          doc.setFont('helvetica', 'bold')
          doc.text("Historial de Contactos:", 25, yPosition)
          yPosition += 5
          doc.setFontSize(8)
          doc.setFont('helvetica', 'normal')
          
          const recentHistory = contact.contactHistory.slice(-3)
          recentHistory.forEach((interaction) => {
            doc.text(`• ${new Date(interaction.date).toLocaleDateString('es-AR')} - ${interaction.type} - ${interaction.outcome}`, 30, yPosition)
            yPosition += 4
            if (interaction.notes) {
              doc.text(`  Nota: ${interaction.notes}`, 35, yPosition)
              yPosition += 4
            }
          })
        }
        
        yPosition += 10
      })
      
      // Número de página
      doc.setFontSize(8)
      doc.text(`Página ${pageNumber}`, 20, 290)
      
      doc.save("reporte-contactos-residencias.pdf")
    } catch (error) {
      console.error("Error al generar PDF:", error)
      alert("Error al generar el PDF. Por favor, inténtalo de nuevo.")
    }
  }

  const handleExportContactsCSV = () => {
    try {
      // Crear encabezados del CSV
      const headers = [
        "Nombre",
        "Cargo",
        "Departamento",
        "Email",
        "Teléfono",
        "Teléfono Alternativo",
        "Rol",
        "Contacto Principal",
        "Residencia Asociada",
        "Dirección",
        "Método Preferido",
        "Mejor Horario",
        "Último Contacto",
        "Total Interacciones",
        "Fecha de Creación",
        "Última Actualización"
      ]
      
      // Crear datos del CSV
      const csvData = contacts.map(contact => [
        contact.name,
        contact.position,
        contact.department || "",
        contact.email,
        contact.phone,
        contact.alternativePhone || "",
        getRoleText(contact.role),
        contact.isPrimaryContact ? "Sí" : "No",
        getResidencyName(contact.residencyId),
        contact.address || "",
        contact.preferredContactMethod || "",
        contact.bestTimeToContact || "",
        contact.lastContactDate ? new Date(contact.lastContactDate).toLocaleDateString('es-AR') : "",
        contact.contactHistory.length.toString(),
        new Date(contact.createdAt).toLocaleDateString('es-AR'),
        new Date(contact.updatedAt).toLocaleDateString('es-AR')
      ])
      
      // Combinar encabezados y datos
      const csvContent = [headers, ...csvData]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n')
      
      // Crear y descargar el archivo
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `contactos-residencias-${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error("Error al generar CSV:", error)
      alert("Error al generar el CSV. Por favor, inténtalo de nuevo.")
    }
  }

  // Función para exportar contactos filtrados
  const handleExportFilteredContacts = () => {
    try {
      const doc = new jsPDF()
      
      // Título del reporte
      doc.setFontSize(20)
      doc.text("Reporte de Contactos Filtrados", 20, 20)
      
      // Información del reporte
      doc.setFontSize(12)
      doc.text(`Fecha de generación: ${new Date().toLocaleDateString('es-AR')}`, 20, 35)
      doc.text(`Total de contactos filtrados: ${filteredContacts.length}`, 20, 45)
      
      if (searchTerm) {
        doc.text(`Búsqueda: "${searchTerm}"`, 20, 55)
      }
      
      if (filterRole !== "all") {
        doc.text(`Filtro por rol: ${getRoleText(filterRole)}`, 20, 65)
      }
      
      let yPosition = 80
      const pageHeight = 280
      let pageNumber = 1
      
      filteredContacts.forEach((contact, index) => {
        // Verificar si necesitamos una nueva página
        if (yPosition > pageHeight) {
          doc.addPage()
          pageNumber++
          yPosition = 20
        }
        
        // Información básica del contacto
        doc.setFontSize(14)
        doc.setFont('helvetica', 'bold')
        doc.text(`${index + 1}. ${contact.name}`, 20, yPosition)
        
        yPosition += 8
        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')
        
        // Detalles del contacto
        doc.text(`Cargo: ${contact.position}`, 25, yPosition)
        yPosition += 5
        doc.text(`Email: ${contact.email}`, 25, yPosition)
        yPosition += 5
        doc.text(`Teléfono: ${contact.phone}`, 25, yPosition)
        yPosition += 5
        doc.text(`Rol: ${getRoleText(contact.role)}`, 25, yPosition)
        yPosition += 5
        doc.text(`Residencia: ${getResidencyName(contact.residencyId)}`, 25, yPosition)
        
        yPosition += 10
      })
      
      // Número de página
      doc.setFontSize(8)
      doc.text(`Página ${pageNumber}`, 20, 290)
      
      doc.save("contactos-filtrados.pdf")
    } catch (error) {
      console.error("Error al generar PDF filtrado:", error)
      alert("Error al generar el PDF filtrado. Por favor, inténtalo de nuevo.")
    }
  }

  // Estadísticas de contactos
  const getContactStats = () => {
    const totalContacts = contacts.length
    const primaryContacts = contacts.filter(c => c.isPrimaryContact).length
    const contactsWithInteractions = contacts.filter(c => c.contactHistory.length > 0).length
    const totalInteractions = contacts.reduce((sum, c) => sum + c.contactHistory.length, 0)
    
    const contactsByRole = contacts.reduce((acc, contact) => {
      acc[contact.role] = (acc[contact.role] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    return {
      totalContacts,
      primaryContacts,
      contactsWithInteractions,
      totalInteractions,
      contactsByRole
    }
  }

  const stats = getContactStats()

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestión de Contactos</h2>
          <p className="text-gray-600">Administra los contactos de las residencias médicas</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleExportContactsPDF}
            className="flex items-center gap-2"
            disabled={contacts.length === 0}
          >
            <FileText className="w-4 h-4" />
            Exportar PDF
          </Button>
          <Button 
            variant="outline" 
            onClick={handleExportContactsCSV}
            className="flex items-center gap-2"
            disabled={contacts.length === 0}
          >
            <Download className="w-4 h-4" />
            Exportar CSV
          </Button>
          <Button onClick={() => setShowAddForm(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Nuevo Contacto
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="Buscar contactos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="md:col-span-2"
            />

            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los roles</SelectItem>
                <SelectItem value="director">Director</SelectItem>
                <SelectItem value="coordinator">Coordinador</SelectItem>
                <SelectItem value="administrator">Administrador</SelectItem>
                <SelectItem value="secretary">Secretario</SelectItem>
                <SelectItem value="other">Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? "Editar Contacto" : "Nuevo Contacto"}</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="basic" className="space-y-4">
              <TabsList>
                <TabsTrigger value="basic">Información Básica</TabsTrigger>
                <TabsTrigger value="professional">Información Profesional</TabsTrigger>
                <TabsTrigger value="preferences">Preferencias de Contacto</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nombre Completo *</Label>
                    <Input
                      id="name"
                      value={formData.name || ""}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="ej. Dr. Juan Pérez"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email || ""}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="ej. juan.perez@hospital.com"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Teléfono *</Label>
                    <Input
                      id="phone"
                      value={formData.phone || ""}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="ej. +54 11 1234-5678"
                    />
                  </div>

                  <div>
                    <Label htmlFor="alternativePhone">Teléfono Alternativo</Label>
                    <Input
                      id="alternativePhone"
                      value={formData.alternativePhone || ""}
                      onChange={(e) => setFormData({ ...formData, alternativePhone: e.target.value })}
                      placeholder="ej. +54 11 8765-4321"
                    />
                  </div>

                  <div>
                    <Label htmlFor="residencyId">Residencia Asociada *</Label>
                    <Select
                      value={formData.residencyId || ""}
                      onValueChange={(value) => setFormData({ ...formData, residencyId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar residencia" />
                      </SelectTrigger>
                      <SelectContent>
                        {residencies.map((residency) => (
                          <SelectItem key={residency.id} value={residency.id}>
                            {residency.name} - {residency.hospital}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="professional" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="position">Cargo/Posición *</Label>
                    <Input
                      id="position"
                      value={formData.position || ""}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                      placeholder="ej. Jefe de Residentes"
                    />
                  </div>

                  <div>
                    <Label htmlFor="department">Departamento</Label>
                    <Input
                      id="department"
                      value={formData.department || ""}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      placeholder="ej. Medicina Interna"
                    />
                  </div>

                  <div>
                    <Label htmlFor="title">Título</Label>
                    <Input
                      id="title"
                      value={formData.title || ""}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="ej. Dr., Dra., Lic."
                    />
                  </div>

                  <div>
                    <Label htmlFor="role">Rol en el Programa</Label>
                    <Select
                      value={formData.role || "other"}
                      onValueChange={(value) => setFormData({ ...formData, role: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="director">Director</SelectItem>
                        <SelectItem value="coordinator">Coordinador</SelectItem>
                        <SelectItem value="administrator">Administrador</SelectItem>
                        <SelectItem value="secretary">Secretario</SelectItem>
                        <SelectItem value="other">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isPrimaryContact"
                      checked={formData.isPrimaryContact || false}
                      onCheckedChange={(checked) => setFormData({ ...formData, isPrimaryContact: checked })}
                    />
                    <Label htmlFor="isPrimaryContact">Contacto Principal</Label>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="preferences" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="preferredContactMethod">Método Preferido de Contacto</Label>
                    <Select
                      value={formData.preferredContactMethod || "email"}
                      onValueChange={(value) => setFormData({ ...formData, preferredContactMethod: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="phone">Teléfono</SelectItem>
                        <SelectItem value="in_person">En Persona</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="bestTimeToContact">Mejor Horario para Contactar</Label>
                    <Input
                      id="bestTimeToContact"
                      value={formData.bestTimeToContact || ""}
                      onChange={(e) => setFormData({ ...formData, bestTimeToContact: e.target.value })}
                      placeholder="ej. Lunes a Viernes 9-17hs"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="address">Dirección</Label>
                  <Textarea
                    id="address"
                    value={formData.address || ""}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Dirección completa del contacto..."
                    rows={2}
                  />
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

      {/* Contacts List */}
      <div className="space-y-4">
        {filteredContacts.map((contact) => (
          <Card key={contact.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold">{contact.name}</h3>
                    {contact.isPrimaryContact && (
                      <Badge className="bg-yellow-500">
                        <Star className="w-3 h-3 mr-1" />
                        Principal
                      </Badge>
                    )}
                    <Badge className={getRoleColor(contact.role)}>{getRoleText(contact.role)}</Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-1">
                      <Building className="w-4 h-4" />
                      <span>{getResidencyName(contact.residencyId)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      <span>{contact.position}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      <span>{contact.email}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      <span>{contact.phone}</span>
                    </div>
                  </div>

                  {contact.lastContactDate && (
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span>Último contacto: {new Date(contact.lastContactDate).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedContact(selectedContact === contact.id ? null : contact.id)}
                  >
                    <MessageSquare className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleEdit(contact)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => onDeleteContact(contact.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                  {/* Botón de WhatsApp */}
                  <a
                    href={`https://wa.me/${contact.phone.replace(/[^\d]/g, "")}?text=Hola%20${encodeURIComponent(contact.name)}!%20Te%20contacto%20por%20la%20residencia%20m%C3%A9dica.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Enviar WhatsApp"
                  >
                    <Button variant="outline" size="sm" className="!p-2 text-green-600 border-green-400 hover:bg-green-50">
                      <MessageCircle className="w-5 h-5" />
                    </Button>
                  </a>
                </div>
              </div>

              {selectedContact === contact.id && (
                <div className="border-t pt-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                    <Select
                      value={newInteraction.type}
                      onValueChange={(value) => setNewInteraction({ ...newInteraction, type: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="call">Llamada</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="visit">Visita</SelectItem>
                        <SelectItem value="meeting">Reunión</SelectItem>
                        <SelectItem value="other">Otro</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select
                      value={newInteraction.outcome}
                      onValueChange={(value) => setNewInteraction({ ...newInteraction, outcome: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="successful">Exitoso</SelectItem>
                        <SelectItem value="no_response">Sin Respuesta</SelectItem>
                        <SelectItem value="scheduled_followup">Seguimiento Programado</SelectItem>
                        <SelectItem value="information_gathered">Información Recopilada</SelectItem>
                      </SelectContent>
                    </Select>

                    <Input
                      placeholder="Notas de la interacción..."
                      value={newInteraction.notes}
                      onChange={(e) => setNewInteraction({ ...newInteraction, notes: e.target.value })}
                    />

                    <Button onClick={handleAddInteraction} size="sm">
                      <Plus className="w-4 h-4 mr-1" />
                      Agregar
                    </Button>
                  </div>

                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    <h4 className="font-medium text-sm">Historial de Contacto:</h4>
                    {contact.contactHistory.map((interaction, index) => (
                      <div key={index} className="p-2 bg-gray-50 rounded text-sm">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium">
                            {interaction.type} - {interaction.outcome}
                          </span>
                          <span className="text-gray-500">{new Date(interaction.date).toLocaleDateString()}</span>
                        </div>
                        <p>{interaction.notes}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {filteredContacts.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center text-gray-500">
              <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No se encontraron contactos</p>
              <p className="text-sm">Agrega contactos para comenzar a gestionar la información</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
