from typing import List
from django.shortcuts import get_object_or_404
from ninja import Router, Query
from ninja.pagination import paginate, PageNumberPagination
from ninja.security import django_auth
from estudos.models import Avaliacao, Lembrete
from estudos.schemas import LembreteIn, LembreteSchema

router = Router(tags=["Lembretes"])


@router.get("", response=List[LembreteSchema], auth=django_auth)
@paginate(PageNumberPagination, page_size=20)
def listar_lembretes(
    request,
    search: str | None = Query(None),
    ordering: str = "nome",
):
    qs = Lembrete.objects.filter(avaliacao__materia__curso__usuario=request.user)
    if search:
        qs = qs.filter(nome__icontains=search)
    return qs.order_by(ordering)


@router.post("", response=LembreteSchema, auth=django_auth)
def criar_lembrete(request, payload: LembreteIn):
    get_object_or_404(Avaliacao, id=payload.avaliacao_id, materia__curso__usuario=request.user)
    return Lembrete.objects.create(**payload.model_dump())


@router.put("/{lembrete_id}", response=LembreteSchema, auth=django_auth)
def atualizar_lembrete(request, lembrete_id: int, payload: LembreteIn):
    lembrete = get_object_or_404(
        Lembrete,
        id=lembrete_id,
        avaliacao__materia__curso__usuario=request.user,
    )
    get_object_or_404(Avaliacao, id=payload.avaliacao_id, materia__curso__usuario=request.user)
    for attr, value in payload.model_dump().items():
        setattr(lembrete, attr, value)
    lembrete.save()
    return lembrete


@router.delete("/{lembrete_id}", auth=django_auth)
def deletar_lembrete(request, lembrete_id: int):
    lembrete = get_object_or_404(
        Lembrete,
        id=lembrete_id,
        avaliacao__materia__curso__usuario=request.user,
    )
    lembrete.delete()
    return {"detail": "Lembrete deletado com sucesso"}
