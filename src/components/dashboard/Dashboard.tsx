import React from 'react';
import { Calendar, Users, Camera, DollarSign, TrendingUp, Clock, MapPin } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Client, Session } from '@/types';
import { calculateDashboardStats, getUpcomingSessions, formatCurrency, formatDateTime } from '@/utils';
import './dashboard-animations.css';

interface DashboardProps {
  clients: Client[];
  sessions: Session[];
  onNavigateToClients?: () => void;
  onNavigateToSessions?: () => void;
  onShowReports?: () => void;
}

export default function Dashboard({ clients, sessions, onNavigateToClients, onNavigateToSessions, onShowReports }: DashboardProps) {
  const stats = calculateDashboardStats(clients, sessions);
  const upcomingSessions = getUpcomingSessions(sessions);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'confirmado':
        return 'default';
      case 'realizado':
        return 'secondary';
      case 'cancelado':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getPaymentStatusVariant = (status: string) => {
    switch (status) {
      case 'pago':
        return 'default';
      case 'sinal':
        return 'secondary';
      case 'pendente':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-8 animate-fade-in-up min-h-screen p-6 rounded-lg">
     

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden gradient-card-hover border border-slate-700/50 bg-slate-900/50 backdrop-blur-sm">
          <div className="absolute inset-0 gradient-bg-blue" />
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Total de Clientes</CardTitle>
            <div className="p-2 rounded-full bg-blue-500/20 hover:bg-blue-500/30 transition-colors">
              <Users className="h-4 w-4 text-blue-400" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold text-white">{stats.totalClients}</div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3 text-green-400" />
              <p className="text-xs text-slate-400">
                {stats.totalClients === 1 ? 'cliente cadastrado' : 'clientes ativos'}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden gradient-card-hover border border-slate-700/50 bg-slate-900/50 backdrop-blur-sm">
          <div className="absolute inset-0 gradient-bg-purple" />
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Sessões Este Mês</CardTitle>
            <div className="p-2 rounded-full bg-purple-500/20 hover:bg-purple-500/30 transition-colors">
              <Camera className="h-4 w-4 text-purple-400" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold text-white">{stats.sessionsThisMonth}</div>
            <div className="flex items-center gap-1 mt-1">
              <Calendar className="h-3 w-3 text-purple-400" />
              <p className="text-xs text-slate-400">
                sessões realizadas
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden gradient-card-hover border border-slate-700/50 bg-slate-900/50 backdrop-blur-sm">
          <div className="absolute inset-0 gradient-bg-green" />
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Faturamento Este Mês</CardTitle>
            <div className="p-2 rounded-full bg-green-500/20 hover:bg-green-500/30 transition-colors">
              <DollarSign className="h-4 w-4 text-green-400" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold text-green-400">
              {formatCurrency(stats.revenueThisMonth)}
            </div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3 text-green-400" />
              <p className="text-xs text-slate-400">
                receita confirmada
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden gradient-card-hover border border-slate-700/50 bg-slate-800/50 backdrop-blur-sm">
          <div className="absolute inset-0 gradient-bg-orange" />
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Pagamentos Pendentes</CardTitle>
            <div className="p-2 rounded-full bg-orange-500/20 hover:bg-orange-500/30 transition-colors">
              <Clock className="h-4 w-4 text-red-600" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold text-orange-600">
              {formatCurrency(stats.pendingPayments)}
            </div>
            <div className="flex items-center gap-1 mt-1">
              <Clock className="h-3 w-3 text-red-600" />
              <p className="text-xs text-slate-400">
                aguardando pagamento
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Próximas Sessões  */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Card className="card-hover border border-slate-700/50 bg-slate-900/50 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl text-white">Próximas Sessões</CardTitle>
                  <CardDescription className="mt-1 text-slate-400">
                    Sessões agendadas para os próximos dias
                  </CardDescription>
                </div>
                <Calendar className="h-5 w-5 text-slate-400" />
              </div>
            </CardHeader>
            <CardContent>
              {upcomingSessions.length === 0 ? (
                <div className="text-center py-12">
                  <div className="mx-auto w-24 h-24 rounded-full bg-slate-800/50 flex items-center justify-center mb-4 animate-pulse-soft">
                    <Calendar className="h-8 w-8 text-slate-400" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2 text-white">Nenhuma sessão agendada</h3>
                  <p className="text-slate-400 mb-4">
                    Que tal agendar uma nova sessão para começar?
                  </p>
                  <div className="w-16 h-1 bg-gradient-to-r from-blue-500/20 to-blue-500/60 rounded mx-auto shimmer"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingSessions.map((session, index) => (
                    <div 
                      key={session.id} 
                      className="group relative p-5 border border-slate-700/30 rounded-xl card-hover bg-slate-800/30 hover:bg-slate-800/50 transition-all"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      
                      <div className="absolute left-2 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500/50 to-blue-500/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      
                      <div className="flex items-start justify-between">
                        <div className="space-y-3 flex-1">
                          <div className="flex items-center gap-3 flex-wrap">
                            <h3 className="font-semibold text-lg text-white group-hover:text-blue-400 transition-colors">
                              {session.clientName}
                            </h3>
                            <Badge variant="outline" className="font-medium border-slate-600 text-slate-300">
                              {session.type}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-slate-400">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>{formatDateTime(session.date, session.time)}</span>
                            </div>
                            {session.location && (
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                <span>{session.location}</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4 text-green-400" />
                            <span className="font-semibold text-green-400">
                              {formatCurrency(session.value)}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end gap-2 ml-4">
                          <Badge variant={getStatusVariant(session.status)} className="font-medium">
                            {session.status}
                          </Badge>
                          <Badge 
                            variant={getPaymentStatusVariant(session.paymentStatus)}
                            className="text-xs font-medium"
                          >
                            {session.paymentStatus}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Painel lateral com ações rápidas */}
        <div className="animate-slide-in-right">
         
          <Card className="card-hover border border-slate-700/50 bg-slate-900/50 backdrop-blur-sm h-fit">
            <CardHeader className="pb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-purple-500/20">
                  <Camera className="h-6 w-6 text-purple-400" />
                </div>
                <div>
                  <CardTitle className="text-xl text-white">Ações Rápidas</CardTitle>
                  <CardDescription className="text-slate-400 text-sm mt-1">
                    Acesse rapidamente as principais funcionalidades
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <button 
                onClick={onNavigateToClients}
                className="w-full flex items-center gap-4 p-4 rounded-lg bg-gradient-to-r from-blue-500/10 to-blue-600/5 hover:from-blue-500/20 hover:to-blue-600/10 border border-blue-500/20 hover:border-blue-500/40 transition-all duration-300 group"
              >
                <div className="p-2 rounded-lg bg-blue-500/20 group-hover:bg-blue-500/30 transition-colors">
                  <Users className="h-5 w-5 text-blue-400" />
                </div>
                <div className="text-left flex-1">
                  <div className="text-base font-medium text-slate-200 group-hover:text-white transition-colors">
                    Novo Cliente
                  </div>
                  <div className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors">
                    Cadastre um novo cliente
                  </div>
                </div>
                <div className="text-slate-400 group-hover:text-blue-400 transition-colors">
                  →
                </div>
              </button>
              
              <button 
                onClick={onNavigateToSessions}
                className="w-full flex items-center gap-4 p-4 rounded-lg bg-gradient-to-r from-purple-500/10 to-purple-600/5 hover:from-purple-500/20 hover:to-purple-600/10 border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 group"
              >
                <div className="p-2 rounded-lg bg-purple-500/20 group-hover:bg-purple-500/30 transition-colors">
                  <Calendar className="h-5 w-5 text-purple-400" />
                </div>
                <div className="text-left flex-1">
                  <div className="text-base font-medium text-slate-200 group-hover:text-white transition-colors">
                    Agendar Sessão
                  </div>
                  <div className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors">
                    Marque uma nova sessão
                  </div>
                </div>
                <div className="text-slate-400 group-hover:text-purple-400 transition-colors">
                  →
                </div>
              </button>
              
             

              {/* Estatísticas Complementares */}
              <div className="mt-6 pt-4 border-t border-slate-600/30">
                
              </div>

              {/* Dica do Dia */}
              <div className="mt-4 p-4 rounded-lg bg-gradient-to-r from-blue-500/5 to-purple-500/5 border border-slate-600/20">
                <div className="flex items-start gap-3">
                  <div className="p-1 rounded-full bg-yellow-500/20 mt-1">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-200 mb-1">Dica do Dia</div>
                    <div className="text-xs text-slate-400 leading-relaxed">
                      {upcomingSessions.length === 0 
                        ? "Comece agendando sua primeira sessão para impulsionar seu negócio!"
                        : `Você tem ${upcomingSessions.length} sessão${upcomingSessions.length > 1 ? 'ões' : ''} próxima${upcomingSessions.length > 1 ? 's' : ''}. Não esqueça de confirmar com os clientes!`
                      }
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}