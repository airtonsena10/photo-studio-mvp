import { db } from '@/lib/firebase/config';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp, 
  Timestamp,
  FieldValue
} from 'firebase/firestore';
import { Client, Session, SessionFormData } from '@/types';

// Função para tratar erros do Firebase
const handleFirebaseError = (error: unknown, operation: string) => {
  console.error(`Erro ao ${operation}:`, error);
  
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const firebaseError = error as { code: string; message?: string };
    
    if (firebaseError.code === 'permission-denied') {
      throw new Error('Você não tem permissão para realizar esta operação. Verifique se está logado e se as regras do Firestore estão configuradas corretamente.');
    }
    
    if (firebaseError.code === 'unauthenticated') {
      throw new Error('Você precisa estar logado para realizar esta operação.');
    }
    
    if (firebaseError.code === 'unavailable') {
      throw new Error('Serviço temporariamente indisponível. Tente novamente em alguns minutos.');
    }
    
    if (firebaseError.code === 'not-found') {
      throw new Error('Recurso não encontrado.');
    }
    
    throw new Error(`Erro ao ${operation}: ${firebaseError.message || 'Erro desconhecido'}`);
  }
  
  throw new Error(`Erro ao ${operation}: Erro desconhecido`);
};

// ===== Serviços para Clientes =====
export const clientsService = {
  // Obter todos os clientes
  getAll: async (userId?: string): Promise<Client[]> => {
    try {
      const clientsRef = collection(db, 'clients');
      let q = query(clientsRef, orderBy('name'));
      
      // Se userId for fornecido, filtrar por usuário
      if (userId) {
        q = query(clientsRef, where('userId', '==', userId), orderBy('name'));
      }
      
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Client[];
    } catch (error) {
      handleFirebaseError(error, 'buscar clientes');
      return [];
    }
  },
  
  // Obter cliente por ID
  getById: async (id: string): Promise<Client | null> => {
    const docRef = doc(db, 'clients', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Client;
    }
    
    return null;
  },
  
  // Criar novo cliente
  create: async (clientData: Omit<Client, 'id'>): Promise<Client> => {
    const clientsRef = collection(db, 'clients');
    
    const data = {
      ...clientData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(clientsRef, data);
    const newClient = await getDoc(docRef);
    
    return { id: docRef.id, ...newClient.data() } as Client;
  },
  
  // Atualizar cliente
  update: async (id: string, clientData: Partial<Client>): Promise<Client> => {
    const clientRef = doc(db, 'clients', id);
    
    const data = {
      ...clientData,
      updatedAt: serverTimestamp()
    };
    
    await updateDoc(clientRef, data);
    
    const updatedClient = await getDoc(clientRef);
    return { id, ...updatedClient.data() } as Client;
  },
  
  // Excluir cliente
  delete: async (id: string): Promise<void> => {
    const clientRef = doc(db, 'clients', id);
    await deleteDoc(clientRef);
  }
};

// ===== Serviços para Sessões =====
export const sessionsService = {
  // Obter todas as sessões
  getAll: async (): Promise<Session[]> => {
    const sessionsRef = collection(db, 'sessions');
    const q = query(sessionsRef, orderBy('date'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      // Converter Timestamp para string de data
      const date = data.date instanceof Timestamp 
        ? data.date.toDate().toISOString().split('T')[0]
        : data.date;
        
      return {
        id: doc.id,
        ...data,
        date
      };
    }) as Session[];
  },
  
  // Obter sessão por ID
  getById: async (id: string): Promise<Session | null> => {
    const docRef = doc(db, 'sessions', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      // Converter Timestamp para string de data
      const date = data.date instanceof Timestamp 
        ? data.date.toDate().toISOString().split('T')[0]
        : data.date;
        
      return { 
        id: docSnap.id, 
        ...data,
        date
      } as Session;
    }
    
    return null;
  },
  
  // Obter sessões por cliente
  getByClientId: async (clientId: string): Promise<Session[]> => {
    const sessionsRef = collection(db, 'sessions');
    const q = query(
      sessionsRef, 
      where('clientId', '==', clientId),
      orderBy('date')
    );
    
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      // Converter Timestamp para string de data
      const date = data.date instanceof Timestamp 
        ? data.date.toDate().toISOString().split('T')[0]
        : data.date;
        
      return {
        id: doc.id,
        ...data,
        date
      };
    }) as Session[];
  },
  
  // Criar nova sessão
  create: async (sessionData: SessionFormData): Promise<Session> => {
    const sessionsRef = collection(db, 'sessions');
    
    // Buscar nome do cliente
    const clientRef = doc(db, 'clients', sessionData.clientId);
    const clientSnap = await getDoc(clientRef);
    const clientName = clientSnap.exists() ? clientSnap.data().name : 'Cliente não encontrado';
    
    // Converter string de data para Timestamp
    const dateTimestamp = Timestamp.fromDate(new Date(sessionData.date));
    
    const data = {
      clientId: sessionData.clientId,
      clientName,
      type: sessionData.type,
      date: dateTimestamp,
      time: sessionData.time,
      duration: sessionData.duration,
      location: sessionData.location || '',
      value: sessionData.value,
      status: 'agendado',
      paymentStatus: 'pendente',
      notes: sessionData.notes || '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(sessionsRef, data);
    
    return { 
      id: docRef.id, 
      clientId: sessionData.clientId,
      clientName,
      type: sessionData.type,
      date: sessionData.date, // Retornar como string para o frontend
      time: sessionData.time,
      duration: sessionData.duration,
      location: sessionData.location || '',
      value: sessionData.value,
      status: 'agendado',
      paymentStatus: 'pendente',
      notes: sessionData.notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    } as Session;
  },
  
  // Atualizar nome do cliente nas sessões
  updateClientName: async (sessionId: string, clientName: string): Promise<Session> => {
    const sessionRef = doc(db, 'sessions', sessionId);
    
    await updateDoc(sessionRef, {
      clientName,
      updatedAt: serverTimestamp()
    });
    
    // Buscar sessão atualizada
    const updatedSession = await getDoc(sessionRef);
    const updatedData = updatedSession.data();
    
    // Converter Timestamp para string de data
    const date = updatedData?.date instanceof Timestamp 
      ? updatedData.date.toDate().toISOString().split('T')[0]
      : updatedData?.date;
    
    return { 
      id: sessionId, 
      ...updatedData,
      date
    } as Session;
  },
  
  // Atualizar sessão
  update: async (id: string, sessionData: Partial<SessionFormData>): Promise<Session> => {
    const sessionRef = doc(db, 'sessions', id);
    
    const data: { [x: string]: FieldValue | Partial<unknown> | undefined } = {
      ...sessionData,
      updatedAt: serverTimestamp()
    };
    
    // Se clientId foi alterado, atualizar clientName
    if (sessionData.clientId) {
      const clientRef = doc(db, 'clients', sessionData.clientId);
      const clientSnap = await getDoc(clientRef);
      if (clientSnap.exists()) {
        data.clientName = clientSnap.data()?.name;
      }
    }
    
    // Se data foi alterada, converter para Timestamp
    if (sessionData.date) {
      data.date = Timestamp.fromDate(new Date(sessionData.date));
    }
    
    await updateDoc(sessionRef, data);
    
    // Buscar sessão atualizada
    const updatedSession = await getDoc(sessionRef);
    const updatedData = updatedSession.data();
    
    // Converter Timestamp para string de data
    const date = updatedData?.date instanceof Timestamp 
      ? updatedData.date.toDate().toISOString().split('T')[0]
      : updatedData?.date;
    
    return { 
      id, 
      ...updatedData,
      date
    } as Session;
  },
  
  // Atualizar status da sessão
  updateStatus: async (id: string, status: Session['status']): Promise<Session> => {
    const sessionRef = doc(db, 'sessions', id);
    
    await updateDoc(sessionRef, {
      status,
      updatedAt: serverTimestamp()
    });
    
    const updatedSession = await getDoc(sessionRef);
    const data = updatedSession.data();
    
    // Converter Timestamp para string de data
    const date = data?.date instanceof Timestamp 
      ? data.date.toDate().toISOString().split('T')[0]
      : data?.date;
    
    return { 
      id, 
      ...data,
      date
    } as Session;
  },
  
  // Atualizar status de pagamento
  updatePaymentStatus: async (id: string, paymentStatus: Session['paymentStatus']): Promise<Session> => {
    const sessionRef = doc(db, 'sessions', id);
    
    await updateDoc(sessionRef, {
      paymentStatus,
      updatedAt: serverTimestamp()
    });
    
    const updatedSession = await getDoc(sessionRef);
    const data = updatedSession.data();
    
    // Converter Timestamp para string de data
    const date = data?.date instanceof Timestamp 
      ? data.date.toDate().toISOString().split('T')[0]
      : data?.date;
    
    return { 
      id, 
      ...data,
      date
    } as Session;
  },
  
  // Excluir sessão
  delete: async (id: string): Promise<void> => {
    const sessionRef = doc(db, 'sessions', id);
    await deleteDoc(sessionRef);
  },
  
  // Obter estatísticas para dashboard
  getStats: async () => {
    const clientsSnapshot = await getDocs(collection(db, 'clients'));
    const totalClients = clientsSnapshot.size;

    const sessionsSnapshot = await getDocs(collection(db, 'sessions'));
    const sessions = sessionsSnapshot.docs.map(doc => {
      const data = doc.data();
      
      // Converter Timestamp para string de data se necessário
      const date = data.date instanceof Timestamp 
        ? data.date.toDate().toISOString().split('T')[0]
        : data.date;
      
      return {
        ...data,
        id: doc.id,
        date
      } as Session;
    });    // Data atual
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    // Sessões deste mês
    const sessionsThisMonth = sessions.filter(session => {
      const sessionDate = new Date(session.date);
      return sessionDate >= firstDayOfMonth && sessionDate <= lastDayOfMonth;
    });
    
    // Receita deste mês (sessões pagas)
    const revenueThisMonth = sessionsThisMonth
      .filter(session => session.paymentStatus === 'pago')
      .reduce((total, session) => total + (session.value || 0), 0);
    
    // Pagamentos pendentes
    const pendingPayments = sessions
      .filter(session => session.paymentStatus === 'pendente')
      .reduce((total, session) => total + (session.value || 0), 0);
    
    return {
      totalClients,
      sessionsThisMonth: sessionsThisMonth.length,
      revenueThisMonth,
      pendingPayments
    };
  }
};