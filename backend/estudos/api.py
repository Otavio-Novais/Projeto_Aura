from .routers.cursos import router as cursos_router
from .routers.materias import router as materias_router
from .routers.faltas import router as faltas_router
from .routers.topicos import router as topicos_router
from .routers.avaliacoes import router as avaliacoes_router
from .routers.lembretes import router as lembretes_router
from .routers.tecnicas_estudo import router as tecnicas_estudo_router


from ninja import NinjaAPI

api = NinjaAPI(
    title="API de Gestão de Estudos",
    description="API RESTful modularizada, segura e escalável.",
    version="1.0.0"
)

api.add_router("/cursos", cursos_router)
api.add_router("/materias", materias_router)
api.add_router("", faltas_router)
api.add_router("/topicos", topicos_router)
api.add_router("/avaliacoes", avaliacoes_router)
api.add_router("/lembretes", lembretes_router)
api.add_router("/tecnicas-estudo", tecnicas_estudo_router)
