import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Renderização com React 18+
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Para medir performance, passe uma função para logar resultados
// Exemplo: reportWebVitals(console.log);
