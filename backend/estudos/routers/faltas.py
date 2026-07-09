from ninja import Router, Query
from ninja.pagination import paginate, PageNumberPagination
from ninja.security import django_auth
from django.shortcuts import get_object_or_404
from typing import List
from ..schemas import FaltaSchema, FaltaIn
from ..models import Falta, Materia

router = Router(tags=["Faltas"])


@router.get("/materias/{materia_id}/faltas", response=List[FaltaSchema], auth=django_auth)
@paginate(PageNumberPagination, page_size=20)
def listar_faltas(request, materia_id: int, ordering: str = "-data_entrada"):
    get_object_or_404(Materia, id=materia_id, curso__usuario=request.user)
    return Falta.objects.filter(materia_id=materia_id).order_by(ordering)


@router.post("/materias/{materia_id}/faltas", response=FaltaSchema, auth=django_auth)
def criar_falta(request, materia_id: int, payload: FaltaIn):
    get_object_or_404(Materia, id=materia_id, curso__usuario=request.user)
    falta = Falta.objects.create(
        materia_id=materia_id,
        quantidade=payload.quantidade,
    )
    return falta


@router.put("/faltas/{falta_id}", response=FaltaSchema, auth=django_auth)
def atualizar_falta(request, falta_id: int, payload: FaltaIn):
    falta = get_object_or_404(Falta, id=falta_id, materia__curso__usuario=request.user)
    falta.quantidade = payload.quantidade
    falta.materia_id = payload.materia
    falta.save()
    return falta


@router.delete("/faltas/{falta_id}", auth=django_auth)
def deletar_falta(request, falta_id: int):
    falta = get_object_or_404(Falta, id=falta_id, materia__curso__usuario=request.user)
    falta.delete()
    return {"detail": "Falta deletada com sucesso"}
