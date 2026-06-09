/**
 * Types and interfaces for the CleanHost App
 */

export enum CleaningType {
  STANDARD = 'Padrão',
  EXPRESS = 'Expressa (Urgente)',
  POST_CONSTRUCTION = 'Pós-Obra',
  LAUNDRY = 'Lavanderia'
}

export enum RequestStatus {
  PENDING = 'Pendente',
  ASSIGNED = 'Agendado',
  EN_ROUTE = 'A caminho',
  ARRIVED = 'No imóvel',
  IN_PROGRESS = 'Iniciando / Em andamento',
  FINALIZING = 'Finalizando',
  COMPLETED = 'Concluído'
}

export interface Property {
  id: string;
  name: string;
  address: string;
  city: string;
  imageUrl: string;
  rooms: number;
  bathrooms: number;
  bairro?: string;
  cep?: string;
  estado?: string;
  ownerId?: string;
  ownerEmail?: string;
}

export interface Professional {
  id: string;
  name: string;
  photoUrl: string;
  document: string;
  region: string;
  pixKey: string;
  bank?: string;
  score: number; // CleanHost Score (0-100)
  rating: number; // 1-5 stars
  totalServices: number; // For loyalty system
  availability: string[]; // e.g. ['Manhã', 'Tarde']
  priceStandard: number;
  priceExpress: number;
  distanceKm: number;
  isSuperCleaner: boolean;
  isApproved: boolean;
}

export interface SupportProfessional {
  id: string;
  name: string;
  category: 'Eletricista' | 'Encanador' | 'Chaveiro' | 'Pedreiro' | 'Pintor' | 'Manutenção Geral';
  phone: string;
  region: string;
  availability: string;
  rating: number;
  completedJobs: number;
  pixKey: string;
  bank?: string;
  estimatedPriceRange: string;
  logoColor: string;
  photoUrl?: string;
  status?: 'Disponível' | 'Ocupado';
  joinedDate?: string;
  biography?: string;
  reviews?: {
    id: string;
    raterName: string;
    rating: number;
    comment: string;
    date: string;
  }[];
  whatsapp?: string;
  email?: string;
  specialties?: string;
  yearsOfExperience?: number;
  city?: string;
  state?: string;
  pixHolderName?: string;
  notificationPrefs?: {
    platform: boolean;
    whatsapp: boolean;
    email: boolean;
    sms: boolean;
  };
}

export interface SupportNotification {
  id: string;
  jobId: string;
  professionalId: string;
  title: string;
  message: string;
  sentChannels: {
    platform: boolean;
    whatsapp: boolean;
    email: boolean;
    sms: boolean;
  };
  status: 'sent' | 'pending' | 'failed';
  createdAt: string;
  read: boolean;
}

export interface SupportJob {
  id: string;
  professionalId: string;
  hostId: string;
  category: string;
  propertyId: string;
  description: string;
  quotedValue: number;
  status: 'Solicitado' | 'Orçado' | 'Aceito' | 'Concluído' | 'Pendente' | 'Em andamento' | 'Cancelado';
  date: string;
  time?: string;
  notes?: string;
  propertyName?: string;
  propertyAddress?: string;
  financialStatus?: string;
  transferInfo?: {
    transferDate: string;
    transferTime: string;
    adminResponsible: string;
  };
  appFee?: number;
  netValue?: number;
  review?: {
    rating: number;
    comment: string;
    date: string;
  };
}

export interface CleaningRequest {
  id: string;
  propertyId: string;
  propertyName: string;
  propertyAddress: string;
  type: CleaningType;
  dateTime: string;
  observations: string;
  status: RequestStatus;
  professionalId?: string;
  professionalName?: string;
  professionalPhoto?: string;
  price: number;
  appFee: number; // Configured standard/promotional fee, or 0% during loyalty 11th service
  netValue: number;
  beforePhotos: string[];
  afterPhotos: string[];
  checklist: {
    bathroom: boolean;
    kitchen: boolean;
    bedroom: boolean;
    floor: boolean;
    towels: boolean;
    garbage: boolean;
    replenishment: boolean;
  };
  review?: {
    quality: number;
    punctuality: number;
    organization: number;
    communication: number;
    comment: string;
    date: string;
  };
  financialStatus?: string;
  transferInfo?: {
    transferDate: string;
    transferTime: string;
    adminResponsible: string;
  };
}

export type UserRole = 'HOST' | 'CLEANER' | 'ADMIN' | 'SUPPORT' | 'CLIENTE';

export interface FinanceSettings {
  pixKey: string;
  standardTax: number;
  loyaltyTax: number;
  recipientAccount: string;
  autoRepassActive: boolean;
}

export interface FinanceLog {
  id: string;
  dateTime: string;
  user: string;
  action: string;
  value: number;
  taxApplied: number;
  recipient: string;
}
