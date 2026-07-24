from django.db import models


# Ingredient model
class Ingredient(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name.title()


# Recipe model
class Recipe(models.Model):
    text = models.TextField()

    def __str__(self):
        return f"Recipe #{self.id}"


# Cocktail model
class Cocktail(models.Model):
    name = models.CharField(max_length=100)
    image_url = models.CharField(max_length=255)

    # Many-to-many: a cocktail uses many ingredients
    ingredients = models.ManyToManyField(Ingredient, blank=True)

    # One-to-one: each cocktail has one recipe
    recipe = models.OneToOneField(Recipe, on_delete=models.CASCADE, null=True, blank=True)

    def __str__(self):
        return self.name


# History model — one optional history per cocktail
class History(models.Model):
    cocktail = models.OneToOneField(
        "Cocktail",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="history"
    )
    text = models.TextField()

    def __str__(self):
        return f"History for {self.cocktail.name if self.cocktail else 'Unassigned'}"
