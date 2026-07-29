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
    path('recipe/add/<int:cocktail_id>/', views.recipe_add, name='recipe_add'),
    path('recipe/edit/<int:cocktail_id>/', views.recipe_edit, name='recipe_edit'),
    path('recipe/delete/<int:cocktail_id>/', views.recipe_delete, name='recipe_delete'),

]