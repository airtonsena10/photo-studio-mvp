import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  User,
  AuthError,
} from 'firebase/auth';
import { auth } from './config';

export interface AuthResult {
  user: User | null;
  error: string | null;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

// Login com email e senha
export const loginWithEmailAndPassword = async (
  email: string,
  password: string
): Promise<AuthResult> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return {
      user: userCredential.user,
      error: null,
    };
  } catch (error) {
    const authError = error as AuthError;
    return {
      user: null,
      error: getAuthErrorMessage(authError.code),
    };
  }
};

// Registrar novo usuário
export const registerWithEmailAndPassword = async (
  email: string,
  password: string,
  name: string
): Promise<AuthResult> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Atualizar o perfil com o nome
    if (userCredential.user) {
      await updateProfile(userCredential.user, {
        displayName: name,
      });
    }

    return {
      user: userCredential.user,
      error: null,
    };
  } catch (error) {
    const authError = error as AuthError;
    return {
      user: null,
      error: getAuthErrorMessage(authError.code),
    };
  }
};

// Logout
export const logout = async (): Promise<{ error: string | null }> => {
  try {
    await signOut(auth);
    return { error: null };
  } catch (error) {
    const authError = error as AuthError;
    return { error: getAuthErrorMessage(authError.code) };
  }
};

// Resetar senha
export const resetPassword = async (email: string): Promise<{ error: string | null }> => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { error: null };
  } catch (error) {
    const authError = error as AuthError;
    return { error: getAuthErrorMessage(authError.code) };
  }
};

// Traduzir erros do Firebase para português
const getAuthErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case 'auth/user-not-found':
      return 'Usuário não encontrado';
    case 'auth/wrong-password':
      return 'Senha incorreta';
    case 'auth/email-already-in-use':
      return 'Este email já está em uso';
    case 'auth/weak-password':
      return 'A senha deve ter pelo menos 6 caracteres';
    case 'auth/invalid-email':
      return 'Email inválido';
    case 'auth/too-many-requests':
      return 'Muitas tentativas. Tente novamente mais tarde';
    case 'auth/network-request-failed':
      return 'Erro de conexão. Verifique sua internet';
    case 'auth/user-disabled':
      return 'Esta conta foi desabilitada';
    case 'auth/operation-not-allowed':
      return 'Operação não permitida';
    case 'auth/invalid-credential':
      return 'Credenciais inválidas';
    default:
      return 'Erro desconhecido. Tente novamente';
  }
};
