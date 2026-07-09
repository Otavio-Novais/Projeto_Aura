from django.shortcuts import get_object_or_404
from ninja import Router, Query
from ninja.pagination import paginate, PageNumberPagination
from ninja.security import django_auth
from typing import List
from estudos.models import Avaliacao, Materia
from estudos.schemas import AvaliacaoIn, AvaliacaoSchema

router = Router(tags=["Avaliações"])

ORDERING_FIELDS = {"nome", "data_avaliacao", "peso", "-nome", "-data_avaliacao", "-peso"}


@router.get("", response=List[AvaliacaoSchema], auth=django_auth)
@paginate(PageNumberPagination, page_size=20)
def listar_avaliacoes(
    request,
    search: str | None = Query(None),
    ordering: str = "nome",
):
    qs = Avaliacao.objects.filter(materia__curso__usuario=request.user)
    if search:
        qs = qs.filter(nome__icontains=search)
    if ordering in ORDERING_FIELDS:
        return qs.order_by(ordering)
    return qs.order_by("nome")


@router.post("", response=AvaliacaoSchema, auth=django_auth)
def criar_avaliacao(request, payload: AvaliacaoIn):
    get_object_or_404(Materia, id=payload.materia_id, curso__usuario=request.user)
    avaliacao = Avaliacao.objects.create(**payload.model_dump())
    return avaliacao


@router.put("/{avaliacao_id}", response=AvaliacaoSchema, auth=django_auth)
def atualizar_avaliacao(request, avaliacao_id: int, payload: AvaliacaoIn):
    avaliacao = get_object_or_404(Avaliacao, id=avaliacao_id, materia__curso__usuario=request.user)
    get_object_or_404(Materia, id=payload.materia_id, curso__usuario=request.user)
    for attr, value in payload.model_dump().items():
        setattr(avaliacao, attr, value)
    avaliacao.save()
    return avaliacao


@router.delete("/{avaliacao_id}", auth=django_auth)
def deletar_avaliacao(request, avaliacao_id: int):
    avaliacao = get_object_or_404(Avaliacao, id=avaliacao_id, materia__curso__usuario=request.user)
    avaliacao.delete()
    return {"detail": "Avaliação deletada com sucesso"}
