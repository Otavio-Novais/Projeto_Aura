import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import DashboardPage from './pages/DashboardPage'
import CursosPage from './pages/CursosPage'
import DocentesPage from './pages/DocentesPage'
import MateriasPage from './pages/MateriasPage'
import AvaliacoesPage from './pages/AvaliacoesPage'
import TopicosPage from './pages/TopicosPage'
import FaltasPage from './pages/FaltasPage'
import LembretesPage from './pages/LembretesPage'
import TecnicasEstudoPage from './pages/TecnicasEstudoPage'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/cursos" element={<CursosPage />} />
        <Route path="/docentes" element={<DocentesPage />} />
        <Route path="/materias" element={<MateriasPage />} />
        <Route path="/avaliacoes" element={<AvaliacoesPage />} />
        <Route path="/topicos" element={<TopicosPage />} />
        <Route path="/faltas" element={<FaltasPage />} />
        <Route path="/lembretes" element={<LembretesPage />} />
        <Route path="/tecnicas-estudo" element={<TecnicasEstudoPage />} />
      </Routes>
    </Layout>
  )
}
