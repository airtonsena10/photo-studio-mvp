import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Calendar, Clock, MapPin, DollarSign, User, Camera } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Client, Session, SessionFormData } from '@/types';
import { formatCurrency, formatDateTime, getSessionTypeLabel, getStatusLabel, getPaymentStatusLabel } from '@/utils';
import SessionForm from './SessionForm';

interface SessionsManagerProps {
  clients: Client[];
  sessions: Session[];
  onAddSession: (session: SessionFormData) => void;
  onUpdateSession: (id: string, session: Partial<SessionFormData>) => void;
  onUpdateSessionStatus: (id: string, status: Session['status']) => void;
  onUpdatePaymentStatus: (id: string, paymentStatus: Session['paymentStatus']) => void;
  onDeleteSession: (id: string) => void;
}

const SessionsManager: React.FC<SessionsManagerProps> = ({
  clients,
  sessions,
  onAddSession,
  onUpdateSession,
  onUpdateSessionStatus,
  onUpdatePaymentStatus,
  onDeleteSession
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [filterPayment, setFilterPayment] = useState<string>('todos');

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Sessões Fotográficas</h2>
          <p className="text-muted-foreground">
            Gerencie agendamentos, status e pagamentos das sessões
          </p>
        </div>
        <Button 
          onClick={() => setShowForm(true)} 
          disabled={clients.length === 0}
          className="w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova Sessão
        </Button>
      </div>

      {/* Aviso se não há clientes */}
      {clients.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center space-y-3">
              <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Nenhum cliente cadastrado</h3>
                <p className="text-muted-foreground">
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

      {/* Filtros */}
      {sessions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Status da Sessão</label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os Status</SelectItem>
                    <SelectItem value="agendado">Agendado</SelectItem>
                    <SelectItem value="confirmado">Confirmado</SelectItem>
                    <SelectItem value="realizado">Realizado</SelectItem>
                    <SelectItem value="cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Status do Pagamento</label>
                <Select value={filterPayment} onValueChange={setFilterPayment}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os Pagamentos</SelectItem>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="sinal">50% pago</SelectItem>
                    <SelectItem value="pago">Pago Completo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de Sessões */}
      {sortedSessions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center space-y-3">
              <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                <Calendar className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">
                  {sessions.length === 0 ? 'Nenhuma sessão agendada' : 'Nenhuma sessão encontrada'}
                </h3>
                <p className="text-muted-foreground">
                  {sessions.length === 0 
                    ? 'Agende sua primeira sessão fotográfica'
                    : 'Tente ajustar os filtros para encontrar sessões'
                  }
                </p>
              </div>
              {sessions.length === 0 && clients.length > 0 && (
                <Button onClick={() => setShowForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Agendar Primeira Sessão
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sortedSessions.map(session => (
            <Card key={session.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex flex-col lg:flex-row justify-between gap-4">
                  {/* Informações da Sessão */}
                  <div className="flex-1 space-y-3">
                    {/* Cliente e Tipo */}
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-lg">{session.clientName}</h3>
                      <Badge variant="outline" className="text-xs">
                        <Camera className="h-3 w-3 mr-1" />
                        {getSessionTypeLabel(session.type)}
                      </Badge>
                    </div>

                    {/* Data e Horário */}
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm">
                        {formatDateTime(session.date, session.time)}
                      </span>
                      <Clock className="h-4 w-4 ml-2" />
                      <span className="text-sm">{session.duration}h de duração</span>
                    </div>

                    {/* Local */}
                    {session.location && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span className="text-sm">{session.location}</span>
                      </div>
                    )}

                    {/* Valor */}
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-600">
                        {formatCurrency(session.value)}
                      </span>
                    </div>

                    {/* Observações */}
                    {session.notes && (
                      <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
                        <strong>Observações:</strong> {session.notes}
                      </div>
                    )}
                  </div>

                  {/* Controles */}
                  <div className="flex flex-col gap-3 lg:items-end">
                    {/* Status */}
                    <div className="flex flex-col sm:flex-row lg:flex-col gap-2">
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">Status da Sessão</label>
                        <Select 
                          value={session.status} 
                          onValueChange={(value) => onUpdateSessionStatus(session.id, value as Session['status'])}
                        >
                          <SelectTrigger className="w-full sm:w-36">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="agendado">Agendado</SelectItem>
                            <SelectItem value="confirmado">Confirmado</SelectItem>
                            <SelectItem value="realizado">Realizado</SelectItem>
                            <SelectItem value="cancelado">Cancelado</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">Status do Pagamento</label>
                        <Select 
                          value={session.paymentStatus} 
                          onValueChange={(value) => onUpdatePaymentStatus(session.id, value as Session['paymentStatus'])}
                        >
                          <SelectTrigger className="w-full sm:w-36">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pendente">Pendente</SelectItem>
                            <SelectItem value="sinal">50% Pago</SelectItem>
                            <SelectItem value="pago">Pago Completo</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-2">
                      <Badge variant={getStatusVariant(session.status)}>
                        {getStatusLabel(session.status)}
                      </Badge>
                      <Badge variant={getPaymentVariant(session.paymentStatus)}>
                        {getPaymentStatusLabel(session.paymentStatus)}
                      </Badge>
                    </div>

                    {/* Ações */}
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleEdit(session)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleDelete(session)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Resumo */}
      {sessions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Resumo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{sessions.length}</div>
                <div className="text-sm text-muted-foreground">Total de Sessões</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {sessions.filter(s => s.status === 'realizado').length}
                </div>
                <div className="text-sm text-muted-foreground">Realizadas</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {sessions.filter(s => s.status === 'agendado' || s.status === 'confirmado').length}
                </div>
                <div className="text-sm text-muted-foreground">Agendadas</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(sessions.reduce((total, session) => total + session.value, 0))}
                </div>
                <div className="text-sm text-muted-foreground">Valor Total</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SessionsManager;