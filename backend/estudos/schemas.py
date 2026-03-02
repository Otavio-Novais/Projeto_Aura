from .models import Curso, Docente, Materia, Falta, TecnicaEstudo, Topico, Avaliacao, Lembrete
from ninja import Schema
from ninja.orm import ModelSchema
from datetime import date

# Schemas para cada modelo
class CursoSchema(ModelSchema):
    class Meta:
        model = Curso
        fields = "__all__"

class CursoIn(Schema):
    nome: str

class DocenteSchema(ModelSchema):
    class Meta:
        model = Docente
        fields = "__all__" 

class DocenteIn(Schema):
    nome: str

class MateriaSchema(ModelSchema):
    class Meta:
        model = Materia
        fields = "__all__"  

class MateriaIn(Schema):
    nome: str
    curso: int  # ID do curso
    docente: int  # ID do docente

class FaltaSchema(ModelSchema):
    class Meta:
        model = Falta
        fields = "__all__"  

class FaltaIn(Schema):
    materia: int  # ID da matéria

class TecnicaEstudoSchema(ModelSchema):
    class Meta:
        model = TecnicaEstudo
        fields = "__all__"  

class TecnicaEstudoIn(Schema):
    nome: str
    descricao: str

class TopicoSchema(ModelSchema):
    class Meta:
        model = Topico
        fields = "__all__"  

class TopicoIn(Schema):
    nome: str
    materia_id: int 
    tecnica_estudo_id: int
    data_estimada: date
    data_esperada: date
    estudou: bool
    importancia: str
    
class AvaliacaoSchema(ModelSchema):
    class Meta:
        model = Avaliacao
        fields = "__all__" 

class AvaliacaoIn(Schema):
    nome: str
    materia_id: int  # ID da matéria
    data_avaliacao: date
    peso: float
    tipo_avaliacao: str
    nota_maxima: float
    nota_obtida: float

class LembreteSchema(ModelSchema):
    class Meta:
        model = Lembrete
        fields = "__all__"  

class LembreteIn(Schema):
    nome: str
    descricao: str
    avaliacao_id: int  # ID da avaliação
    data_lembrete: date