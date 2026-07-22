from django.shortcuts import render
from cocktails.models import Ingredient
from django.db.models.functions import Lower

def index(request):
    return render(request, "index.html")

def admin_page(request):
    ingredients = Ingredient.objects.all().order_by(Lower("name"))
    return render(request, "admin.html", {"ingredients": ingredients})