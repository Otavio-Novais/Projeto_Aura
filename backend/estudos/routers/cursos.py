from ninja import Router
from ninja.security import django_auth
from django.shortcuts import get_object_or_404
from typing import List
from ..schemas import CursoSchema, CursoIn
from ..models import Curso

router = Router(tags=["Cursos"])

# Crud para cursos
@router.get("", response=List[CursoSchema], auth=django_auth)
def listar_cursos(request):
    return Curso.objects.filter(usuario=request.user)

@router.post("", response=CursoSchema, auth=django_auth)
def criar_curso(request, payload: CursoIn):
    curso = Curso.objects.create(**payload.model_dump(), usuario=request.user)
    return curso

@router.put("/{curso_id}", response=CursoSchema, auth=django_auth)
def atualizar_curso(request, curso_id: int, payload: CursoIn):
    curso = get_object_or_404(Curso, id=curso_id, usuario=request.user)
    for attr, value in payload.model_dump().items():
        setattr(curso, attr, value)
    curso.save()
    return curso

@router.delete("/{curso_id}", auth=django_auth)
def deletar_curso(request, curso_id: int):
    curso = get_object_or_404(Curso, id=curso_id, usuario=request.user)
    curso.delete()
    return {"detail": "Curso deletado com sucesso"}