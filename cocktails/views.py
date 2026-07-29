from django.shortcuts import redirect, get_object_or_404
from django.contrib import messages
from .models import Cocktail, Ingredient, History, Recipe
from django.db.models.functions import Lower
from django.shortcuts import render, get_object_or_404
from cocktails.models import Ingredient
from django.http import JsonResponse, request

def cocktail_list(request):
    cocktails = Cocktail.objects.all().order_by(Lower("name"))
    return render(request, 'cocktails/cocktail_list.html', {'cocktails': cocktails})

from django.http import JsonResponse

def add_ingredient(request):
    if request.method == "POST":
        raw_name = request.POST.get("name", "")
        name = raw_name.strip().lower()   # NORMALISE FIRST

        # Duplicate check using normalised name
        if Ingredient.objects.filter(name=name).exists():

            # AJAX request → return JSON instead of redirect
            if request.headers.get("X-Requested-With") == "XMLHttpRequest":
                return JsonResponse({
                    "error": True,
                    "message": f"Ingredient '{raw_name.strip()}' already exists."
                })

            messages.error(request, f"Ingredient '{raw_name.strip()}' already exists.")
            return redirect("admin_page")

        # Save normalised name
        ingredient = Ingredient.objects.create(name=name)

        # AJAX request → return JSON instead of redirect
        if request.headers.get("X-Requested-With") == "XMLHttpRequest":
            ingredients = []
            for ing in Ingredient.objects.all().order_by(Lower("name")):
                ingredients.append({
                    "id": ing.id,
                    "name": ing.name,
                    "used": Cocktail.objects.filter(ingredients=ing).exists()
            })

            return JsonResponse({
                "error": False,
                "ingredients": ingredients
        })


        messages.success(request, f"Ingredient '{raw_name.strip()}' added.")
        return redirect("admin_page")


def delete_ingredient(request, ingredient_id):
    ingredient = get_object_or_404(Ingredient, id=ingredient_id)

    in_use = Cocktail.objects.filter(ingredients=ingredient).exists()

    # AJAX delete blocked → return JSON
    if in_use and request.headers.get("X-Requested-With") == "XMLHttpRequest":
        return JsonResponse({
            "error": True,
            "message": "Cannot delete: this ingredient is used in one or more cocktails."
        })

    # Normal delete blocked → redirect
    if in_use:
        messages.error(request, "Cannot delete: this ingredient is used in one or more cocktails.")
        return redirect("admin_page")

    # Perform delete
    ingredient.delete()

    # AJAX success → return sorted list
    if request.headers.get("X-Requested-With") == "XMLHttpRequest":
        ingredients = []
        for ing in Ingredient.objects.all().order_by(Lower("name")):
            ingredients.append({
                "id": ing.id,
                "name": ing.name,
                "used": Cocktail.objects.filter(ingredients=ing).exists()
            })

        return JsonResponse({
            "error": False,
            "ingredients": ingredients
        })

    # Fallback for non-AJAX
    messages.success(request, "Ingredient deleted.")
    return redirect("admin_page")


def edit_ingredient(request, id):
    ingredient = Ingredient.objects.get(id=id)

    if request.method == "POST":
        raw_name = request.POST.get("name", "")
        name = raw_name.strip().lower()

        # Duplicate check (but allow same ingredient to keep its own name)
        if Ingredient.objects.filter(name=name).exclude(id=id).exists():

            # AJAX duplicate → JSON + message
            if request.headers.get("X-Requested-With") == "XMLHttpRequest":
                return JsonResponse({
                    "error": True,
                    "message": f"Ingredient '{raw_name.strip()}' already exists."
                })

            messages.error(request, f"Ingredient '{raw_name.strip()}' already exists.")
            return redirect("admin_page")

        # Save updated name
        ingredient.name = name
        ingredient.save()

        # AJAX success → return sorted list
        if request.headers.get("X-Requested-With") == "XMLHttpRequest":
            ingredients = []
            for ing in Ingredient.objects.all().order_by(Lower("name")):
                ingredients.append({
                    "id": ing.id,
                    "name": ing.name,
                    "used": Cocktail.objects.filter(ingredients=ing).exists()
                })

            return JsonResponse({
                "error": False,
                "ingredients": ingredients
            })

        # Fallback for non-AJAX
        messages.success(request, "Ingredient updated.")
        return redirect("admin_page")



def history_add(request, cocktail_id):
    cocktail = get_object_or_404(Cocktail, id=cocktail_id)

    if request.method == "POST":
        text = request.POST.get("text")

        existing = History.objects.filter(cocktail=cocktail).first()

        if existing:
            # Treat "Add" as "Replace"
            existing.text = text
            existing.save()

            if request.headers.get("X-Requested-With") == "XMLHttpRequest":
                return JsonResponse({
                    "error": False,
                    "message": "History replaced.",
                    "history": existing.text
                })

            messages.success(request, "History replaced.")
            return redirect("admin_page")

        # Safe create
        history = History.objects.create(cocktail=cocktail, text=text)

        if request.headers.get("X-Requested-With") == "XMLHttpRequest":
            return JsonResponse({
                "error": False,
                "message": "History added!",
                "history": history.text
            })

        messages.success(request, "History added!")
        return redirect("admin_page")






def history_edit(request, history_id):
    history = get_object_or_404(History, id=history_id)

    if request.method == "POST":
        history.text = request.POST.get("text")
        history.save()

        if request.headers.get("X-Requested-With") == "XMLHttpRequest":
            return JsonResponse({
                "error": False,
                "message": "History updated.",
                "history": history.text
            })

        messages.success(request, "History updated.")
        return redirect("admin_page")




def history_delete(request, history_id):
    history = get_object_or_404(History, id=history_id)

    if request.method == "POST":
        history.delete()

        if request.headers.get("X-Requested-With") == "XMLHttpRequest":
            return JsonResponse({
                "error": False,
                "message": "History deleted."
            })

        messages.success(request, "History deleted.")
        return redirect("admin_page")


def history_list_json(request):
    cocktails = Cocktail.objects.all().order_by(Lower("name"))
    data = []

    for c in cocktails:
        data.append({
            "id": c.id,
            "name": c.name,
            "history": c.history.text if hasattr(c, "history") else None,
            "history_id": c.history.id if hasattr(c, "history") else None
        })

    return JsonResponse({"cocktails": data})



def recipe_add(request, cocktail_id):
    cocktail = get_object_or_404(Cocktail, id=cocktail_id)

    if request.method == "POST":
        text = request.POST.get("text")

        # If recipe already exists → treat add as replace
        if cocktail.recipe:
            cocktail.recipe.text = text
            cocktail.recipe.save()

            if request.headers.get("X-Requested-With") == "XMLHttpRequest":
                return JsonResponse({
                    "error": False,
                    "message": "Recipe replaced.",
                    "recipe": cocktail.recipe.text
                })

            messages.success(request, "Recipe replaced!")
            return redirect("admin_page")

        # Create new recipe
        recipe = Recipe.objects.create(text=text)
        cocktail.recipe = recipe
        cocktail.save()

        if request.headers.get("X-Requested-With") == "XMLHttpRequest":
            return JsonResponse({
                "error": False,
                "message": "Recipe added!",
                "recipe": recipe.text
            })

        messages.success(request, "Recipe added!")
        return redirect("admin_page")




def recipe_edit(request, cocktail_id):
    cocktail = get_object_or_404(Cocktail, id=cocktail_id)
    recipe = cocktail.recipe

    if request.method == "POST":
        recipe.text = request.POST.get("text")
        recipe.save()

        if request.headers.get("X-Requested-With") == "XMLHttpRequest":
            return JsonResponse({
                "error": False,
                "message": "Recipe updated!",
                "recipe": recipe.text
            })

        messages.success(request, "Recipe updated!")
        return redirect("admin_page")




def recipe_delete(request, cocktail_id):
    cocktail = get_object_or_404(Cocktail, id=cocktail_id)
    recipe = cocktail.recipe

    if request.method == "POST":
        recipe.delete()
        cocktail.recipe = None
        cocktail.save()

        if request.headers.get("X-Requested-With") == "XMLHttpRequest":
            return JsonResponse({
                "error": False,
                "message": "Recipe deleted.",
                "recipe": None
            })

        messages.success(request, "Recipe deleted!")
        return redirect("admin_page")




