from django.urls import include, path

from cocktails.views import cocktail_list
from shakenstirred import views

urlpatterns = [
    path("", views.index, name="index"),      # Homepage
    path('cocktails/', cocktail_list, name='cocktail_list'),
    path("admin-login/", views.admin_login, name="admin_login"),
    path('dashboard/', views.admin_page, name='admin_page'),  # Custom admin page
    path("", include("cocktails.urls")),

]
