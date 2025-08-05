import { useState, useEffect } from 'react';
import { clientsService, sessionsService } from '@/services/firebaseServices';
import { Client, Session, SessionFormData } from '@/types';

export const usePhotoStudio = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Carregar dados iniciais
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Carregar clientes
        const clientsData = await clientsService.getAll();
        setClients(clientsData);
        
        // Carregar sessões
        const sessionsData = await sessionsService.getAll();
        setSessions(sessionsData);
        
        setError(null);
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        setError('Falha ao carregar dados. Por favor, tente novamente.');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  // === Funções para gerenciar clientes ===
  
  const addClient = async (clientData: Omit<Client, 'id'>) => {
    try {
      setLoading(true);
      const newClient = await clientsService.create(clientData);
      setClients(prev => [...prev, newClient]);
      return newClient;
    } catch (err) {
      console.error('Erro ao adicionar cliente:', err);
      setError('Falha ao adicionar cliente. Por favor, tente novamente.');
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  const updateClient = async (id: string, clientData: Partial<Client>) => {
    try {
      setLoading(true);
      const updatedClient = await clientsService.update(id, clientData);
      setClients(prev => prev.map(client => 
        client.id === id ? updatedClient : client
      ));
      
      // Atualizar nome do cliente nas sessões, se necessário
      if (clientData.name) {
        const clientSessions = sessions.filter(session => session.clientId === id);
        
        if (clientSessions.length > 0) {
          const updatedSessions = await Promise.all(
            clientSessions.map(async session => {
              const updated = await sessionsService.updateClientName(session.id, clientData.name as string);
              return updated;
            })
          );
          
          setSessions(prev => prev.map(session => {
            const updated = updatedSessions.find(s => s.id === session.id);
            return updated || session;
          }));
        }
      }
      
      return updatedClient;
    } catch (err) {
      console.error('Erro ao atualizar cliente:', err);
      setError('Falha ao atualizar cliente. Por favor, tente novamente.');
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  const deleteClient = async (id: string) => {
    try {
      setLoading(true);
      
      // Verificar se existem sessões para este cliente
      const clientSessions = sessions.filter(session => session.clientId === id);
      
      if (clientSessions.length > 0) {
        // Excluir todas as sessões do cliente
        await Promise.all(
          clientSessions.map(session => sessionsService.delete(session.id))
        );
        
        // Atualizar estado das sessões
        setSessions(prev => prev.filter(session => session.clientId !== id));
      }
      
      // Excluir o cliente
      await clientsService.delete(id);
      
      // Atualizar estado dos clientes
      setClients(prev => prev.filter(client => client.id !== id));
    } catch (err) {
      console.error('Erro ao excluir cliente:', err);
      setError('Falha ao excluir cliente. Por favor, tente novamente.');
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  // === Funções para gerenciar sessões ===
  
  const addSession = async (sessionData: SessionFormData) => {
    try {
      setLoading(true);
      const newSession = await sessionsService.create(sessionData);
      setSessions(prev => [...prev, newSession]);
      return newSession;
    } catch (err) {
      console.error('Erro ao adicionar sessão:', err);
      setError('Falha ao adicionar sessão. Por favor, tente novamente.');
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  const updateSession = async (id: string, sessionData: Partial<SessionFormData>) => {
    try {
      setLoading(true);
      const updatedSession = await sessionsService.update(id, sessionData);
      setSessions(prev => prev.map(session => 
        session.id === id ? updatedSession : session
      ));
      return updatedSession;
    } catch (err) {
      console.error('Erro ao atualizar sessão:', err);
      setError('Falha ao atualizar sessão. Por favor, tente novamente.');
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  const updateSessionStatus = async (id: string, status: Session['status']) => {
    try {
      setLoading(true);
      const updatedSession = await sessionsService.updateStatus(id, status);
      setSessions(prev => prev.map(session => 
        session.id === id ? updatedSession : session
      ));
      return updatedSession;
    } catch (err) {
      console.error('Erro ao atualizar status da sessão:', err);
      setError('Falha ao atualizar status. Por favor, tente novamente.');
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  const updatePaymentStatus = async (id: string, paymentStatus: Session['paymentStatus']) => {
    try {
      setLoading(true);
      const updatedSession = await sessionsService.updatePaymentStatus(id, paymentStatus);
      setSessions(prev => prev.map(session => 
        session.id === id ? updatedSession : session
      ));
      return updatedSession;
    } catch (err) {
      console.error('Erro ao atualizar status de pagamento:', err);
      setError('Falha ao atualizar pagamento. Por favor, tente novamente.');
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  const deleteSession = async (id: string) => {
    try {
      setLoading(true);
      await sessionsService.delete(id);
      setSessions(prev => prev.filter(session => session.id !== id));
    } catch (err) {
      console.error('Erro ao excluir sessão:', err);
      setError('Falha ao excluir sessão. Por favor, tente novamente.');
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  return {
    clients,
    sessions,
    loading,
    error,
    addClient,
    updateClient,
    deleteClient,
    addSession,
    updateSession,
    updateSessionStatus,
    updatePaymentStatus,
    deleteSession
  };
};