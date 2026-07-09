from ninja import Router, Query
from ninja.pagination import paginate, PageNumberPagination
from ninja.security import django_auth
from django.shortcuts import get_object_or_404
from typing import List
from ..schemas import MateriaSchema, MateriaIn
from ..models import Materia, Curso

router = Router(tags=["Matérias"])


@router.get("", response=List[MateriaSchema], auth=django_auth)
@paginate(PageNumberPagination, page_size=20)
def listar_materias(
    request,
    search: str | None = Query(None),
    ordering: str = "nome",
):
    qs = Materia.objects.filter(curso__usuario=request.user)
    if search:
        qs = qs.filter(nome__icontains=search)
    return qs.order_by(ordering)


@router.post("", response=MateriaSchema, auth=django_auth)
def criar_materia(request, payload: MateriaIn):
    get_object_or_404(Curso, id=payload.curso, usuario=request.user)
    materia = Materia.objects.create(
        nome=payload.nome,
        curso_id=payload.curso,
        docente_id=payload.docente,
    )
    return materia


@router.put("/{materia_id}", response=MateriaSchema, auth=django_auth)
def atualizar_materia(request, materia_id: int, payload: MateriaIn):
    materia = get_object_or_404(Materia, id=materia_id, curso__usuario=request.user)
    materia.nome = payload.nome
    materia.curso_id = payload.curso
    materia.docente_id = payload.docente
    materia.save()
    return materia


@router.delete("/{materia_id}", auth=django_auth)
def deletar_materia(request, materia_id: int):
    materia = get_object_or_404(Materia, id=materia_id, curso__usuario=request.user)
    materia.delete()
    return {"detail": "Matéria deletada com sucesso"}
