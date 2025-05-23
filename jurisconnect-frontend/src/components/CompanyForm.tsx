import React, { useState } from 'react';
import { Box, TextField, Button, Alert } from '@mui/material';
import { createCompany } from '../services/api';

export default function CompanyForm() {
  const [form, setForm] = useState({ name: '', cnpj: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await createCompany(form.name, form.cnpj);
      setSuccess('Empresa criada com sucesso!');
      setForm({ name: '', cnpj: '' });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao criar empresa');
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mb: 2 }}>
      <TextField
        label="Nome da empresa"
        name="name"
        value={form.name}
        onChange={handleChange}
        required
        sx={{ mr: 2 }}
      />
      <TextField
        label="CNPJ"
        name="cnpj"
        value={form.cnpj}
        onChange={handleChange}
        required
        sx={{ mr: 2 }}
      />
      <Button type="submit" variant="contained">Criar</Button>
      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
    </Box>
  );
}