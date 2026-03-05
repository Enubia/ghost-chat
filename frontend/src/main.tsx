import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './App';

// oxlint-disable-next-line import/no-unassigned-import
import './i18n';
// oxlint-disable-next-line import/no-unassigned-import
import './index.css';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <App />
    </StrictMode>
);
