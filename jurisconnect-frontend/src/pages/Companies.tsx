import React from 'react';
import { Box, Typography, Container, Paper } from '@mui/material';
import CompanyList from '../components/CompanyList';
import CompanyForm from '../components/CompanyForm';

export default function Companies() {
  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Empresas</Typography>
      <Paper sx={{ p: 3, mb: 3 }}>
        <CompanyForm />
      </Paper>
      <CompanyList />
    </Container>
  );
}