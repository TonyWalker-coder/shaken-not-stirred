from django.shortcuts import render, redirect
from cocktails.models import Ingredient, Cocktail
from django.db.models.functions import Lower
from django.contrib import messages
from django.conf import settings

def index(request):
    return render(request, "index.html")

ADMIN_PASSWORD = "ice"

def admin_page(request):
    if not request.session.get("is_admin"):
        return redirect("index")

    ingredients = Ingredient.objects.all().order_by(Lower("name"))
    cocktails = Cocktail.objects.all().select_related("history_obj").order_by(Lower("name"))

    # Mark each ingredient as used or unused
    for ing in ingredients:
        ing.used = Cocktail.objects.filter(ingredients=ing).exists()

    # ⭐ ADD THIS BLOCK ⭐
    import os
    buttons_dir = os.path.join(
        settings.BASE_DIR,
        "cocktails",
        "static",
        "cocktails",
        "buttons"
    )

    images = [
        f for f in os.listdir(buttons_dir)
        if f.lower().endswith((".png", ".jpg", ".jpeg"))
    ]

    return render(request, "admin.html", {
        "ingredients": ingredients,
        "cocktails": cocktails,
        "images": images,   # ⭐ THIS WAS MISSING ⭐
        "messages": messages.get_messages(request)
    })



def admin_login(request):
    if request.method == "POST":
        password = request.POST.get("password")

        if password == ADMIN_PASSWORD:
            request.session["is_admin"] = True
            return redirect("admin_page")

        messages.error(request, "Incorrect password.")
        return redirect("index")

    return redirect("index")
