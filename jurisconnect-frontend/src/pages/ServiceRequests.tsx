import React from 'react';
import { Box, Typography, Container, Paper } from '@mui/material';
import ServiceRequestList from '../components/ServiceRequestList';
import ServiceRequestForm from '../components/ServiceRequestForm';

export default function ServiceRequests() {
  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Solicitações de Serviço</Typography>
      <Paper sx={{ p: 3, mb: 3 }}>
        <ServiceRequestForm />
      </Paper>
      <ServiceRequestList />
    </Container>
  );
}