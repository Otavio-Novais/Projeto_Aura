from django.shortcuts import get_object_or_404
from ninja import Router
from ninja.security import django_auth
from typing import List
from estudos.models import TecnicaEstudo
from estudos.schemas import TecnicaEstudoIn, TecnicaEstudoSchema

router = Router(tags=["Técnicas de Estudo"])

# CRUD para técnicas de estudo
@router.get("", response=List[TecnicaEstudoSchema], auth=django_auth)
def listar_tecnicas_estudo(request):
    return TecnicaEstudo.objects.all()

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


