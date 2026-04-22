from django.db import models

# Create your models here.
# cocktails/models.py

from django.db import models

class Ingredient(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name


class Recipe(models.Model):
    text = models.TextField()

    def __str__(self):
        return f"Recipe #{self.id}"


class History(models.Model):
    text = models.TextField()

    def __str__(self):
        return f"History #{self.id}"


class Cocktail(models.Model):
    name = models.CharField(max_length=100)
    image_url = models.CharField(max_length=255)

    # Many-to-many: a cocktail uses many ingredients
    ingredients = models.ManyToManyField(Ingredient, blank=True)

    # One-to-one: each cocktail has one recipe
    recipe = models.OneToOneField(Recipe, on_delete=models.CASCADE, null=True, blank=True)

    # One-to-one: optional history/story
    history = models.OneToOneField(History, on_delete=models.CASCADE, null=True, blank=True)

    def __str__(self):
        return self.name
