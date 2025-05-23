import React, { useEffect, useState } from 'react';
import { getCompanies } from '../services/api';
import { List, ListItem, ListItemText, Paper, Typography } from '@mui/material';

type Company = {
  _id: string;
  name: string;
  cnpj: string;
};

export default function CompanyList() {
  const [companies, setCompanies] = useState<Company[]>([]);

  useEffect(() => {
    getCompanies().then(setCompanies);
  }, []);

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>Lista de Empresas</Typography>
      <List>
        {companies.map((company) => (
          <ListItem key={company._id}>
            <ListItemText
              primary={company.name}
              secondary={`CNPJ: ${company.cnpj}`}
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
}