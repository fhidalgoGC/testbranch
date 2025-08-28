import { useState } from 'react';
import { useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { login as loginAction, logout as logoutAction } from '../slices/authSlice';
import { useLoginMutation, useGetIdentityQuery } from '../services/authApi';
import { useToast } from '@/hooks/use-toast';

export const useAuth = () => {
  const [, setLocation] = useLocation();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const { toast } = useToast();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const [loginMutation] = useLoginMutation();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setError(null);
      setIsLoading(true);
      const result = await loginMutation({ email, password }).unwrap();
      
      // Store tokens in localStorage
      localStorage.setItem('jwt', result.id_token);
      localStorage.setItem('id_token', result.id_token); // Also store as id_token for characteristics endpoint
      localStorage.setItem('refresh_token', result.refresh_token);
      localStorage.setItem('access_token', result.access_token);
      
      // After successful login, fetch user identity
      const baseUrl = import.meta.env.VITE_URL_IDENTITY || 'https://un4grlwfx2.execute-api.us-west-2.amazonaws.com/dev';
      const identityUrl = `${baseUrl}/identity/customers`;
      console.log('Identity URL:', identityUrl);
      console.log('Environment variable VITE_URL_IDENTITY:', import.meta.env.VITE_URL_IDENTITY);
      
      const identityResponse = await fetch(identityUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${result.id_token}`,
        },
      });

      if (identityResponse.ok) {
        const identityData = await identityResponse.json();
        
        // Store user data in localStorage
        localStorage.setItem('user_name', identityData.data.firstName);
        localStorage.setItem('user_lastname', identityData.data.lastName);
        localStorage.setItem('user_id', identityData.data.id);
        localStorage.setItem('customer_id', identityData.data.id); // Store customer_id for organization service
        localStorage.setItem('user_email', identityData.data.email);
        
        // Third endpoint: Get partition keys
        const partitionKeysUrl = `${baseUrl}/identity/v2/customers/${identityData.data.id}/partition_keys`;
        console.log('Partition Keys URL:', partitionKeysUrl);
        
        const partitionKeysResponse = await fetch(partitionKeysUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${result.id_token}`,
          },
        });

        if (partitionKeysResponse.ok) {
          const partitionKeysData = await partitionKeysResponse.json();
          
          // Store partition key from the first object in the array
          let partitionKey = '';
          if (partitionKeysData.data && partitionKeysData.data.length > 0) {
            partitionKey = partitionKeysData.data[0].partitionKey;
            localStorage.setItem('partition_key', partitionKey);
          }
          
          // Fourth endpoint: Get organization information
          const crmBaseUrl = import.meta.env.VITE_URL_CRM || 'https://crm-develop.grainchain.io/api/v1';
          const organizationUrl = `${crmBaseUrl}/mngm-organizations/organizations?filter={"_partitionKey":{"$in":["${partitionKey}"]}}`;
          console.log('Organization URL:', organizationUrl);
          
          const organizationResponse = await fetch(organizationUrl, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${result.id_token}`,
            },
          });

          if (organizationResponse.ok) {
            const organizationData = await organizationResponse.json();
            
            // Extract representative_people_id from the first organization's extras
            let representativePeopleId = '';
            if (organizationData.data && organizationData.data.length > 0) {
              const firstOrg = organizationData.data[0];
              if (firstOrg.extras && Array.isArray(firstOrg.extras)) {
                const representativeExtra = firstOrg.extras.find((extra: any) => extra.key === 'representativePeople_id');
                if (representativeExtra && representativeExtra.values && representativeExtra.values.length > 0) {
                  representativePeopleId = representativeExtra.values[0].value;
                  localStorage.setItem('representative_people_id', representativePeopleId);
                }
              }
              
              // Store organization information in localStorage with company_ prefix
              if (firstOrg.business_name) {
                localStorage.setItem('company_business_name', firstOrg.business_name);
              }
              if (firstOrg.business_type) {
                localStorage.setItem('company_business_type', firstOrg.business_type);
              }
              if (firstOrg.phones && firstOrg.phones.length > 0) {
                if (firstOrg.phones[0].calling_code) {
                  localStorage.setItem('company_calling_code', firstOrg.phones[0].calling_code);
                }
                if (firstOrg.phones[0].phone_number) {
                  localStorage.setItem('company_phone_number', firstOrg.phones[0].phone_number);
                }
              }
              if (firstOrg.addresses && firstOrg.addresses.length > 0 && firstOrg.addresses[0].line) {
                localStorage.setItem('company_address_line', firstOrg.addresses[0].line);
              }
            }
            
            // Fifth endpoint: Get representative people information
            const peopleUrl = `${crmBaseUrl}/crm-people/people/${representativePeopleId}`;
            console.log('People URL:', peopleUrl);
            
            const peopleResponse = await fetch(peopleUrl, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('jwt')}`,
                '_partitionkey': partitionKey,
              },
            });

            if (peopleResponse.ok) {
              const peopleData = await peopleResponse.json();
              
              // Store representative people information in localStorage
              if (peopleData.data) {
                localStorage.setItem('representative_people_full_name', peopleData.data.full_name);
                localStorage.setItem('representative_people_first_name', peopleData.data.first_name);
                localStorage.setItem('representative_people_last_name', peopleData.data.last_name);
                
                // Store email from first email object
                if (peopleData.data.emails && peopleData.data.emails.length > 0) {
                  localStorage.setItem('representative_people_email', peopleData.data.emails[0].value);
                }
                
                // Store phone information from first phone object
                if (peopleData.data.phones && peopleData.data.phones.length > 0) {
                  localStorage.setItem('representative_people_calling_code', peopleData.data.phones[0].calling_code);
                  localStorage.setItem('representative_people_phone_number', peopleData.data.phones[0].phone_number);
                }
              }
              
              // Update Redux state
              dispatch(loginAction({
                user: { 
                  email: identityData.data.email,
                  name: `${identityData.data.firstName} ${identityData.data.lastName}`,
                },
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
            } else {
              throw new Error('Failed to fetch representative people information');
            }
          } else {
            throw new Error('Failed to fetch organization information');
          }
        } else {
          throw new Error('Failed to fetch partition keys');
        }
      } else {
        throw new Error('Failed to fetch user identity');
      }
    } catch (err: any) {
      const errorMessage = err?.data?.error_description || err?.message || t('loginError');
      setError(errorMessage);
      toast({
        title: t('loginErrorTitle'),
        description: errorMessage,
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    // Clear tokens from localStorage
    localStorage.removeItem('jwt');
    localStorage.removeItem('id_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('access_token');
    
    // Clear user data from localStorage
    localStorage.removeItem('user_name');
    localStorage.removeItem('user_lastname');
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_email');
    localStorage.removeItem('partition_key');
    localStorage.removeItem('representative_people_id');
    localStorage.removeItem('representative_people_full_name');
    localStorage.removeItem('representative_people_first_name');
    localStorage.removeItem('representative_people_last_name');
    localStorage.removeItem('representative_people_email');
    localStorage.removeItem('representative_people_calling_code');
    localStorage.removeItem('representative_people_phone_number');
    
    // Clear company data from localStorage
    localStorage.removeItem('company_business_name');
    localStorage.removeItem('company_business_type');
    localStorage.removeItem('company_calling_code');
    localStorage.removeItem('company_phone_number');
    localStorage.removeItem('company_address_line');
    
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
