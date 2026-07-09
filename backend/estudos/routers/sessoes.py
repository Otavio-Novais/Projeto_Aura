from typing import List
from django.shortcuts import get_object_or_404
from ninja import Router, Schema
from ninja.security import django_auth
from ninja.orm import ModelSchema
from estudos.models import SessaoEstudo, Topico


router = Router(tags=["Pomodoro"])


class SessaoEstudoSchema(ModelSchema):
    class Meta:
        model = SessaoEstudo
        fields = ["id", "topico", "duracao_minutos", "data"]


class SessaoEstudoIn(Schema):
    topico_id: int
    duracao_minutos: int


@router.get("", response=List[SessaoEstudoSchema], auth=django_auth)
def listar_sessoes(request):
    return SessaoEstudo.objects.filter(topico__materia__curso__usuario=request.user).order_by("-data")[:20]


@router.post("", response=SessaoEstudoSchema, auth=django_auth)
def criar_sessao(request, payload: SessaoEstudoIn):
    get_object_or_404(Topico, id=payload.topico_id, materia__curso__usuario=request.user)
    return SessaoEstudo.objects.create(**payload.model_dump())
