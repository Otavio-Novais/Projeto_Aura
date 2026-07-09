from django.contrib import admin
from .models import Curso, Docente, Lembrete, Materia, Falta, TecnicaEstudo, Topico, Avaliacao, SessaoEstudo
admin.site.register(Curso)
admin.site.register(Docente)
admin.site.register(Materia)
admin.site.register(Falta)
admin.site.register(TecnicaEstudo)
admin.site.register(Topico)
admin.site.register(Avaliacao)
admin.site.register(Lembrete)
admin.site.register(SessaoEstudo)


# Register your models here.
