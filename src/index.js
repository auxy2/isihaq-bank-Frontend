import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // Ensure the path is correct
import { UserProvider } from '../src/Component';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <UserProvider>
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </UserProvider>
);
