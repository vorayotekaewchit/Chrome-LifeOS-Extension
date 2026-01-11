import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ChromeExtensionPopup } from './components/ChromeExtensionPopup';
import './globals.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ChromeExtensionPopup />
  </StrictMode>,
);
