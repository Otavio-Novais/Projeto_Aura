from django.shortcuts import get_object_or_404
from ninja import Router, Query
from ninja.pagination import paginate, PageNumberPagination
from ninja.security import django_auth
from typing import List
from estudos.models import TecnicaEstudo
from estudos.schemas import TecnicaEstudoIn, TecnicaEstudoSchema

router = Router(tags=["Técnicas de Estudo"])


@router.get("", response=List[TecnicaEstudoSchema], auth=django_auth)
@paginate(PageNumberPagination, page_size=20)
def listar_tecnicas_estudo(
    request,
    search: str | None = Query(None),
    ordering: str = "nome",
):
    qs = TecnicaEstudo.objects.all()
    if search:
        qs = qs.filter(nome__icontains=search)
    return qs.order_by(ordering)


@router.post("", response=TecnicaEstudoSchema, auth=django_auth)
def criar_tecnica_estudo(request, payload: TecnicaEstudoIn):
    tecnica = TecnicaEstudo.objects.create(**payload.model_dump())
    return tecnica


@router.put("/{tecnica_id}", response=TecnicaEstudoSchema, auth=django_auth)
def atualizar_tecnica_estudo(request, tecnica_id: int, payload: TecnicaEstudoIn):
    tecnica = get_object_or_404(TecnicaEstudo, id=tecnica_id)
    for attr, value in payload.model_dump().items():
        setattr(tecnica, attr, value)
    tecnica.save()
    return tecnica


@router.delete("/{tecnica_id}", auth=django_auth)
def deletar_tecnica_estudo(request, tecnica_id: int):
    tecnica = get_object_or_404(TecnicaEstudo, id=tecnica_id)
    tecnica.delete()
    return {"detail": "Técnica de estudo deletada com sucesso"}
