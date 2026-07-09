from ninja import Router, Schema
from ninja.security import django_auth
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.db import IntegrityError

router = Router(tags=["Autenticação"])


class LoginIn(Schema):
    username: str
    password: str


class UserOut(Schema):
    id: int
    username: str
    email: str | None = None


class RegisterIn(Schema):
    username: str
    password: str
    email: str | None = None


class ErrorOut(Schema):
    detail: str


class UpdateProfileIn(Schema):
    email: str | None = None


class ChangePasswordIn(Schema):
    current_password: str
    new_password: str


@router.post("/login", response={200: UserOut, 401: ErrorOut})
def login_view(request, payload: LoginIn):
    user = authenticate(request, username=payload.username, password=payload.password)
    if user is not None:
        login(request, user)
        return 200, {
            "id": user.id,
            "username": user.username,
            "email": user.email,
        }
    return 401, {"detail": "Credenciais inválidas"}


@router.post("/logout", auth=django_auth, response={200: ErrorOut})
def logout_view(request):
    logout(request)
    return {"detail": "Logout realizado com sucesso"}


@router.get("/me", auth=django_auth, response=UserOut)
def me(request):
    return {
        "id": request.user.id,
        "username": request.user.username,
        "email": request.user.email,
    }


@router.post("/register", response={201: UserOut, 400: ErrorOut})
def register(request, payload: RegisterIn):
    if len(payload.username) < 3:
        return 400, {"detail": "Nome de usuário deve ter pelo menos 3 caracteres"}
    if len(payload.password) < 6:
        return 400, {"detail": "Senha deve ter pelo menos 6 caracteres"}
    if User.objects.filter(username=payload.username).exists():
        return 400, {"detail": "Nome de usuário já está em uso"}

    try:
        user = User.objects.create_user(
            username=payload.username,
            password=payload.password,
            email=payload.email or "",
        )
        return 201, {
            "id": user.id,
            "username": user.username,
            "email": user.email,
        }
    except IntegrityError:
        return 400, {"detail": "Erro ao criar usuário"}


@router.put("/profile", auth=django_auth, response={200: UserOut, 400: ErrorOut})
def update_profile(request, payload: UpdateProfileIn):
    if payload.email is not None:
        request.user.email = payload.email
        request.user.save()
    return {
        "id": request.user.id,
        "username": request.user.username,
        "email": request.user.email,
    }


@router.post("/change-password", auth=django_auth, response={200: ErrorOut, 400: ErrorOut})
def change_password(request, payload: ChangePasswordIn):
    if not request.user.check_password(payload.current_password):
        return 400, {"detail": "Senha atual incorreta"}
    if len(payload.new_password) < 6:
        return 400, {"detail": "Nova senha deve ter pelo menos 6 caracteres"}
    request.user.set_password(payload.new_password)
    request.user.save()
    return {"detail": "Senha alterada com sucesso"}
