from .routers.auth import router as auth_router
from .routers.cursos import router as cursos_router
from .routers.docentes import router as docentes_router
from .routers.materias import router as materias_router
from .routers.faltas import router as faltas_router
from .routers.topicos import router as topicos_router
from .routers.avaliacoes import router as avaliacoes_router
from .routers.lembretes import router as lembretes_router
from .routers.tecnicas_estudo import router as tecnicas_estudo_router
from .routers.sessoes import router as sessoes_router

from django.db import IntegrityError
from django.core.exceptions import ValidationError
from ninja import NinjaAPI
from ninja.errors import HttpError
from typing import Any

api = NinjaAPI(
    title="API de Gestão de Estudos",
    description="API RESTful modularizada, segura e escalável.",
    version="1.0.0"
)


@api.exception_handler(IntegrityError)
def integrity_error_handler(request: Any, exc: IntegrityError) -> Any:
    message = str(exc)
    if "UNIQUE constraint" in message:
        message = "Já existe um registro com esses dados"
    return api.create_response(
        request,
        {"detail": message},
        status=400,
    )


@api.exception_handler(ValidationError)
def validation_error_handler(request: Any, exc: ValidationError) -> Any:
    return api.create_response(
        request,
        {"detail": str(exc)},
        status=400,
    )


@api.exception_handler(Exception)
def generic_error_handler(request: Any, exc: Exception) -> Any:
    return api.create_response(
        request,
        {"detail": "Erro interno do servidor"},
        status=500,
    )


api.add_router("/auth", auth_router)
api.add_router("/cursos", cursos_router)
api.add_router("/docentes", docentes_router)
api.add_router("/materias", materias_router)
api.add_router("", faltas_router)
api.add_router("/topicos", topicos_router)
api.add_router("/avaliacoes", avaliacoes_router)
api.add_router("/lembretes", lembretes_router)
api.add_router("/tecnicas-estudo", tecnicas_estudo_router)
api.add_router("/sessoes", sessoes_router)
