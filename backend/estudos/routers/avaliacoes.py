from django.shortcuts import get_object_or_404
from ninja import Router
from ninja.security import django_auth
from typing import List
from estudos.models import Avaliacao, Lembrete, Materia
from estudos.schemas import AvaliacaoIn, AvaliacaoSchema, LembreteIn, LembreteSchema

router = Router(tags=["Avaliações"])

# CRUD para avaliações
@router.get("", response=List[AvaliacaoSchema], auth=django_auth)
def listar_avaliacoes(request):
    return Avaliacao.objects.filter(materia__curso__usuario=request.user)

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
