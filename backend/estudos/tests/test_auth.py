import json


class TestAuthRegister:
    def test_register_success(self, client, db):
        response = client.post(
            "/api/auth/register",
            data=json.dumps({"username": "novouser", "password": "senha123"}),
            content_type="application/json",
        )
        assert response.status_code == 201
        data = response.json()
        assert data["username"] == "novouser"

    def test_register_duplicate_username(self, client, db):
        client.post(
            "/api/auth/register",
            data=json.dumps({"username": "dup", "password": "senha123"}),
            content_type="application/json",
        )
        response = client.post(
            "/api/auth/register",
            data=json.dumps({"username": "dup", "password": "senha123"}),
            content_type="application/json",
        )
        assert response.status_code == 400

    def test_register_short_password(self, client, db):
        response = client.post(
            "/api/auth/register",
            data=json.dumps({"username": "user", "password": "123"}),
            content_type="application/json",
        )
        assert response.status_code == 400

    def test_register_short_username(self, client, db):
        response = client.post(
            "/api/auth/register",
            data=json.dumps({"username": "ab", "password": "senha123"}),
            content_type="application/json",
        )
        assert response.status_code == 400


class TestAuthLogin:
    def test_login_success(self, client, user, db):
        response = client.post(
            "/api/auth/login",
            data=json.dumps({"username": "testuser", "password": "testpass123"}),
            content_type="application/json",
        )
        assert response.status_code == 200
        assert response.json()["username"] == "testuser"

    def test_login_invalid_password(self, client, user, db):
        response = client.post(
            "/api/auth/login",
            data=json.dumps({"username": "testuser", "password": "errada"}),
            content_type="application/json",
        )
        assert response.status_code == 401

    def test_login_nonexistent_user(self, client, db):
        response = client.post(
            "/api/auth/login",
            data=json.dumps({"username": "fantasma", "password": "123456"}),
            content_type="application/json",
        )
        assert response.status_code == 401


class TestAuthMe:
    def test_me_authenticated(self, authenticated_client, user):
        response = authenticated_client.get("/api/auth/me")
        assert response.status_code == 200
        assert response.json()["username"] == "testuser"

    def test_me_unauthenticated(self, client, db):
        response = client.get("/api/auth/me")
        assert response.status_code == 401


class TestAuthLogout:
    def test_logout_authenticated(self, authenticated_client):
        response = authenticated_client.post(
            "/api/auth/logout",
            data=json.dumps({}),
            content_type="application/json",
        )
        assert response.status_code == 200
        # after logout, /auth/me should fail
        response2 = authenticated_client.get("/api/auth/me")
        assert response2.status_code == 401

    def test_logout_unauthenticated(self, client, db):
        response = client.post(
            "/api/auth/logout",
            data=json.dumps({}),
            content_type="application/json",
        )
        assert response.status_code == 401
