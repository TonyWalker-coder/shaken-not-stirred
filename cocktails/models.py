from django.db import models

# Create your models here.
class Cocktail(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    ingredients = models.TextField(blank=True)
    method = models.TextField(blank=True)
    image_url = models.CharField(max_length=255, blank=True)
    glass_type = models.CharField(max_length=50, blank=True)

    def __str__(self):
        return self.name