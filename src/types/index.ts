// Tipos de dados principais
export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Session {
  id: string;
  clientId: string;
  clientName: string;
  type: SessionType;
  date: string;
  time: string;
  duration: number;
  location: string;
  value: number;
  status: SessionStatus;
  paymentStatus: PaymentStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Enums para melhor tipagem
export type SessionType = 
  | 'newborn'
  | 'gestante'
  | 'casamento'
  | 'corporativo'
  | 'familia'
  | 'evento'
  | 'produto';

export type SessionStatus = 
  | 'agendado'
  | 'confirmado'
  | 'realizado'
  | 'cancelado';

export type PaymentStatus = 
  | 'pendente'
  | 'sinal'
  | 'pago';

// Formulários
export interface ClientFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  notes: string;
}

export interface SessionFormData {
  clientId: string;
  type: SessionType | '';
  date: string;
  time: string;
  duration: number;
  location: string;
  value: number;
  notes: string;
}

// Dashboard
export interface DashboardStats {
  totalClients: number;
  sessionsThisMonth: number;
  revenueThisMonth: number;
  pendingPayments: number;
}