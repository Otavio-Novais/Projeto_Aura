import json


class TestCursoEndpoints:
    def test_list_cursos(self, authenticated_client, curso):
        response = authenticated_client.get("/api/cursos")
        assert response.status_code == 200
        data = response.json()
        assert data["count"] == 1
        assert len(data["items"]) == 1
        assert data["items"][0]["nome"] == "Engenharia"

    def test_list_cursos_pagination(self, authenticated_client, user):
        for i in range(5):
            from estudos.models import Curso
            Curso.objects.create(nome=f"Curso {i}", usuario=user)
        response = authenticated_client.get("/api/cursos?page_size=2")
        data = response.json()
        assert len(data["items"]) == 2
        assert data["count"] == 5

    def test_list_cursos_search(self, authenticated_client, user, curso):
        response = authenticated_client.get("/api/cursos?search=Eng")
        data = response.json()
        assert len(data["items"]) == 1

    def test_list_cursos_search_none(self, authenticated_client, curso):
        response = authenticated_client.get("/api/cursos?search=xyz")
        data = response.json()
        assert len(data["items"]) == 0

    def test_create_curso(self, authenticated_client, user):
        response = authenticated_client.post(
            "/api/cursos",
            data=json.dumps({"nome": "Computação"}),
            content_type="application/json",
        )
        assert response.status_code == 200
        assert response.json()["nome"] == "Computação"

    def test_update_curso(self, authenticated_client, curso):
        response = authenticated_client.put(
            f"/api/cursos/{curso.id}",
            data=json.dumps({"nome": "Eng. Civil"}),
            content_type="application/json",
        )
        assert response.status_code == 200
        assert response.json()["nome"] == "Eng. Civil"

    def test_delete_curso(self, authenticated_client, curso):
        response = authenticated_client.delete(f"/api/cursos/{curso.id}")
        assert response.status_code == 200

    def test_curso_isolamento_por_usuario(self, authenticated_client, curso_other):
        """Usuário 1 não deve ver cursos do usuário 2"""
        response = authenticated_client.get("/api/cursos")
        data = response.json()
        assert data["count"] == 0

    def test_unauthenticated_access(self, client, db):
        response = client.get("/api/cursos")
        assert response.status_code == 401


class TestDocenteEndpoints:
    def test_list_docentes(self, authenticated_client, docente):
        response = authenticated_client.get("/api/docentes")
        data = response.json()
        assert data["count"] == 1

    def test_create_docente(self, authenticated_client):
        response = authenticated_client.post(
            "/api/docentes",
            data=json.dumps({"nome": "Prof. Maria"}),
            content_type="application/json",
        )
        assert response.status_code == 200
        assert response.json()["nome"] == "Prof. Maria"

    def test_update_docente(self, authenticated_client, docente):
        response = authenticated_client.put(
            f"/api/docentes/{docente.id}",
            data=json.dumps({"nome": "Prof. Silva Jr."}),
            content_type="application/json",
        )
        assert response.status_code == 200

    def test_delete_docente(self, authenticated_client, docente):
        response = authenticated_client.delete(f"/api/docentes/{docente.id}")
        assert response.status_code == 200


class TestMateriaEndpoints:
    def test_create_materia(self, authenticated_client, curso, docente):
        response = authenticated_client.post(
            "/api/materias",
            data=json.dumps({"nome": "Física", "curso": curso.id, "docente": docente.id}),
            content_type="application/json",
        )
        assert response.status_code == 200
        assert response.json()["nome"] == "Física"

    def test_update_materia(self, authenticated_client, materia, curso, docente):
        response = authenticated_client.put(
            f"/api/materias/{materia.id}",
            data=json.dumps({"nome": "Cálculo II", "curso": curso.id, "docente": docente.id}),
            content_type="application/json",
        )
        assert response.status_code == 200

    def test_delete_materia(self, authenticated_client, materia):
        response = authenticated_client.delete(f"/api/materias/{materia.id}")
        assert response.status_code == 200

    def test_list_materias_isolamento(self, authenticated_client, materia_other):
        response = authenticated_client.get("/api/materias")
        assert response.json()["count"] == 0


class TestAvaliacaoEndpoints:
    def test_create_avaliacao(self, authenticated_client, materia):
        response = authenticated_client.post(
            "/api/avaliacoes",
            data=json.dumps({
                "nome": "Prova Final",
                "materia_id": materia.id,
                "data_avaliacao": "2026-12-20",
                "peso": 2.0,
                "tipo_avaliacao": "Prova",
                "nota_maxima": 10.0,
                "nota_obtida": 7.0,
            }),
            content_type="application/json",
        )
        assert response.status_code == 200

    def test_create_avaliacao_materia_inexistente(self, authenticated_client):
        response = authenticated_client.post(
            "/api/avaliacoes",
            data=json.dumps({
                "nome": "Prova", "materia_id": 9999, "data_avaliacao": "2026-01-01",
                "peso": 1.0, "tipo_avaliacao": "Prova", "nota_maxima": 10.0, "nota_obtida": 5.0,
            }),
            content_type="application/json",
        )
        assert response.status_code == 404

    def test_delete_avaliacao(self, authenticated_client, avaliacao):
        response = authenticated_client.delete(f"/api/avaliacoes/{avaliacao.id}")
        assert response.status_code == 200


class TestFaltaEndpoints:
    def test_create_falta(self, authenticated_client, materia):
        response = authenticated_client.post(
            f"/api/materias/{materia.id}/faltas",
            data=json.dumps({"materia": materia.id, "quantidade": 3}),
            content_type="application/json",
        )
        assert response.status_code == 200
        assert response.json()["quantidade"] == 3

    def test_list_faltas(self, authenticated_client, materia):
        from estudos.models import Falta
        Falta.objects.create(materia=materia, quantidade=1)
        Falta.objects.create(materia=materia, quantidade=2)
        response = authenticated_client.get(f"/api/materias/{materia.id}/faltas")
        data = response.json()
        assert data["count"] == 2

    def test_update_falta(self, authenticated_client, materia):
        from estudos.models import Falta
        falta = Falta.objects.create(materia=materia, quantidade=1)
        response = authenticated_client.put(
            f"/api/faltas/{falta.id}",
            data=json.dumps({"materia": materia.id, "quantidade": 5}),
            content_type="application/json",
        )
        assert response.status_code == 200
        assert response.json()["quantidade"] == 5

    def test_delete_falta(self, authenticated_client, materia):
        from estudos.models import Falta
        falta = Falta.objects.create(materia=materia, quantidade=1)
        response = authenticated_client.delete(f"/api/faltas/{falta.id}")
        assert response.status_code == 200


class TestTopicoEndpoints:
    def test_create_topico(self, authenticated_client, materia, tecnica):
        response = authenticated_client.post(
            "/api/topicos",
            data=json.dumps({
                "nome": "Integrais",
                "materia_id": materia.id,
                "tecnica_estudo_id": tecnica.id,
                "data_estimada": "2026-12-01",
                "data_esperada": "2026-12-10",
                "estudou": False,
                "importancia": "Alta",
            }),
            content_type="application/json",
        )
        assert response.status_code == 200

    def test_delete_topico(self, authenticated_client, topico):
        response = authenticated_client.delete(f"/api/topicos/{topico.id}")
        assert response.status_code == 200


class TestLembreteEndpoints:
    def test_create_lembrete(self, authenticated_client, avaliacao):
        response = authenticated_client.post(
            "/api/lembretes",
            data=json.dumps({
                "nome": "Lembrete de prova",
                "descricao": "Não esquecer calculadora",
                "avaliacao_id": avaliacao.id,
                "data_lembrete": "2026-12-14",
            }),
            content_type="application/json",
        )
        assert response.status_code == 200

    def test_delete_lembrete(self, authenticated_client, lembrete):
        response = authenticated_client.delete(f"/api/lembretes/{lembrete.id}")
        assert response.status_code == 200


class TestTecnicaEstudoEndpoints:
    def test_create_tecnica(self, authenticated_client):
        response = authenticated_client.post(
            "/api/tecnicas-estudo",
            data=json.dumps({"nome": "Mapa Mental", "descricao": "Técnica visual"}),
            content_type="application/json",
        )
        assert response.status_code == 200

    def test_list_tecnicas(self, authenticated_client, tecnica):
        response = authenticated_client.get("/api/tecnicas-estudo")
        assert response.json()["count"] == 1

    def test_delete_tecnica(self, authenticated_client, tecnica):
        response = authenticated_client.delete(f"/api/tecnicas-estudo/{tecnica.id}")
        assert response.status_code == 200
