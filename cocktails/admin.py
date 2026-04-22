from django.contrib import admin
from .models import Cocktail, Ingredient, Recipe, History


@admin.register(Ingredient)
class IngredientAdmin(admin.ModelAdmin):
    search_fields = ['name']


@admin.register(Recipe)
class RecipeAdmin(admin.ModelAdmin):
    search_fields = ['text']


@admin.register(History)
class HistoryAdmin(admin.ModelAdmin):
    search_fields = ['text']


@admin.register(Cocktail)
class CocktailAdmin(admin.ModelAdmin):
    search_fields = ['name']
    filter_horizontal = ['ingredients']  # <- This adds a nice interface for managing many-to-many relationships in the admin

