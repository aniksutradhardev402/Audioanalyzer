// src/router.tsx
import { createBrowserRouter } from 'react-router-dom';
import { UploadPage } from './pages/UploadPage';
import { AnalysisPage } from './pages/AnalysisPage';
//import { MockAnalysisPage } from './pages/MockAnalysisPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <UploadPage />,
  },
  {
    path: '/track/:taskId',
    element: <AnalysisPage />,
  },
 
]);
