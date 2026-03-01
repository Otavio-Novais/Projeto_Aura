from ninja import NinjaAPI
from ninja.orm import ModelSchema
from typing import List
from .models import Curso, Docente, Materia, Falta, TecnicaEstudo, Topico, Avaliacao, Lembrete

api = NinjaAPI()

# Schemas para cada modelo
class CursoSchema(ModelSchema):
    class Meta:
        model = Curso
        fields = "__all__"

class DocenteSchema(ModelSchema):
    class Meta:
        model = Docente
        fields = "__all__" 

class MateriaSchema(ModelSchema):
    class Meta:
        model = Materia
        fields = "__all__"  

class FaltaSchema(ModelSchema):
    class Meta:
        model = Falta
        fields = "__all__"  

class TecnicaEstudoSchema(ModelSchema):
    class Meta:
        model = TecnicaEstudo
        fields = "__all__"  

class TopicoSchema(ModelSchema):
    class Meta:
        model = Topico
        fields = "__all__"  

class AvaliacaoSchema(ModelSchema):
    class Meta:
        model = Avaliacao
        fields = "__all__"  

class LembreteSchema(ModelSchema):
    class Meta:
        model = Lembrete
        fields = "__all__"  

# Endpoint para listar cursos
@api.get("/cursos", response=List[CursoSchema])
def listar_cursos(request):
    return Curso.objects.all()

# Endpoint para listar docentes
@api.get("/docentes", response=List[DocenteSchema])
def listar_docentes(request):
    return Docente.objects.all()

# Endpoint para listar matérias
@api.get("/materias", response=List[MateriaSchema])
def listar_materias(request):
    return Materia.objects.all()

# Endpoint para listar faltas
@api.get("/materias/{materia_id}/faltas", response=List[FaltaSchema])
def listar_faltas(request, materia_id: int):
    return Falta.objects.filter(materia_id=materia_id)