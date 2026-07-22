from django.urls import path
from . import views

urlpatterns = [
    path("ingredient/add/", views.add_ingredient, name="add_ingredient"),
    path("ingredient/edit/<int:id>/", views.edit_ingredient, name="edit_ingredient"),
    path("ingredient/delete/<int:id>/", views.delete_ingredient, name="delete_ingredient"),
]
