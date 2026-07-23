"""
URL configuration for shakenstirred project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from cocktails.views import cocktail_list
from shakenstirred import views 
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),          # Django admin
    path("", views.index, name="index"),      # Homepage
    path('cocktails/', cocktail_list, name='cocktail_list'),
    path("admin-login/", views.admin_login, name="admin_login"),
    path('dashboard/', views.admin_page, name='admin_page'),  # Custom admin page
    path("", include("cocktails.urls")),
]
