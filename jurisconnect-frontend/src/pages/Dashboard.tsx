import React from 'react';
import { Typography, Box, Grid, Paper } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import Logo from '../components/logo';

export default function Dashboard() {
  const { user } = useAuthContext();

  return (
    <Box sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, justifyContent: 'center' }}>
        <Logo size={80} />
      </Box>
      <Typography variant="h4" gutterBottom>
        Olá, {user?.name || 'Usuário'}!
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        Bem-vindo ao painel do JurisConnect.
      </Typography>
      <Grid container spacing={2} sx={{ mt: 2 }}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6">Empresas</Typography>
            <Typography variant="body2">Visualize e gerencie empresas cadastradas.</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6">Correspondentes</Typography>
            <Typography variant="body2">Gerencie correspondentes jurídicos.</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6">Solicitações de Serviço</Typography>
            <Typography variant="body2">Acompanhe e crie novas solicitações.</Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}