from ninja import Router, Query
from ninja.pagination import paginate, PageNumberPagination
from ninja.security import django_auth
from django.shortcuts import get_object_or_404
from typing import List
from ..schemas import DocenteSchema, DocenteIn
from ..models import Docente

router = Router(tags=["Docentes"])


@router.get("", response=List[DocenteSchema], auth=django_auth)
@paginate(PageNumberPagination, page_size=20)
def listar_docentes(
    request,
    search: str | None = Query(None),
    ordering: str = "nome",
):
    qs = Docente.objects.all()
    if search:
        qs = qs.filter(nome__icontains=search)
    return qs.order_by(ordering)


@router.post("", response=DocenteSchema, auth=django_auth)
def criar_docente(request, payload: DocenteIn):
    docente = Docente.objects.create(**payload.model_dump())
    return docente


@router.put("/{docente_id}", response=DocenteSchema, auth=django_auth)
def atualizar_docente(request, docente_id: int, payload: DocenteIn):
    docente = get_object_or_404(Docente, id=docente_id)
    for attr, value in payload.model_dump().items():
        setattr(docente, attr, value)
    docente.save()
    return docente


@router.delete("/{docente_id}", auth=django_auth)
def deletar_docente(request, docente_id: int):
    docente = get_object_or_404(Docente, id=docente_id)
    docente.delete()
    return {"detail": "Docente deletado com sucesso"}
