from django.contrib import admin
from .models import Curso, Docente, Lembrete, Materia, Falta, TecnicaEstudo, Topico, Avaliacao
admin.site.register(Curso)
admin.site.register(Docente)
admin.site.register(Materia)
admin.site.register(Falta)
admin.site.register(TecnicaEstudo)
admin.site.register(Topico)
admin.site.register(Avaliacao)
admin.site.register(Lembrete)


# Register your models here.
