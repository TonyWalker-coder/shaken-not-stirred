from django.db import models


class Ingredient(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name.title()


class Cocktail(models.Model):
    name = models.CharField(max_length=100)
    image_url = models.CharField(max_length=255)

    ingredients = models.ManyToManyField(Ingredient, blank=True)

    # Forward accessors
    recipe = models.OneToOneField(
        "Recipe",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="recipe_entry"
    )

    history = models.OneToOneField(
        "History",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="history_entry"
    )

    def __str__(self):
        return self.name


class Recipe(models.Model):
    cocktail = models.OneToOneField(
        "Cocktail",
        on_delete=models.CASCADE,
        null=True,        # MUST be here
        blank=True,       # MUST be here
        related_name="recipe_obj"
    )
    text = models.TextField()

    def __str__(self):
        return f"Recipe for {self.cocktail.name}"


class History(models.Model):
    cocktail = models.OneToOneField(
        "Cocktail",
        on_delete=models.CASCADE,
        related_name="history_obj"
    )
    text = models.TextField()

    def __str__(self):
        return f"History for {self.cocktail.name}"
