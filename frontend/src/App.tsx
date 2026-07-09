import { Routes, Route, Outlet } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';
import { ErrorBoundary } from './components/ErrorBoundary';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import CursosPage from './pages/CursosPage';
import DocentesPage from './pages/DocentesPage';
import MateriasPage from './pages/MateriasPage';
import AvaliacoesPage from './pages/AvaliacoesPage';
import TopicosPage from './pages/TopicosPage';
import FaltasPage from './pages/FaltasPage';
import LembretesPage from './pages/LembretesPage';
import TecnicasEstudoPage from './pages/TecnicasEstudoPage';

function AppLayout() {
  return (
    <ProtectedRoute>
      <Layout>
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </Layout>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route element={<AppLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="/cursos" element={<CursosPage />} />
            <Route path="/docentes" element={<DocentesPage />} />
            <Route path="/materias" element={<MateriasPage />} />
            <Route path="/avaliacoes" element={<AvaliacoesPage />} />
            <Route path="/topicos" element={<TopicosPage />} />
            <Route path="/faltas" element={<FaltasPage />} />
            <Route path="/lembretes" element={<LembretesPage />} />
            <Route path="/tecnicas-estudo" element={<TecnicasEstudoPage />} />
          </Route>
        </Routes>
      </ToastProvider>
    </AuthProvider>
  );
}
