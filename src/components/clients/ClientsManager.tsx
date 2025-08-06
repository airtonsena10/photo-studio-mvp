import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Mail, Phone, MapPin, FileText } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Client, ClientFormData } from '@/types';
import ClientForm from './ClientForm';
import './clients-dark.css';

interface ClientsManagerProps {
  clients: Client[];
  onAddClient: (client: Omit<Client, 'id'>) => Promise<Client>;
  onUpdateClient: (id: string, client: Partial<Client>) => Promise<Client>;
  onDeleteClient: (id: string) => Promise<void>;
  autoShowForm?: boolean;
  onFormClose?: () => void;
}

export default function ClientsManager({
  clients,
  onAddClient,
  onUpdateClient,
  onDeleteClient,
  autoShowForm = false,
  onFormClose
}: ClientsManagerProps) {
  const [showForm, setShowForm] = useState(autoShowForm);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  
  React.useEffect(() => {
    if (autoShowForm) {
      setShowForm(true);
      setEditingClient(null); // Garantir que é para criar novo cliente
    }
  }, [autoShowForm]);

  const handleSave = async (clientData: ClientFormData) => {
    try {
      if (editingClient) {
        await onUpdateClient(editingClient.id, clientData);
      } else {
        // Para novos clientes, adicionar timestamps
        const clientWithTimestamps: Omit<Client, 'id'> = {
          ...clientData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        await onAddClient(clientWithTimestamps);
      }
      handleCloseForm();
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
    }
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingClient(null);
    // Notificar o componente pai que o formulário foi fechado
    if (onFormClose) {
      onFormClose();
    }
  };

  const handleDelete = async (client: Client) => {
    if (window.confirm(`Tem certeza que deseja excluir o cliente ${client.name}?`)) {
      try {
        await onDeleteClient(client.id);
      } catch (error) {
        console.error('Erro ao deletar cliente:', error);
      }
    }
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-8 animate-slide-in-top">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-blue-500/20 border border-blue-500/30">
                <Plus className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <h1 className="text-4xl font-bold tracking-tight text-white">Clientes</h1>
                <p className="text-slate-400 text-lg">
                  Gerencie seus clientes e informações de contato
                </p>
              </div>
            </div>
            {clients.length > 0 && (
              <div className="flex items-center gap-4 text-sm">
                <span className="text-slate-300">
                  <strong className="text-white">{clients.length}</strong> clientes registrados
                </span>
              </div>
            )}
          </div>
          
        </div>

        {/* Formulário */}
        {showForm && (
          <ClientForm
            client={editingClient}
            onSave={handleSave}
            onCancel={handleCloseForm}
          />
        )}

        {/* Lista de Clientes */}
        {clients.length === 0 ? (
          <Card className="empty-state animate-fade-in-up">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="text-center space-y-4 max-w-md">
                <div className="mx-auto w-20 h-20 bg-slate-700/50 rounded-full flex items-center justify-center animate-pulse">
                  <Plus className="h-10 w-10 text-slate-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Nenhum cliente cadastrado</h3>
                  <p className="text-slate-400 leading-relaxed">
                    Comece adicionando seu primeiro cliente para organizar suas sessões fotográficas
                  </p>
                </div>
                <Button 
                  onClick={() => setShowForm(true)}
                  className="mt-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg px-6 py-3"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Primeiro Cliente
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clients.map((client, index) => (
              <Card 
                key={client.id} 
                className="client-card animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <CardTitle className="text-lg text-white">{client.name}</CardTitle>
                      <CardDescription className="text-slate-400">
                        Cliente desde {new Date(client.createdAt).toLocaleDateString('pt-BR')}
                      </CardDescription>
                    </div>
                    <div className="flex gap-1">
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleEdit(client)}
                        className="action-button text-slate-300 hover:text-white"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleDelete(client)}
                        className="action-button text-slate-300 hover:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-blue-400" />
                    <span className="truncate text-slate-300">{client.email}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-green-400" />
                    <span className="text-slate-300">{client.phone}</span>
                  </div>
                  
                  {client.address && (
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-orange-400 mt-0.5" />
                      <span className="text-slate-400 line-clamp-2">{client.address}</span>
                    </div>
                  )}
                  
                  {client.notes && (
                    <div className="flex items-start gap-2 text-sm">
                      <FileText className="h-4 w-4 text-purple-400 mt-0.5" />
                      <span className="text-slate-400 line-clamp-2">{client.notes}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}