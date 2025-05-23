import React from 'react';
import { Box, Typography, Container, Paper } from '@mui/material';
import CorrespondentList from '../components/CorrespondentList';
import CorrespondentForm from '../components/CorrespondentForm';

export default function Correspondents() {
  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Correspondentes</Typography>
      <Paper sx={{ p: 3, mb: 3 }}>
        <CorrespondentForm />
      </Paper>
      <CorrespondentList />
    </Container>
  );
}