import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {AuthProvider} from './authentication/AuthContext'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './index.css'
import App from './App.jsx'
import axios from 'axios';

axios.defaults.withCredentials = true;

const queryClient = new QueryClient();

createRoot(document.getElementById('root')).render(
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <StrictMode>
        <App />
      </StrictMode>
    </AuthProvider>
  </QueryClientProvider>
)
