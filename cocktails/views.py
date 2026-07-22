from django.shortcuts import redirect, get_object_or_404
from django.contrib import messages
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

def delete_ingredient(request, ingredient_id):
    ingredient = get_object_or_404(Ingredient, id=ingredient_id)
    # Check if ingredient is used in any cocktail
    in_use = Cocktail.objects.filter(ingredients=ingredient).exists()

    if in_use:
        messages.error(request, "Cannot delete: this ingredient is used in one or more cocktails.")
        return redirect("admin_page")  # whatever your admin page URL name is

    ingredient.delete()
    messages.success(request, "Ingredient deleted.")
    return redirect("admin_page")

def edit_ingredient(request, id):
    ingredient = Ingredient.objects.get(id=id)
    if request.method == "POST":
        ingredient.name = request.POST.get("name")
        ingredient.save()
        return redirect("admin_page")

