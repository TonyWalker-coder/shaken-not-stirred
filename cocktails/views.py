from django.shortcuts import redirect, get_object_or_404
from django.contrib import messages
from .models import Cocktail, Ingredient, History, Recipe
from django.db.models.functions import Lower
from django.shortcuts import render, get_object_or_404, redirect
from django.http import JsonResponse

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
        history_obj = getattr(c, "history_obj", None)

        data.append({
            "id": c.id,
            "name": c.name,
            "history": history_obj.text if history_obj else None,
            "history_id": history_obj.id if history_obj else None
        })

    return JsonResponse({"cocktails": data})

# ============================================================
# RECIPES — FULL AJAX / JSON REWRITE (matches Ingredients + History)
# ============================================================

def recipes_list_json(request):
    """Return all cocktails + their recipe info as JSON (for modal refresh)."""
    cocktails = Cocktail.objects.all().order_by(Lower("name"))
    data = []

    for c in cocktails:
        recipe_obj = getattr(c, "recipe_obj", None)

        data.append({
            "id": c.id,
            "name": c.name,
            "recipe": recipe_obj.text if recipe_obj else None,
            "recipe_id": recipe_obj.id if recipe_obj else None
        })

    return JsonResponse({"cocktails": data})


def add_recipe(request, cocktail_id):
    """Add or replace a recipe — AJAX aware."""
    cocktail = get_object_or_404(Cocktail, id=cocktail_id)

    if request.method == "POST":
        text = request.POST.get("text", "").strip()
        recipe = getattr(cocktail, "recipe_obj", None)

        if recipe:
            recipe.text = text
            recipe.save()
        else:
            Recipe.objects.create(cocktail=cocktail, text=text)

        # AJAX response
        if request.headers.get("X-Requested-With") == "XMLHttpRequest":
            return JsonResponse({"error": False})

        return redirect("admin_page")

    return redirect("admin_page")


def edit_recipe(request, recipe_id):
    """Edit an existing recipe — AJAX aware."""
    recipe = get_object_or_404(Recipe, id=recipe_id)

    if request.method == "POST":
        recipe.text = request.POST.get("text", "").strip()
        recipe.save()

        # AJAX response
        if request.headers.get("X-Requested-With") == "XMLHttpRequest":
            return JsonResponse({"error": False})

        return redirect("admin_page")

    return redirect("admin_page")


def delete_recipe(request, recipe_id):
    """Delete a recipe — AJAX aware."""
    recipe = get_object_or_404(Recipe, id=recipe_id)

    if request.method == "POST":
        recipe.delete()

        # AJAX response
        if request.headers.get("X-Requested-With") == "XMLHttpRequest":
            return JsonResponse({"error": False})

        return redirect("admin_page")

    return redirect("admin_page")

def add_cocktail(request):

    print("ADD COCKTAIL VIEW FIRED")
    if request.method != "POST":
        return JsonResponse({"error": True, "message": "Invalid request"})

    name = request.POST.get("name", "").strip()
    history_text = request.POST.get("history", "").strip()
    recipe_text = request.POST.get("recipe", "").strip()
    ingredient_ids = request.POST.getlist("ingredients")

    # UNIQUE NAME VALIDATION
    if Cocktail.objects.filter(name__iexact=name).exists():
        return JsonResponse({"error": True, "message": "Cocktail name already exists"})

    # CREATE COCKTAIL
    cocktail = Cocktail.objects.create(name=name)

    # OPTIONAL HISTORY
    if history_text:
        History.objects.create(cocktail=cocktail, text=history_text)

    # OPTIONAL RECIPE
    if recipe_text:
        Recipe.objects.create(cocktail=cocktail, text=recipe_text)

    # INGREDIENTS
    if ingredient_ids:
        ingredients = Ingredient.objects.filter(id__in=ingredient_ids)
        cocktail.ingredients.set(ingredients)

    return JsonResponse({
        "error": False,
        "message": "Cocktail created",
        "cocktail_id": cocktail.id,
    })

def check_cocktail_name(request):

    
    name = request.GET.get("name", "").strip()
    print("CHECK NAME VIEW FIRED:", name)
    exists = Cocktail.objects.filter(name__iexact=name).exists()
    return JsonResponse({"exists": exists})