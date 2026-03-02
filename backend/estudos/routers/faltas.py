from ninja import Router
from ninja.security import django_auth
from django.shortcuts import get_object_or_404
from typing import List
from ..schemas import FaltaSchema, FaltaIn
from ..models import Falta, Materia

router = Router(tags=["Faltas"])


# CRUD para faltas
@router.get("/materias/{materia_id}/faltas", response=List[FaltaSchema], auth=django_auth)
def listar_faltas(request, materia_id: int):
    return Falta.objects.filter(materia_id=materia_id, materia__curso__usuario=request.user)

@router.post("/materias/{materia_id}/faltas", response=FaltaSchema, auth=django_auth)
def criar_falta(request, materia_id: int, payload: FaltaIn):
    materia_validada = get_object_or_404(Materia, id=materia_id, curso__usuario=request.user)
    falta = Falta.objects.create(**payload.model_dump(), materia_id=materia_id)
    return falta

@router.put("/faltas/{falta_id}", response=FaltaSchema, auth=django_auth)
def atualizar_falta(request, falta_id: int, payload: FaltaIn):
    falta = get_object_or_404(Falta, id=falta_id, materia__curso__usuario=request.user)
    for attr, value in payload.model_dump().items():
        setattr(falta, attr, value)
    falta.save()
    return falta

@router.delete("/faltas/{falta_id}", auth=django_auth)
def deletar_falta(request, falta_id: int):
    falta = get_object_or_404(Falta, id=falta_id, materia__curso__usuario=request.user)
    falta.delete()
    return {"detail": "Falta deletada com sucesso"}