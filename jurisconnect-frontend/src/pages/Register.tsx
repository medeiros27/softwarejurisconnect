import React, { useState } from 'react';
import { Avatar, Button, TextField, Grid, Box, Typography, Container, Alert } from '@mui/material';
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/logo';
import { register as apiRegister } from '../services/api';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await apiRegister(form.name, form.email, form.password);
      setSuccess('Cadastro realizado! Você pode acessar sua conta.');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao cadastrar');
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Logo size={100} />
        <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
          <PersonAddAltIcon />
        </Avatar>
        <Typography component="h1" variant="h5">Cadastro</Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <TextField margin="normal" required fullWidth name="name" label="Nome" value={form.name} onChange={handleChange} />
          <TextField margin="normal" required fullWidth name="email" label="E-mail" value={form.email} onChange={handleChange} />
          <TextField margin="normal" required fullWidth name="password" label="Senha" type="password" value={form.password} onChange={handleChange} />
          {error && <Alert severity="error">{error}</Alert>}
          {success && <Alert severity="success">{success}</Alert>}
          <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>Cadastrar</Button>
          <Grid container>
            <Grid item>
              <Button color="secondary" onClick={() => navigate('/login')}>Já possui conta? Acessar</Button>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Container>
  );
}