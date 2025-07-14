import { useState } from 'react';
import { useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { login as loginAction, logout as logoutAction } from '../slices/authSlice';
import { useLoginMutation } from '../services/authApi';
import { useToast } from '@/hooks/use-toast';

export const useAuth = () => {
  const [, setLocation] = useLocation();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const { toast } = useToast();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const [loginMutation, { isLoading }] = useLoginMutation();
  const [error, setError] = useState<string | null>(null);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setError(null);
      const result = await loginMutation({ email, password }).unwrap();
      
      // Store tokens in localStorage
      localStorage.setItem('jwt', result.id_token);
      localStorage.setItem('refresh_token', result.refresh_token);
      localStorage.setItem('access_token', result.access_token);
      
      // Update Redux state
      dispatch(loginAction({
        user: { email },
        tokens: {
          accessToken: result.access_token,
          refreshToken: result.refresh_token,
          idToken: result.id_token,
        },
      }));

      toast({
        title: t('loginSuccess'),
        description: t('loginSuccessMessage'),
      });

      setTimeout(() => {
        setLocation('/home');
      }, 1000);

      return true;
    } catch (err: any) {
      const errorMessage = err?.data?.error_description || err?.message || t('loginError');
      setError(errorMessage);
      toast({
        title: t('loginErrorTitle'),
        description: errorMessage,
        variant: 'destructive',
      });
      return false;
    }
  };

  const logout = () => {
    // Clear tokens from localStorage
    localStorage.removeItem('jwt');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('access_token');
    
    // Update Redux state
    dispatch(logoutAction());
    
    toast({
      title: t('logoutSuccess'),
      description: t('logoutSuccessMessage'),
    });
    
    setLocation('/');
  };

  return {
    login,
    logout,
    isLoading,
    error,
    isAuthenticated,
    user,
  };
};
