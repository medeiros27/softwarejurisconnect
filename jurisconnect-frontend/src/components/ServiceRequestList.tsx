import React, { useEffect, useState } from 'react';
import { getServiceRequests } from '../services/api';
import { List, ListItem, ListItemText, Paper, Typography } from '@mui/material';

type ServiceRequest = {
  _id: string;
  title: string;
  description: string;
};

export default function ServiceRequestList() {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);

  useEffect(() => {
    getServiceRequests().then(setRequests);
  }, []);

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>Lista de Solicitações</Typography>
      <List>
        {requests.map((r) => (
          <ListItem key={r._id}>
            <ListItemText
              primary={r.title}
              secondary={r.description}
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
}