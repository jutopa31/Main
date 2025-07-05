export interface MedicalResidency {
  id: string
  // Basic Information
  name: string
  hospital: string
  province: string
  city: string
  specialty: string
  subspecialty?: string

  // Program Details
  duration: number // years
  currentYear?: number
  accreditation?: string
  programType?: "basic" | "advanced" | "subspecialty"

  // Vacancy Information
  totalPositions: number
  availableVacancies: number
  filledPositions: number
  vacancyStatus: "open" | "closed" | "pending" | "unknown"
  applicationDeadline?: Date

  // Funding & Financial
  fundingSource: "public" | "private" | "mixed" | "other"
  fundingDetails?: string
  salary?: number
  benefits?: string[]

  // Status & Progress
  registryStatus: "active" | "inactive" | "suspended" | "under_review"
  surveyStatus: "pending" | "contacted" | "visited" | "completed"
  lastUpdated: Date

  // Free-text fields for flexibility
  description?: string
  requirements?: string
  additionalInfo?: string
  notes: string[]

  // Metadata
  createdBy?: string
  verificationStatus?: "verified" | "pending" | "unverified"
  dataSource?: string
}

export interface Contact {
  id: string
  residencyId: string
  // Personal Information
  name: string
  position: string
  department?: string

  // Contact Details
  email: string
  phone: string
  alternativePhone?: string
  address?: string

  // Professional Information
  title?: string
  specialization?: string
  yearsInPosition?: number

  // Contact Preferences
  preferredContactMethod?: "email" | "phone" | "in_person"
  bestTimeToContact?: string

  // Relationship to Program
  role: "director" | "coordinator" | "administrator" | "secretary" | "other"
  isPrimaryContact: boolean

  // Notes and History
  notes: string[]
  lastContactDate?: Date
  contactHistory: ContactInteraction[]

  createdAt: Date
  updatedAt: Date
}

export interface ContactInteraction {
  id: string
  date: Date
  type: "call" | "email" | "visit" | "meeting" | "other"
  outcome: "successful" | "no_response" | "scheduled_followup" | "information_gathered"
  notes: string
  followUpRequired: boolean
  followUpDate?: Date
}

export interface RegistryFilters {
  provinces: string[]
  specialties: string[]
  fundingSources: string[]
  vacancyStatus: string[]
  registryStatus: string[]
  surveyStatus: string[]
  hasVacancies?: boolean
  verificationStatus: string[]
}

export interface RegistryReport {
  id: string
  title: string
  filters: RegistryFilters
  summary: {
    totalResidencies: number
    activeResidencies: number
    totalVacancies: number
    averageSalary?: number
    byProvince: Record<string, number>
    bySpecialty: Record<string, number>
    byFunding: Record<string, number>
  }
  generatedAt: Date
  generatedBy?: string
}
