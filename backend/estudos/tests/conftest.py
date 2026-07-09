import pytest
from django.contrib.auth.models import User
from estudos.models import Curso, Docente, Materia, Falta, TecnicaEstudo, Topico, Avaliacao, Lembrete


@pytest.fixture
def user(db):
    return User.objects.create_user(username="testuser", password="testpass123")


@pytest.fixture
def user2(db):
    return User.objects.create_user(username="otheruser", password="testpass123")


@pytest.fixture
def curso(user):
    return Curso.objects.create(nome="Engenharia", usuario=user)


@pytest.fixture
def curso_other(user2):
    return Curso.objects.create(nome="Medicina", usuario=user2)


@pytest.fixture
def docente(db):
    return Docente.objects.create(nome="Prof. Silva")


@pytest.fixture
def materia(curso, docente):
    return Materia.objects.create(nome="Cálculo I", curso=curso, docente=docente)


@pytest.fixture
def materia_other(curso_other, docente):
    return Materia.objects.create(nome="Anatomia", curso=curso_other, docente=docente)


@pytest.fixture
def tecnica(db):
    return TecnicaEstudo.objects.create(nome="Pomodoro", descricao="Técnica de foco")


@pytest.fixture
def topico(materia, tecnica):
    return Topico.objects.create(
        nome="Derivadas",
        materia=materia,
        tecnica_estudo=tecnica,
        data_estimada="2026-12-01",
        data_esperada="2026-12-10",
        estudou=False,
        importancia="Alta",
    )


@pytest.fixture
def avaliacao(materia):
    return Avaliacao.objects.create(
        nome="Prova 1",
        materia=materia,
        data_avaliacao="2026-12-15",
        peso=1.0,
        nota_maxima=10.0,
        nota_obtida=8.5,
        tipo_avaliacao="Prova",
    )


@pytest.fixture
def lembrete(avaliacao):
    return Lembrete.objects.create(
        nome="Estudar para Prova 1",
        descricao="Revisar capítulos 1-5",
        data_lembrete="2026-12-10",
        avaliacao=avaliacao,
    )


@pytest.fixture
def authenticated_client(client, user):
    client.login(username="testuser", password="testpass123")
    return client


@pytest.fixture
def authenticated_client2(client, user2):
    client.login(username="otheruser", password="testpass123")
    return client
