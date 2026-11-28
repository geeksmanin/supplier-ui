import React, { useState } from 'react';
import { useMediaQuery, apiClient } from '@geeksman/core-ui';
import { TenantSetupDesktop } from './TenantSetup.desktop';
import { TenantSetupMobile } from './TenantSetup.mobile';

export const TenantSetup: React.FC = () => {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [workspace, setWorkspace] = useState('');
  const [service, setService] = useState('crm'); // crm, tms, erp
  const [adminPassword, setAdminPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      if (!code || !name || !phone || !email || !workspace || !service || !adminPassword) {
        throw new Error('Please fill in all fields');
      }

      await apiClient.post('/tenant', {
        code,
        name,
        phone,
        email,
        workspace,
        service,
        admin_password: adminPassword,
      });

      setSuccess(true);
      // Reset form
      setCode('');
      setName('');
      setPhone('');
      setEmail('');
      setWorkspace('');
      setAdminPassword('');
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.message ||
        err.message ||
        'Registration failed. Please make sure tenant code or workspace code is unique.'
      );
    } finally {
      setLoading(false);
    }
  };

  const props = {
    code,
    setCode,
    name,
    setName,
    phone,
    setPhone,
    email,
    setEmail,
    workspace,
    setWorkspace,
    service,
    setService,
    adminPassword,
    setAdminPassword,
    loading,
    success,
    error,
    onSubmit: handleSubmit,
  };

  return isDesktop ? <TenantSetupDesktop {...props} /> : <TenantSetupMobile {...props} />;
};
