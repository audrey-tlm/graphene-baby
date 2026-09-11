import '@gravitee/graphene-core/fonts';
import './app.css'; // app Tailwind entry — first
import '@gravitee/graphene-core/styles'; // pre-built Graphene CSS — last

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
