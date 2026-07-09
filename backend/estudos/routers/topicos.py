from django.shortcuts import get_object_or_404
from ninja import Router, Query
from ninja.pagination import paginate, PageNumberPagination
from ninja.security import django_auth
from typing import List
from estudos.models import Materia, Topico
from estudos.schemas import TopicoIn, TopicoSchema

router = Router(tags=["Tópicos"])

ORDERING_FIELDS = {"nome", "data_estimada", "importancia", "-nome", "-data_estimada", "-importancia"}


@router.get("", response=List[TopicoSchema], auth=django_auth)
@paginate(PageNumberPagination, page_size=20)
def listar_topicos(
    request,
    search: str | None = Query(None),
    ordering: str = "nome",
):
    qs = Topico.objects.filter(materia__curso__usuario=request.user)
    if search:
        qs = qs.filter(nome__icontains=search)
    if ordering in ORDERING_FIELDS:
        return qs.order_by(ordering)
    return qs.order_by("nome")


@router.post("", response=TopicoSchema, auth=django_auth)
def criar_topico(request, payload: TopicoIn):
    get_object_or_404(Materia, id=payload.materia_id, curso__usuario=request.user)
    return Topico.objects.create(**payload.model_dump())


@router.put("/{topico_id}", response=TopicoSchema, auth=django_auth)
def atualizar_topico(request, topico_id: int, payload: TopicoIn):
    topico = get_object_or_404(
        Topico,
        id=topico_id,
        materia__curso__usuario=request.user,
    )
    get_object_or_404(Materia, id=payload.materia_id, curso__usuario=request.user)
    for attr, value in payload.model_dump().items():
        setattr(topico, attr, value)
    topico.save()
    return topico


@router.delete("/{topico_id}", auth=django_auth)
def deletar_topico(request, topico_id: int):
    topico = get_object_or_404(
        Topico,
        id=topico_id,
        materia__curso__usuario=request.user,
    )
    topico.delete()
    return {"detail": "Tópico deletado com sucesso"}
