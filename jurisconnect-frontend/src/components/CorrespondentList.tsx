import React, { useEffect, useState } from 'react';
import { getCorrespondents } from '../services/api';
import { List, ListItem, ListItemText, Paper, Typography } from '@mui/material';

type Correspondent = {
  _id: string;
  name: string;
  cpf: string;
};

export default function CorrespondentList() {
  const [correspondents, setCorrespondents] = useState<Correspondent[]>([]);

  useEffect(() => {
    getCorrespondents().then(setCorrespondents);
  }, []);

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>Lista de Correspondentes</Typography>
      <List>
        {correspondents.map((correspondent) => (
          <ListItem key={correspondent._id}>
            <ListItemText
              primary={correspondent.name}
              secondary={`CPF: ${correspondent.cpf}`}
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
}