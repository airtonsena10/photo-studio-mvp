import { Session, DashboardStats, Client } from '@/types';

// Formatação de valores
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

// Formatação de datas
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('pt-BR');
};

export const formatDateSafe = (dateString: string | undefined): string => {
  if (!dateString) return 'Data não informada';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Data inválida';
    }
    return date.toLocaleDateString('pt-BR');
  } catch {
    return 'Data inválida';
  }
};

export const formatDateTime = (dateString: string, timeString: string): string => {
  return `${formatDateSafe(dateString)} às ${timeString}`;
};

// Validações
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
  return phoneRegex.test(phone) || phone.length >= 10;
};

// Cálculos do Dashboard
export const calculateDashboardStats = (
  clients: Client[],
  sessions: Session[]
): DashboardStats => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const sessionsThisMonth = sessions.filter(session => {
    const sessionDate = new Date(session.date);
    return sessionDate.getMonth() === currentMonth && 
           sessionDate.getFullYear() === currentYear;
  });

  const revenueThisMonth = sessionsThisMonth
    .filter(session => session.paymentStatus === 'pago')
    .reduce((total, session) => total + session.value, 0);

  const pendingPayments = sessions
    .filter(session => session.paymentStatus === 'pendente')
    .reduce((total, session) => total + session.value, 0);

  return {
    totalClients: clients.length,
    sessionsThisMonth: sessionsThisMonth.length,
    revenueThisMonth,
    pendingPayments
  };
};

// Filtros e ordenação
export const getUpcomingSessions = (sessions: Session[], limit = 5): Session[] => {
  const now = new Date();
  return sessions
    .filter(session => {
      const sessionDate = new Date(session.date);
      return sessionDate >= now && session.status !== 'cancelado';
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, limit);
};

// Geração de IDs únicos
export const generateId = (): string => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};

// Labels para exibição
export const getSessionTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    newborn: 'Newborn',
    gestante: 'Gestante',
    casamento: 'Casamento',
    corporativo: 'Corporativo',
    familia: 'Família',
    evento: 'Evento',
    produto: 'Produto'
  };
  return labels[type] || type;
};

export const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    agendado: 'Agendado',
    confirmado: 'Confirmado',
    realizado: 'Realizado',
    cancelado: 'Cancelado'
  };
  return labels[status] || status;
};

export const getPaymentStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    pendente: 'Pendente',
    sinal: '50% Pago',
    pago: 'Pago Completo'
  };
  return labels[status] || status;
};