from django.db import models


class Ingredient(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name.title()


class Cocktail(models.Model):
    name = models.CharField(max_length=100)
    image_url = models.CharField(max_length=255, null=True, blank=True)

    ingredients = models.ManyToManyField(Ingredient, blank=True)

    def __str__(self):
        return self.name


class Recipe(models.Model):
    cocktail = models.OneToOneField(
        "Cocktail",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
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





class Thread(models.Model):
    title = models.CharField(max_length=200)
    author_name = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class Reply(models.Model):
    thread = models.ForeignKey(Thread, related_name='replies', on_delete=models.CASCADE)
    author_name = models.CharField(max_length=100)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Reply by {self.author_name}"

