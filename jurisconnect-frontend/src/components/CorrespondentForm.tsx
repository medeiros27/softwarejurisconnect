import React, { useState } from 'react';
import { Box, TextField, Button, Alert } from '@mui/material';
import { createCorrespondent } from '../services/api';

export default function CorrespondentForm() {
  const [form, setForm] = useState({ name: '', cpf: '' });
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
      await createCorrespondent(form.name, form.cpf);
      setSuccess('Correspondente criado com sucesso!');
      setForm({ name: '', cpf: '' });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao criar correspondente');
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mb: 2 }}>
      <TextField
        label="Nome do correspondente"
        name="name"
        value={form.name}
        onChange={handleChange}
        required
        sx={{ mr: 2 }}
      />
      <TextField
        label="CPF"
        name="cpf"
        value={form.cpf}
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