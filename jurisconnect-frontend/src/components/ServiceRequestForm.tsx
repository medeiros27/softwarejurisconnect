import React, { useState } from 'react';
import { Box, TextField, Button, Alert } from '@mui/material';
import { createServiceRequest } from '../services/api';

export default function ServiceRequestForm() {
  const [form, setForm] = useState({ title: '', description: '' });
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
      await createServiceRequest(form.title, form.description);
      setSuccess('Solicitação criada com sucesso!');
      setForm({ title: '', description: '' });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao criar solicitação');
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mb: 2 }}>
      <TextField
        label="Título"
        name="title"
        value={form.title}
        onChange={handleChange}
        required
        sx={{ mr: 2 }}
      />
      <TextField
        label="Descrição"
        name="description"
        value={form.description}
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