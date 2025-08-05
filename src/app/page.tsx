'use client';

import React, { useState } from 'react';
import { Camera, Users, Calendar, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Componentes principais
import Dashboard from '@/components/dashboard/Dashboard';
import ClientsManager from '@/components/clients/ClientsManager';
import SessionsManager from '@/components/sessions/SessionsManager';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';


// Hook personalizado
import { usePhotoStudio } from '@/hooks/usePhotoStudio';
import { useAuth } from '@/hooks/useAuth';
import { logout } from '@/lib/firebase/auth';

// Tipos
type ActiveTab = 'dashboard' | 'clients' | 'sessions';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const { user } = useAuth();
  
  const {
    clients,
    sessions,
    loading,
    addClient,
    updateClient,
    deleteClient,
    addSession,
    updateSession,
    updateSessionStatus,
    updatePaymentStatus,
    deleteSession
  } = usePhotoStudio();

  const handleLogout = async () => {
    const result = await logout();
    if (result.error) {
      alert('Erro ao fazer logout: ' + result.error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Carregando sistema...</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    return (
      <>
     
        
        {(() => {
          switch (activeTab) {
            case 'dashboard':
              return <Dashboard clients={clients} sessions={sessions} />;
            
            case 'clients':
              return (
                <ClientsManager
                  clients={clients}
                  onAddClient={addClient}
                  onUpdateClient={updateClient}
                  onDeleteClient={deleteClient}
                />
              );
            
            case 'sessions':
              return (
                <SessionsManager
                  clients={clients}
                  sessions={sessions}
                  onAddSession={addSession}
                  onUpdateSession={updateSession}
                  onUpdateSessionStatus={updateSessionStatus}
                  onUpdatePaymentStatus={updatePaymentStatus}
                  onDeleteSession={deleteSession}
                />
              );
            
            default:
              return <Dashboard clients={clients} sessions={sessions} />;
          }
        })()}
      </>
    );
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              {/* Logo */}
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                  <Camera className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-xl font-bold tracking-tight">Anju fotografia</h1>
                  <p className="text-xs text-muted-foreground">Sistema de Gestão</p>
                </div>
              </div>

              {/* Navegação */}
              <nav className="flex items-center space-x-1">
                <Button
                  variant={activeTab === 'dashboard' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTab('dashboard')}
                  className="hidden sm:flex"
                >
                  Dashboard
                </Button>
                
                <Button
                  variant={activeTab === 'clients' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTab('clients')}
                >
                  <Users className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Clientes</span>
                </Button>
                
                <Button
                  variant={activeTab === 'sessions' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTab('sessions')}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Sessões</span>
                </Button>

                {/* User Info & Logout */}
                <div className="flex items-center space-x-2 ml-4 pl-4 border-l">
                  <span className="text-sm text-muted-foreground hidden sm:inline">
                    {user?.displayName || user?.email}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="flex items-center gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="hidden sm:inline">Sair</span>
                  </Button>
                </div>
              </nav>
            </div>
          </div>
        </header>

        {/* Conteúdo Principal */}
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-fade-in">
            {renderContent()}
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t bg-muted/50 py-6 mt-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Camera className="h-4 w-4" />
                <span>Anju fotografia © 2025</span>
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <span>Desenvolvido por Airton Sena</span>
                <div className="flex items-center space-x-1">
                  <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Sistema Online</span>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </ProtectedRoute>
  );
}