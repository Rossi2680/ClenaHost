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
}

export interface Professional {
  id: string;
  name: string;
  photoUrl: string;
  document: string;
  region: string;
  pixKey: string;
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
  estimatedPriceRange: string;
  logoColor: string;
}

export interface SupportJob {
  id: string;
  professionalId: string;
  hostId: string;
  category: string;
  propertyId: string;
  description: string;
  quotedValue: number;
  status: 'Solicitado' | 'Orçado' | 'Aceito' | 'Concluído';
  date: string;
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
  appFee: number; // 12% standard or 5% if loyalty active
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
