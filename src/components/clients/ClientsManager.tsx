import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Mail, Phone, MapPin, FileText } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Client, ClientFormData } from '@/types';
import ClientForm from './ClientForm';

interface ClientsManagerProps {
  clients: Client[];
  onAddClient: (client: Omit<Client, 'id'>) => Promise<Client>;
  onUpdateClient: (id: string, client: Partial<Client>) => Promise<Client>;
  onDeleteClient: (id: string) => Promise<void>;
}

const ClientsManager: React.FC<ClientsManagerProps> = ({
  clients,
  onAddClient,
  onUpdateClient,
  onDeleteClient
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Clientes</h2>
          <p className="text-muted-foreground">
            Gerencie seus clientes e informações de contato
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Cliente
        </Button>
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
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center space-y-3">
              <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                <Plus className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Nenhum cliente cadastrado</h3>
                <p className="text-muted-foreground">
                  Comece adicionando seu primeiro cliente
                </p>
              </div>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Cliente
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clients.map(client => (
            <Card key={client.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{client.name}</CardTitle>
                    <CardDescription>
                      Cliente desde {new Date(client.createdAt).toLocaleDateString('pt-BR')}
                    </CardDescription>
                  </div>
                  <div className="flex gap-1">
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => handleEdit(client)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => handleDelete(client)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="truncate">{client.email}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{client.phone}</span>
                </div>
                
                {client.address && (
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <span className="text-muted-foreground">{client.address}</span>
                  </div>
                )}
                
                {client.notes && (
                  <div className="flex items-start gap-2 text-sm">
                    <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <span className="text-muted-foreground line-clamp-2">{client.notes}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClientsManager;