from django.db import models
from django.contrib.auth.models import User     


class Curso(models.Model):
    nome = models.CharField(max_length=150)
    data_entrada = models.DateField(auto_now_add=True)
    usuario = models.ForeignKey(User, on_delete=models.CASCADE)

    def __str__(self):
        return self.nome


class Docente(models.Model):
    nome = models.CharField(max_length=150)
    def __str__(self):
        return self.nome
    
class Materia(models.Model):
    nome = models.CharField(max_length=150)
    curso = models.ForeignKey(Curso, on_delete=models.CASCADE)
    docente = models.ForeignKey(Docente, on_delete=models.CASCADE)

    def __str__(self):
        return self.nome
    
class Falta(models.Model):
    materia = models.ForeignKey(Materia, on_delete=models.CASCADE)
    data_entrada = models.DateField(auto_now_add=True)
    quantidade = models.IntegerField()

    def __str__(self):
        return f"{self.materia.nome} - {self.quantidade} faltas"

class TecnicaEstudo(models.Model):
    nome = models.CharField(max_length=150)
    descricao = models.TextField()

    def __str__(self):
        return self.nome

class Topico(models.Model):
    options = [
        "Alta", "Média", "Baixa"
    ]

    nome = models.CharField(max_length=150)
    materia = models.ForeignKey(Materia, on_delete=models.CASCADE)
    tecnica_estudo = models.ForeignKey(TecnicaEstudo, on_delete=models.CASCADE)
    data_estimada = models.DateField()
    data_esperada = models.DateField()
    estudou = models.BooleanField(default=False)
    importancia = models.CharField(max_length=10, choices=[(option, option) for option in options])

    def __str__(self):
        return self.nome
    
class Avaliacao(models.Model):
    nome = models.CharField(max_length=150)
    materia = models.ForeignKey(Materia, on_delete=models.CASCADE)
    data_entrada = models.DateField(auto_now_add=True)
    data_avaliacao = models.DateField()
    peso = models.FloatField()
    nota_maxima = models.FloatField()
    nota_obtida = models.FloatField()
    tipo_avaliacao = models.CharField(max_length=50)

    def __str__(self):
        return f"{self.nome} - {self.materia.nome}"

class Lembrete(models.Model):
    nome = models.CharField(max_length=150)
    descricao = models.TextField()
    data_entrada = models.DateField(auto_now_add=True)
    data_lembrete = models.DateField()
    avaliacao = models.ForeignKey(Avaliacao, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.nome} - {self.avaliacao.materia.nome}"