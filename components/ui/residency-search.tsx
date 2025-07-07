"use client"

import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Search, X, Building } from "lucide-react"
import type { MedicalResidency } from "../../types/residency"

interface ResidencySearchProps {
  residencies: MedicalResidency[]
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  className?: string
}

export default function ResidencySearch({
  residencies,
  value,
  onValueChange,
  placeholder = "Buscar residencia...",
  className = "",
}: ResidencySearchProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Filtrar residencias basado en el término de búsqueda
  const filteredResidencies = residencies.filter((residency) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      residency.name.toLowerCase().includes(searchLower) ||
      residency.hospital.toLowerCase().includes(searchLower) ||
      residency.province.toLowerCase().includes(searchLower) ||
      (residency.city && residency.city.toLowerCase().includes(searchLower))
    )
  }).slice(0, 8) // Limitar a 8 resultados para evitar desbordamiento

  // Obtener el nombre de la residencia seleccionada
  const selectedResidency = residencies.find(r => r.id === value)

  // Manejar selección de residencia
  const handleSelectResidency = (residency: MedicalResidency) => {
    onValueChange(residency.id)
    setSearchTerm("")
    setIsOpen(false)
    setSelectedIndex(-1)
  }

  // Manejar navegación con teclado
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === "Enter" || e.key === "ArrowDown") {
        setIsOpen(true)
      }
      return
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < filteredResidencies.length - 1 ? prev + 1 : prev
        )
        break
      case "ArrowUp":
        e.preventDefault()
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1)
        break
      case "Enter":
        e.preventDefault()
        if (selectedIndex >= 0 && filteredResidencies[selectedIndex]) {
          handleSelectResidency(filteredResidencies[selectedIndex])
        }
        break
      case "Escape":
        setIsOpen(false)
        setSelectedIndex(-1)
        break
    }
  }

  // Cerrar dropdown cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
        setSelectedIndex(-1)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Limpiar búsqueda cuando se cambia el valor
  useEffect(() => {
    if (!value) {
      setSearchTerm("")
    }
  }, [value])

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={selectedResidency ? `${selectedResidency.name} - ${selectedResidency.hospital}` : searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value)
            setIsOpen(true)
            setSelectedIndex(-1)
            if (!e.target.value) {
              onValueChange("")
            }
          }}
          onFocus={() => {
            if (searchTerm || !selectedResidency) {
              setIsOpen(true)
            }
          }}
          onKeyDown={handleKeyDown}
          className="pl-10 pr-10"
        />
        {selectedResidency && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            onClick={() => {
              onValueChange("")
              setSearchTerm("")
            }}
          >
            <X className="w-3 h-3" />
          </Button>
        )}
      </div>

      {isOpen && (searchTerm || !selectedResidency) && (
        <Card
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 max-h-60 overflow-y-auto shadow-lg border"
        >
          <CardContent className="p-0">
            {filteredResidencies.length > 0 ? (
              <div className="py-1">
                {filteredResidencies.map((residency, index) => (
                  <button
                    key={residency.id}
                    type="button"
                    className={`w-full text-left px-3 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none ${
                      selectedIndex === index ? "bg-gray-100" : ""
                    }`}
                    onClick={() => handleSelectResidency(residency)}
                  >
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">
                          {residency.name}
                        </div>
                        <div className="text-sm text-gray-500 truncate">
                          {residency.hospital} • {residency.province}
                          {residency.city && ` • ${residency.city}`}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="px-3 py-2 text-sm text-gray-500">
                No se encontraron residencias
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
