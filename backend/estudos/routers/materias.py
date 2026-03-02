from ninja import Router
from ninja.security import django_auth
from django.shortcuts import get_object_or_404
from typing import List
from ..schemas import MateriaSchema, MateriaIn, FaltaSchema, FaltaIn
from ..schemas import TecnicaEstudoSchema, TecnicaEstudoIn
from ..models import Materia, Falta, TecnicaEstudo, Curso

router = Router(tags=["Matérias"])

# CRUD para matérias
@router.get("", response=List[MateriaSchema], auth=django_auth)
def listar_materias(request):
    return Materia.objects.filter(curso__usuario=request.user)

@router.post("", response=MateriaSchema, auth=django_auth)
def criar_materia(request, payload: MateriaIn):
    curso_validado = get_object_or_404(Curso, id=payload.curso, usuario=request.user)
    materia = Materia.objects.create(**payload.model_dump(), usuario=request.user)
    return materia

@router.put("/{materia_id}", response=MateriaSchema, auth=django_auth)
def atualizar_materia(request, materia_id: int, payload: MateriaIn):
    materia = get_object_or_404(Materia, id=materia_id, curso__usuario=request.user)
    for attr, value in payload.model_dump().items():
        setattr(materia, attr, value)
    materia.save()
    return materia

@router.delete("/{materia_id}", auth=django_auth)
def deletar_materia(request, materia_id: int):
    materia = get_object_or_404(Materia, id=materia_id, curso__usuario=request.user)
    materia.delete()
    return {"detail": "Matéria deletada com sucesso"}