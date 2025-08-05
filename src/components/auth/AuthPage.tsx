import React, { useState } from 'react';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';

interface AuthPageProps {
  onSuccess?: () => void;
}

export function AuthPage({ onSuccess }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="w-full max-w-md">
        {isLogin ? (
          <LoginForm
            onSuccess={onSuccess}
            onRegisterClick={() => setIsLogin(false)}
          />
        ) : (
          <RegisterForm
            onSuccess={onSuccess}
            onLoginClick={() => setIsLogin(true)}
          />
        )}
      </div>
    </div>
  );
}
