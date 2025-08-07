import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Calendar, Clock, MapPin, User, Camera, Filter, BarChart3 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Client, Session, SessionFormData } from '@/types';
import { formatCurrency, formatDateTime, getSessionTypeLabel, getStatusLabel, getPaymentStatusLabel } from '@/utils';
import SessionForm from './SessionForm';
import './sessions-dark.css';

interface SessionsManagerProps {
  clients: Client[];
  sessions: Session[];
  onAddSession: (session: SessionFormData) => void;
  onUpdateSession: (id: string, session: Partial<SessionFormData>) => void;
  onUpdateSessionStatus: (id: string, status: Session['status']) => void;
  onUpdatePaymentStatus: (id: string, paymentStatus: Session['paymentStatus']) => void;
  onDeleteSession: (id: string) => void;
  autoShowForm?: boolean;
  onFormClose?: () => void;
}

export default function SessionsManager({
  clients,
  sessions,
  onAddSession,
  onUpdateSession,
  onUpdateSessionStatus,
  onUpdatePaymentStatus,
  onDeleteSession,
  autoShowForm = false,
  onFormClose
}: SessionsManagerProps) {
  const [showForm, setShowForm] = useState(autoShowForm);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [filterPayment, setFilterPayment] = useState<string>('todos');

  // Efeito para abrir o formulário automaticamente quando solicitado
  React.useEffect(() => {
    if (autoShowForm) {
      setShowForm(true);
      setEditingSession(null); // Garantir que é para criar nova sessão
    }
  }, [autoShowForm]);

  const handleSave = (sessionData: SessionFormData) => {
    if (editingSession) {
      onUpdateSession(editingSession.id, sessionData);
    } else {
      onAddSession(sessionData);
    }
    handleCloseForm();
  };

  const handleEdit = (session: Session) => {
    setEditingSession(session);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingSession(null);
    // Notificar o componente pai que o formulário foi fechado
    if (onFormClose) {
      onFormClose();
    }
  };

  const handleDelete = (session: Session) => {
    if (window.confirm(`Tem certeza que deseja excluir a sessão de ${session.clientName}?`)) {
      onDeleteSession(session.id);
    }
  };

  const getStatusVariant = (status: Session['status']) => {
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

  const getPaymentVariant = (status: Session['paymentStatus']) => {
    switch (status) {
      case 'pago':
        return 'default';
      case 'sinal':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  // Filtrar sessões
  const filteredSessions = sessions.filter(session => {
    const statusMatch = filterStatus === 'todos' || session.status === filterStatus;
    const paymentMatch = filterPayment === 'todos' || session.paymentStatus === filterPayment;
    return statusMatch && paymentMatch;
  });

  // Ordenar por data (mais próximas primeiro)
  const sortedSessions = filteredSessions.sort((a, b) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-8 animate-slide-in-bottom">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-blue-500/20 border border-blue-500/30">
                <Camera className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <h1 className="text-4xl font-bold tracking-tight text-white">Sessões Fotográficas</h1>
                <p className="text-slate-400 text-lg">
                  Gerencie todos os seus agendamentos e acompanhe o progresso
                </p>
              </div>
            </div>
            {sessions.length > 0 && (
              <div className="flex items-center gap-4 text-sm">
                <span className="text-slate-300">
                  <strong className="text-white">{sessions.length}</strong> sessões registradas
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-300">
                  <strong className="text-green-400">{sessions.filter(s => s.status === 'realizado').length}</strong> concluídas
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-300">
                  <strong className="text-blue-400">{sessions.filter(s => ['agendado', 'confirmado'].includes(s.status)).length}</strong> agendadas
                </span>
              </div>
            )}
          </div>
          
          
          {clients.length > 0 && (
            <Button 
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg px-6 py-3 transition-all duration-200 hover:shadow-xl"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nova Sessão
            </Button>
          )}
        </div>

 
        {clients.length === 0 && (
          <Card className="filter-card animate-fade-in-scale">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-slate-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">Nenhum cliente cadastrado</h3>
                  <p className="text-slate-400 mt-2">
                    Cadastre pelo menos um cliente antes de agendar sessões
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Formulário */}
        {showForm && (
          <SessionForm
            clients={clients}
            session={editingSession}
            onSave={handleSave}
            onCancel={handleCloseForm}
          />
        )}

        {/* Quick Stats & Filters Section */}
        {sessions.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quick Stats */}
            <div className="lg:col-span-2">
              <Card className="summary-card animate-fade-in-scale">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg text-white flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-blue-400" />
                    Visão Geral
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 rounded-lg bg-slate-800/30 border border-slate-600/30 hover:bg-slate-800/50 transition-colors">
                      <div className="text-2xl font-bold text-white mb-1">{sessions.length}</div>
                      <div className="text-xs text-slate-400">Total</div>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-green-900/20 border border-green-500/20 hover:bg-green-900/30 transition-colors">
                      <div className="text-2xl font-bold text-green-400 mb-1">
                        {sessions.filter(s => s.status === 'realizado').length}
                      </div>
                      <div className="text-xs text-slate-400">Realizadas</div>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-blue-900/20 border border-blue-500/20 hover:bg-blue-900/30 transition-colors">
                      <div className="text-2xl font-bold text-blue-400 mb-1">
                        {sessions.filter(s => s.status === 'agendado' || s.status === 'confirmado').length}
                      </div>
                      <div className="text-xs text-slate-400">Agendadas</div>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-purple-900/20 border border-purple-500/20 hover:bg-purple-900/30 transition-colors">
                      <div className="text-xl font-bold text-purple-400 mb-1">
                        {formatCurrency(sessions.reduce((total, session) => total + session.value, 0))}
                      </div>
                      <div className="text-xs text-slate-400">Receita Total</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <div>
              <Card className="filter-card animate-fade-in-scale">
                <CardHeader>
                  <CardTitle className="text-lg text-white flex items-center gap-2">
                    <Filter className="h-5 w-5 text-blue-400" />
                    Filtros
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Status da Sessão</label>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="select-dark">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-600">
                        <SelectItem value="todos" className="text-slate-200 hover:bg-slate-700">Todos</SelectItem>
                        <SelectItem value="agendado" className="text-slate-200 hover:bg-slate-700">Agendado</SelectItem>
                        <SelectItem value="confirmado" className="text-slate-200 hover:bg-slate-700">Confirmado</SelectItem>
                        <SelectItem value="realizado" className="text-slate-200 hover:bg-slate-700">Realizado</SelectItem>
                        <SelectItem value="cancelado" className="text-slate-200 hover:bg-slate-700">Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Status do Pagamento</label>
                    <Select value={filterPayment} onValueChange={setFilterPayment}>
                      <SelectTrigger className="select-dark">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-600">
                        <SelectItem value="todos" className="text-slate-200 hover:bg-slate-700">Todos</SelectItem>
                        <SelectItem value="pendente" className="text-slate-200 hover:bg-slate-700">Pendente</SelectItem>
                        <SelectItem value="sinal" className="text-slate-200 hover:bg-slate-700">50% Pago</SelectItem>
                        <SelectItem value="pago" className="text-slate-200 hover:bg-slate-700">Completo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {(filterStatus !== 'todos' || filterPayment !== 'todos') && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => {
                        setFilterStatus('todos');
                        setFilterPayment('todos');
                      }}
                      className="w-full text-slate-400 hover:text-white"
                    >
                      Limpar Filtros
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Sessions List Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-white">
              {sortedSessions.length > 0 ? `Sessões (${sortedSessions.length})` : 'Suas Sessões'}
            </h2>
            {sortedSessions.length > 0 && (
              <div className="text-sm text-slate-400">
                {filterStatus !== 'todos' && `Status: ${filterStatus}`}
                {filterStatus !== 'todos' && filterPayment !== 'todos' && ' • '}
                {filterPayment !== 'todos' && `Pagamento: ${filterPayment}`}
              </div>
            )}
          </div>

          {sortedSessions.length === 0 ? (
            <Card className="filter-card animate-fade-in-scale">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="text-center space-y-4 max-w-md">
                  <div className="mx-auto w-20 h-20 bg-slate-700/50 rounded-full flex items-center justify-center animate-pulse-glow">
                    <Calendar className="h-10 w-10 text-slate-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      {sessions.length === 0 ? 'Comece agendando sua primeira sessão' : 'Nenhuma sessão encontrada'}
                    </h3>
                    <p className="text-slate-400 leading-relaxed">
                      {sessions.length === 0 
                        ? 'Organize seu estúdio fotográfico criando e gerenciando sessões com seus clientes'
                        : 'Tente ajustar os filtros ou limpar as seleções para encontrar as sessões desejadas'
                      }
                    </p>
                  </div>
                  {sessions.length === 0 && clients.length > 0 && (
                    <Button 
                      onClick={() => setShowForm(true)}
                      className="mt-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg px-6 py-3"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Criar Primeira Sessão
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {sortedSessions.map((session, index) => {
                const getStatusClass = (status: Session['status']) => {
                  switch (status) {
                    case 'confirmado': return 'status-confirmed';
                    case 'agendado': return 'status-scheduled';
                    case 'realizado': return 'status-completed';
                    case 'cancelado': return 'status-cancelled';
                    default: return '';
                  }
                };

                return (
                  <Card 
                    key={session.id} 
                    className={`session-card animate-fade-in-scale ${getStatusClass(session.status)}`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Info */}
                        <div className="lg:col-span-2 space-y-4">
                          <div className="flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <h3 className="text-xl font-semibold text-white">{session.clientName}</h3>
                              <Badge variant="outline" className="badge-dark">
                                <Camera className="h-3 w-3 mr-1" />
                                {getSessionTypeLabel(session.type)}
                              </Badge>
                            </div>
                            <div className="text-lg font-semibold text-green-400">
                              {formatCurrency(session.value)}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div className="space-y-3">
                              <div className="flex items-center gap-2 text-slate-300">
                                <Calendar className="h-4 w-4 text-blue-400" />
                                <span>{formatDateTime(session.date, session.time)}</span>
                              </div>
                              <div className="flex items-center gap-2 text-slate-300">
                                <Clock className="h-4 w-4 text-purple-400" />
                                <span>{session.duration}h de duração</span>
                              </div>
                            </div>
                            {session.location && (
                              <div className="flex items-center gap-2 text-slate-300">
                                <MapPin className="h-4 w-4 text-orange-400" />
                                <span>{session.location}</span>
                              </div>
                            )}
                          </div>

                          {session.notes && (
                            <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-600/30">
                              <p className="text-sm text-slate-300">
                                <span className="font-medium text-slate-200">Observações:</span> {session.notes}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Controls */}
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
                            <div className="space-y-2">
                              <label className="text-xs font-medium text-slate-400">Status</label>
                              <Select 
                                value={session.status} 
                                onValueChange={(value) => onUpdateSessionStatus(session.id, value as Session['status'])}
                              >
                                <SelectTrigger className="select-dark text-sm">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-800 border-slate-600">
                                  <SelectItem value="agendado" className="text-slate-200 hover:bg-slate-700">Agendado</SelectItem>
                                  <SelectItem value="confirmado" className="text-slate-200 hover:bg-slate-700">Confirmado</SelectItem>
                                  <SelectItem value="realizado" className="text-slate-200 hover:bg-slate-700">Realizado</SelectItem>
                                  <SelectItem value="cancelado" className="text-slate-200 hover:bg-slate-700">Cancelado</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <label className="text-xs font-medium text-slate-400">Pagamento</label>
                              <Select 
                                value={session.paymentStatus} 
                                onValueChange={(value) => onUpdatePaymentStatus(session.id, value as Session['paymentStatus'])}
                              >
                                <SelectTrigger className="select-dark text-sm">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-800 border-slate-600">
                                  <SelectItem value="pendente" className="text-slate-200 hover:bg-slate-700">Pendente</SelectItem>
                                  <SelectItem value="sinal" className="text-slate-200 hover:bg-slate-700">50% Pago</SelectItem>
                                  <SelectItem value="pago" className="text-slate-200 hover:bg-slate-700">Completo</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <Badge variant={getStatusVariant(session.status)} className="text-xs">
                              {getStatusLabel(session.status)}
                            </Badge>
                            <Badge variant={getPaymentVariant(session.paymentStatus)} className="text-xs">
                              {getPaymentStatusLabel(session.paymentStatus)}
                            </Badge>
                          </div>

                          <div className="flex gap-2 pt-2">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handleEdit(session)}
                              className="action-button text-slate-300 hover:text-white flex-1"
                            >
                              <Edit2 className="h-4 w-4 mr-1" />
                              Editar
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handleDelete(session)}
                              className="action-button text-slate-300 hover:text-red-400"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}