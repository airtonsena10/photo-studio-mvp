import React from 'react';
import { Calendar, Users, Camera, DollarSign } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Client, Session } from '@/types';
import { calculateDashboardStats, getUpcomingSessions, formatCurrency, formatDateTime } from '@/utils';

interface DashboardProps {
  clients: Client[];
  sessions: Session[];
}

const Dashboard: React.FC<DashboardProps> = ({ clients, sessions }) => {
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

  return (
    <div className="space-y-6">
      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClients}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalClients === 1 ? 'cliente cadastrado' : 'clientes cadastrados'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sessões Este Mês</CardTitle>
            <Camera className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.sessionsThisMonth}</div>
            <p className="text-xs text-muted-foreground">
              no mês atual
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Faturamento Este Mês</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(stats.revenueThisMonth)}
            </div>
            <p className="text-xs text-muted-foreground">
              pagamentos recebidos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pagamentos Pendentes</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(stats.pendingPayments)}
            </div>
            <p className="text-xs text-muted-foreground">
              a receber
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Próximas Sessões */}
      <Card>
        <CardHeader>
          <CardTitle>Próximas Sessões</CardTitle>
          <CardDescription>
            Sessões agendadas para os próximos dias
          </CardDescription>
        </CardHeader>
        <CardContent>
          {upcomingSessions.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Nenhuma sessão agendada</p>
              <p className="text-sm text-muted-foreground mt-1">
                Agende uma nova sessão para começar
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingSessions.map(session => (
                <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{session.clientName}</p>
                      <Badge variant="outline" className="text-xs">
                        {session.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatDateTime(session.date, session.time)}
                      {session.location && ` • ${session.location}`}
                    </p>
                    <p className="text-sm font-medium text-green-600">
                      {formatCurrency(session.value)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant={getStatusVariant(session.status)}>
                      {session.status}
                    </Badge>
                    <Badge 
                      variant={session.paymentStatus === 'pago' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {session.paymentStatus}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;