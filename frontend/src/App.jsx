import { useState, useEffect } from 'react';

function App() {
  // 1. A Memória: Começamos com uma lista vazia de cursos
  const [cursos, setCursos] = useState([]);
  const [erro, setErro] = useState(null);

  // 2. A Função que bate na nossa API
  const carregarCursos = async () => {
    try {
      // O Detalhe Sênior: credentials 'include' manda o cookie do Django Admin!
      const resposta = await fetch('http://localhost:8000/api/cursos', {
        credentials: 'include',
      });

      if (!resposta.ok) {
        throw new Error(
          `Erro ${resposta.status}: Você esqueceu de logar no Django Admin?`
        );
      }

      const dados = await resposta.json();
      setCursos(dados); // Salvamos os dados na Memória (o React redesenha a tela aqui!)
    } catch (err) {
      setErro(err.message);
    }
  };

  // 3. A Ação: Roda a função carregarCursos apenas UMA vez quando a tela abre
  useEffect(() => {
    carregarCursos();
  }, []);

  // 4. O Visual: Desenhando o HTML com os dados
  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Meus Cursos 📚</h1>

      {/* Se der erro, mostraremos em vermelho */}
      {erro && <p style={{ color: 'red' }}>{erro}</p>}

      {/* Se a lista estiver vazia e não tiver erro */}
      {cursos.length === 0 && !erro && (
        <p>Carregando ou nenhum curso encontrado...</p>
      )}

      {/* O Loop do React (.map) que substitui o 'for' do Python no HTML */}
      <ul>
        {cursos.map((curso) => (
          <li key={curso.id} style={{ marginBottom: '10px' }}>
            <strong>{curso.nome}</strong>
            <br />
            <small style={{ color: 'gray' }}>
              ID: {curso.id} | Adicionado em: {curso.data_entrada}
            </small>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
