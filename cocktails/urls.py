from django.urls import path
from . import views

urlpatterns = [
    # INGREDIENTS
    path("ingredient/add/", views.add_ingredient, name="add_ingredient"),
    path("ingredient/edit/<int:id>/", views.edit_ingredient, name="edit_ingredient"),
    path("ingredient/delete/<int:ingredient_id>/", views.delete_ingredient, name="delete_ingredient"),

    # HISTORY
    path("history/add/<int:cocktail_id>/", views.history_add, name="history_add"),
    path("history/edit/<int:history_id>/", views.history_edit, name="history_edit"),
    path("history/delete/<int:history_id>/", views.history_delete, name="history_delete"),

    # HISTORY JSON (needed for AJAX refresh)
    path("history/list/json/", views.history_list_json, name="history_list_json"),




    # RECIPES
    path("recipes/add/<int:cocktail_id>/", views.add_recipe, name="add-recipe"),
    path("recipes/edit/<int:recipe_id>/", views.edit_recipe, name="edit-recipe"),
    path("recipes/delete/<int:recipe_id>/", views.delete_recipe, name="delete-recipe"),

    # JSON refresh endpoint
    path("recipes/list/json/", views.recipes_list_json, name="recipes_list_json"),

    path("cocktail/add/", views.add_cocktail, name="add_cocktail"),
    path("cocktail/check-name/", views.check_cocktail_name, name="check_cocktail_name"),

    path("cocktail/delete/<int:cocktail_id>/", views.delete_cocktail, name="delete_cocktail"),

    path("cocktails/list/json/", views.cocktails_list_json),

# CUSTOMISE COCKTAIL
    path("cocktail/<int:cocktail_id>/ingredients/", views.cocktail_ingredients_json),
    path("cocktail/<int:cocktail_id>/add/<int:ingredient_id>/", views.cocktail_add_ingredient),
    path("cocktail/<int:cocktail_id>/remove/<int:ingredient_id>/", views.cocktail_remove_ingredient),

]