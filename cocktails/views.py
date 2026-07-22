from django.shortcuts import render, redirect
from .models import Cocktail, Ingredient
from django.db.models.functions import Lower

def cocktail_list(request):
    cocktails = Cocktail.objects.all().order_by(Lower("name"))
    return render(request, 'cocktails/cocktail_list.html', {'cocktails': cocktails})

def add_ingredient(request):
    if request.method == "POST":
        name = request.POST.get("name")
        Ingredient.objects.create(name=name)
        return redirect("admin_page")

def delete_ingredient(request, id):
    ingredient = Ingredient.objects.get(id=id)
    ingredient.delete()
    return redirect("admin_page")

def edit_ingredient(request, id):
    ingredient = Ingredient.objects.get(id=id)
    if request.method == "POST":
        ingredient.name = request.POST.get("name")
        ingredient.save()
        return redirect("admin_page")

