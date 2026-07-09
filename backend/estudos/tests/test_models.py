import pytest
from django.contrib.auth.models import User
from django.db import IntegrityError
from estudos.models import Curso, Docente, Materia, Falta, TecnicaEstudo, Topico, Avaliacao, Lembrete


class TestCurso:
    def test_criar_curso(self, curso):
        assert curso.nome == "Engenharia"
        assert curso.usuario.username == "testuser"
        assert str(curso) == "Engenharia"

    def test_curso_requer_usuario(self, db):
        with pytest.raises(IntegrityError):
            Curso.objects.create(nome="Sem dono")

    def test_nome_max_length(self, db, user):
        curso = Curso.objects.create(nome="A" * 150, usuario=user)
        assert len(curso.nome) == 150


class TestDocente:
    def test_criar_docente(self, docente):
        assert docente.nome == "Prof. Silva"
        assert str(docente) == "Prof. Silva"

    def test_docente_sem_user_fk(self, db):
        docente = Docente.objects.create(nome="Prof. João")
        assert docente.id is not None


class TestMateria:
    def test_criar_materia(self, materia, curso, docente):
        assert materia.nome == "Cálculo I"
        assert materia.curso == curso
        assert materia.docente == docente
        assert str(materia) == "Cálculo I"

    def test_materia_sem_curso_falha(self, db, docente):
        with pytest.raises(IntegrityError):
            Materia.objects.create(nome="Sem curso", docente=docente)

    def test_materia_com_related_name(self, curso, docente):
        m = Materia.objects.create(nome="Física", curso=curso, docente=docente)
        assert curso.materias.count() == 1
        assert docente.materias.count() == 1
        assert curso.materias.first() == m


class TestFalta:
    def test_criar_falta(self, materia):
        falta = Falta.objects.create(materia=materia, quantidade=2)
        assert falta.materia == materia
        assert falta.quantidade == 2
        assert "2 faltas" in str(falta)
        assert materia.faltas.count() == 1


class TestTecnicaEstudo:
    def test_criar_tecnica(self, tecnica):
        assert tecnica.nome == "Pomodoro"
        assert tecnica.descricao == "Técnica de foco"
        assert str(tecnica) == "Pomodoro"


class TestTopico:
    def test_criar_topico(self, topico, materia, tecnica):
        assert topico.nome == "Derivadas"
        assert topico.materia == materia
        assert topico.tecnica_estudo == tecnica
        assert topico.estudou is False
        assert topico.importancia == "Alta"
        assert materia.topicos.count() == 1

    def test_importancia_invalida_via_full_clean(self, db, materia, tecnica):
        from django.core.exceptions import ValidationError
        topico = Topico(
            nome="Tópico inválido",
            materia=materia,
            tecnica_estudo=tecnica,
            data_estimada="2026-01-01",
            data_esperada="2026-01-10",
            importancia="Inexistente",
        )
        with pytest.raises(ValidationError):
            topico.full_clean()


class TestAvaliacao:
    def test_criar_avaliacao(self, avaliacao, materia):
        assert avaliacao.nome == "Prova 1"
        assert avaliacao.nota_obtida == 8.5
        assert avaliacao.tipo_avaliacao == "Prova"
        assert materia.avaliacoes.count() == 1


class TestLembrete:
    def test_criar_lembrete(self, lembrete, avaliacao):
        assert lembrete.nome == "Estudar para Prova 1"
        assert lembrete.avaliacao == avaliacao
        assert avaliacao.lembretes.count() == 1

    def test_cascade_delete_avaliacao_deleta_lembrete(self, avaliacao, lembrete):
        assert Lembrete.objects.count() == 1
        avaliacao.delete()
        assert Lembrete.objects.count() == 0
