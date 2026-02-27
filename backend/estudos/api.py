from ninja import NinjaAPI
from ninja.orm import ModelSchema
from typing import List
from .models import Curso, Docente, Materia, Falta, TecnicaEstudo, Topico, Avaliacao, Lembrete

api = NinjaAPI()

class CursoSchema(ModelSchema):
    class Meta:
        model = Curso
        fields = "__all__" 

@api.get("/cursos", response=List[CursoSchema])
def listar_cursos(request):
    return Curso.objects.all()
