from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from django.http import JsonResponse
from django.conf import settings
from django.db.models import Exists, OuterRef
from django.db.models.functions import Lower
from django.db.models import Exists, OuterRef
import os
import json

from .models import Cocktail, Ingredient, History, Recipe
from cocktails.models import Cocktail, Ingredient, Recipe, History


# ============================================================
# HELPER FUNCTIONS
# ============================================================

def is_ajax(request):
    """Consistent AJAX detection."""
    return request.headers.get("X-Requested-With") == "XMLHttpRequest"


def ingredient_queryset():
    """
    Unified ingredient list with correct `used` flag.
    Used everywhere: modal open, add, edit, delete, refresh_all.
    """
    return Ingredient.objects.annotate(
        used=Exists(
            Cocktail.objects.filter(ingredients=OuterRef("pk"))
        )
    ).order_by(Lower("name")).values("id", "name", "used")


def cocktail_queryset():
    """Unified cocktail list."""
    return Cocktail.objects.order_by(Lower("name")).values("id", "name")


# ============================================================
# COCKTAIL LIST PAGE
# ============================================================

def cocktail_list(request):
    cocktails = Cocktail.objects.all().order_by(Lower("name"))
    return render(request, 'cocktails/cocktail_list.html', {'cocktails': cocktails})


# ============================================================
# INGREDIENT CRUD
# ============================================================

def add_ingredient(request):
    if request.method != "POST":
        return redirect("admin_page")

    raw_name = request.POST.get("name", "")
    name = raw_name.strip().lower()

    # Duplicate check
    if Ingredient.objects.filter(name=name).exists():
        if is_ajax(request):
            return JsonResponse({"error": True, "message": f"Ingredient '{raw_name.strip()}' already exists."})
        messages.error(request, f"Ingredient '{raw_name.strip()}' already exists.")
        return redirect("admin_page")

    Ingredient.objects.create(name=name)

    if is_ajax(request):
        return JsonResponse({"error": False, "ingredients": list(ingredient_queryset())})

    messages.success(request, f"Ingredient '{raw_name.strip()}' added.")
    return redirect("admin_page")


def delete_ingredient(request, ingredient_id):
    ingredient = get_object_or_404(Ingredient, id=ingredient_id)

    in_use = Cocktail.objects.filter(ingredients=ingredient).exists()

    if in_use:
        if is_ajax(request):
            return JsonResponse({"error": True, "message": "Cannot delete: ingredient is used."})
        messages.error(request, "Cannot delete: ingredient is used.")
        return redirect("admin_page")

    ingredient.delete()

    if is_ajax(request):
        return JsonResponse({"error": False, "ingredients": list(ingredient_queryset())})

    messages.success(request, "Ingredient deleted.")
    return redirect("admin_page")


def edit_ingredient(request, id):
    ingredient = get_object_or_404(Ingredient, id=id)

    if request.method != "POST":
        return JsonResponse({"error": True, "message": "POST required"}, status=400)

    raw_name = request.POST.get("name", "")
    name = raw_name.strip().lower()

    # Duplicate check
    if Ingredient.objects.filter(name=name).exclude(id=id).exists():
        return JsonResponse({
            "error": True,
            "message": f"Ingredient '{raw_name.strip()}' already exists."
        }, status=400)

    try:
        ingredient.name = name
        ingredient.save()
    except Exception as e:
        return JsonResponse({"error": True, "message": str(e)}, status=500)

    return JsonResponse({
        "error": False,
        "ingredients": list(ingredient_queryset())
    })



def ingredient_list(request):
    """Used by Ingredients modal open."""
    return JsonResponse({"ingredients": list(ingredient_queryset())})


# ============================================================
# HISTORY CRUD
# ============================================================

def history_add(request, cocktail_id):
    cocktail = get_object_or_404(Cocktail, id=cocktail_id)

    if request.method != "POST":
        return redirect("admin_page")

    text = request.POST.get("text") or request.POST.get("history_text")
    existing = getattr(cocktail, "history_obj", None)

    if existing:
        existing.text = text
        existing.save()
        if is_ajax(request):
            return JsonResponse({"error": False, "history": existing.text})
        messages.success(request, "History replaced.")
        return redirect("admin_page")

    history = History.objects.create(cocktail=cocktail, text=text)

    if is_ajax(request):
        return JsonResponse({"error": False, "history": history.text})

    messages.success(request, "History added!")
    return redirect("admin_page")


def history_edit(request, history_id):
    history = get_object_or_404(History, id=history_id)

    if request.method != "POST":
        return redirect("admin_page")

    history.text = request.POST.get("text")
    history.save()

    if is_ajax(request):
        return JsonResponse({"error": False, "history": history.text})

    messages.success(request, "History updated.")
    return redirect("admin_page")


def history_delete(request, history_id):
    history = get_object_or_404(History, id=history_id)

    if request.method != "POST":
        return redirect("admin_page")

    history.delete()

    if is_ajax(request):
        return JsonResponse({"error": False})

    messages.success(request, "History deleted.")
    return redirect("admin_page")


def history_list_json(request):
    """Return all cocktails + history for modal refresh."""
    data = []
    for c in Cocktail.objects.order_by(Lower("name")):
        h = getattr(c, "history_obj", None)  # correct reverse relation

        data.append({
            "id": c.id,
            "name": c.name,
            "history": h.text if h else "",
            "history_id": h.id if h else None
        })

    return JsonResponse({"cocktails": data})




# ============================================================
# RECIPE CRUD
# ============================================================

def add_recipe(request, cocktail_id):
    cocktail = get_object_or_404(Cocktail, id=cocktail_id)

    if request.method != "POST":
        return redirect("admin_page")

    text = request.POST.get("text", "").strip()
    recipe = getattr(cocktail, "recipe_obj", None)

    if recipe:
        recipe.text = text
        recipe.save()
    else:
        Recipe.objects.create(cocktail=cocktail, text=text)

    if is_ajax(request):
        return JsonResponse({"error": False})

    return redirect("admin_page")


def edit_recipe(request, recipe_id):
    recipe = get_object_or_404(Recipe, id=recipe_id)

    if request.method != "POST":
        return redirect("admin_page")

    recipe.text = request.POST.get("text", "").strip()
    recipe.save()

    if is_ajax(request):
        return JsonResponse({"error": False})

    return redirect("admin_page")


def delete_recipe(request, recipe_id):
    recipe = get_object_or_404(Recipe, id=recipe_id)

    if request.method != "POST":
        return redirect("admin_page")

    recipe.delete()

    if is_ajax(request):
        return JsonResponse({"error": False})

    return redirect("admin_page")


def recipes_list_json(request):
    """Return all cocktails + recipe info."""
    data = []
    for c in Cocktail.objects.order_by(Lower("name")):
        r = getattr(c, "recipe_obj", None)  # correct reverse relation

        data.append({
            "id": c.id,
            "name": c.name,
            "recipe": r.text if r else "",
            "recipe_id": r.id if r else None
        })
    return JsonResponse({"cocktails": data})




# ============================================================
# COCKTAIL CRUD
# ============================================================

def check_cocktail_name(request):
    name = request.GET.get("name", "").strip()
    exists = Cocktail.objects.filter(name__iexact=name).exists()
    return JsonResponse({"exists": exists})

def add_cocktail(request):
    if request.method != "POST":
        return JsonResponse({"error": True, "message": "Invalid request"})

    name = request.POST.get("name", "").strip()
    history_text = request.POST.get("history", "").strip()
    recipe_text = request.POST.get("recipe", "").strip()
    ingredient_ids = [int(i) for i in request.POST.getlist("ingredients") if i.isdigit()]

    if Cocktail.objects.filter(name__iexact=name).exists():
        return JsonResponse({"error": True, "message": "Cocktail name already exists"})

    cocktail = Cocktail.objects.create(name=name)

    if history_text:
        History.objects.create(cocktail=cocktail, text=history_text)

    if recipe_text:
        Recipe.objects.create(cocktail=cocktail, text=recipe_text)

    if ingredient_ids:
        cocktail.ingredients.set(Ingredient.objects.filter(id__in=ingredient_ids))

    return JsonResponse({"error": False, "message": "Cocktail created", "cocktail_id": cocktail.id})


def delete_cocktail(request, cocktail_id):
    cocktail = get_object_or_404(Cocktail, id=cocktail_id)

    try:
        History.objects.filter(cocktail=cocktail).delete()
        Recipe.objects.filter(cocktail=cocktail).delete()
        cocktail.ingredients.clear()

        cocktail.image_url = None
        cocktail.save()

        cocktail.delete()

        return JsonResponse({
            "error": False,
            "message": "Cocktail deleted.",
            "cocktails": list(cocktail_queryset())
        })

    except Exception as e:
        return JsonResponse({
            "error": True,
            "message": str(e)
        }, status=500)



def cocktails_list_json(request):
    return JsonResponse({"cocktails": list(cocktail_queryset())})


def cocktail_json(request, cocktail_id):
    c = get_object_or_404(Cocktail, id=cocktail_id)
    return JsonResponse({
        "id": c.id,
        "name": c.name,
        "image_url": c.image_url or "",
    })


def cocktail_ingredients_json(request, cocktail_id):
    cocktail = get_object_or_404(Cocktail, id=cocktail_id)

    return JsonResponse({
        "all_ingredients": list(Ingredient.objects.order_by(Lower("name")).values("id", "name")),
        "cocktail_ingredients": list(cocktail.ingredients.values_list("id", flat=True))
    })


def cocktail_add_ingredient(request, cocktail_id, ingredient_id):
    if request.method != "POST":
        return JsonResponse({"error": True, "message": "Invalid request method."})

    cocktail = get_object_or_404(Cocktail, id=cocktail_id)
    ingredient = get_object_or_404(Ingredient, id=ingredient_id)

    cocktail.ingredients.add(ingredient)
    return JsonResponse({"error": False})


def cocktail_remove_ingredient(request, cocktail_id, ingredient_id):
    if request.method != "POST":
        return JsonResponse({"error": True, "message": "Invalid request method."})

    cocktail = get_object_or_404(Cocktail, id=cocktail_id)
    ingredient = get_object_or_404(Ingredient, id=ingredient_id)

    cocktail.ingredients.remove(ingredient)
    return JsonResponse({"error": False})


# ============================================================
# IMAGE HANDLING
# ============================================================

def upload_image(request):
    if request.method != "POST":
        return JsonResponse({"error": True, "message": "Invalid request method."})

    file = request.FILES.get("image")
    if not file:
        return JsonResponse({"error": True, "message": "No file uploaded."})

    ext = os.path.splitext(file.name)[1].lower()
    if ext not in [".png", ".jpg", ".jpeg"]:
        return JsonResponse({"error": True, "message": "Only PNG/JPG images allowed."})

    save_dir = os.path.join(settings.BASE_DIR, "cocktails", "static", "cocktails", "buttons")
    os.makedirs(save_dir, exist_ok=True)

    save_path = os.path.join(save_dir, file.name)

    with open(save_path, "wb+") as dest:
        for chunk in file.chunks():
            dest.write(chunk)

    return JsonResponse({
        "error": False,
        "message": "Image uploaded successfully.",
        "filename": file.name,
        "url": f"/static/cocktails/buttons/{file.name}",
    })


def image_list(request):
    folder = os.path.join(settings.BASE_DIR, "cocktails", "static", "cocktails", "buttons")

    try:
        images = sorted(os.listdir(folder))
    except Exception:
        images = []

    return JsonResponse({"images": images})


def assign_image(request, cocktail_id, filename):
    if request.method != "POST":
        return JsonResponse({"error": True, "message": "Invalid request"}, status=400)

    cocktail = get_object_or_404(Cocktail, id=cocktail_id)
    cocktail.image_url = f"cocktails/buttons/{filename}"
    cocktail.save()

    if is_ajax(request):
        return JsonResponse({"success": True})

    return redirect("dashboard")


# ============================================================
# FULL REFRESH (ADMIN PANEL)
# ============================================================

def refresh_all(request):
    """Return everything for full admin panel refresh."""
    return JsonResponse({
        "ingredients": list(ingredient_queryset()),
        "cocktails": list(Cocktail.objects.order_by(Lower("name")).values(
            "id", "name", "image_url"
        )),
        "recipes": list(Recipe.objects.values("id", "cocktail_id", "text")),
        "history": [
            {
                "id": c.id,
                "name": c.name,
                "history": getattr(c, "history_obj").text if getattr(c, "history_obj", None) else None,
                "history_id": getattr(c, "history_obj").id if getattr(c, "history_obj", None) else None,
            }
            for c in Cocktail.objects.order_by(Lower("name"))
        ]
    })

def test_data_page(request):
    return render(request, "testdata.html")


def break_bloody_mary(request):
    base = os.path.join(settings.BASE_DIR, "cocktails", "static", "cocktails", "buttons")
    original = os.path.join(base, "bloody-mary.jpg")
    broken = os.path.join(base, "xbloody-mary.jpg")

    # If original exists, rename it
    if os.path.exists(original):
        os.rename(original, broken)

    return JsonResponse({"status": "ok", "message": "Bloody Mary image broken (or already broken)."})


def fix_bloody_mary(request):
    base = os.path.join(settings.BASE_DIR, "cocktails", "static", "cocktails", "buttons")
    original = os.path.join(base, "bloody-mary.jpg")
    broken = os.path.join(base, "xbloody-mary.jpg")

    # If broken exists, rename it back
    if os.path.exists(broken):
        os.rename(broken, original)

    return JsonResponse({"status": "ok", "message": "Bloody Mary image fixed (or already fixed)."})

import json
import os
from django.http import JsonResponse
from django.conf import settings
from cocktails.models import Cocktail, Ingredient, Recipe, History

def reset_db(request):
    json_path = os.path.join(
        settings.BASE_DIR,
        "static",
        "testdata",
        "cocktails.json"
    )

    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    # Wipe tables
    Reply.objects.all().delete()
    Thread.objects.all().delete()
    History.objects.all().delete()
    Recipe.objects.all().delete()
    Ingredient.objects.all().delete()
    Cocktail.objects.all().delete()

    cocktail_objects = {}

    for item in data:
        model = item.get("model")
        fields = item.get("fields", {})
        pk = item.get("pk")

        # INGREDIENT
        if model == "cocktails.ingredient":
            Ingredient.objects.create(
                id=pk,
                name=fields["name"]
            )

        # RECIPE
        elif model == "cocktails.recipe":
            Recipe.objects.create(
                id=pk,
                cocktail_id=fields["cocktail"],
                text=fields["text"]
            )

        # HISTORY
        elif model == "cocktails.history":
            History.objects.create(
                id=pk,
                cocktail_id=fields["cocktail"],
                text=fields["text"]
            )

        # COCKTAIL
        elif model == "cocktails.cocktail":
            c = Cocktail.objects.create(
                id=pk,
                name=fields["name"],
                image_url=fields.get("image_url", "")
            )
            cocktail_objects[pk] = (c, fields.get("ingredients", []))

        # THREAD (forum)
        elif model == "cocktails.thread":
            Thread.objects.create(
                id=pk,
                title=fields["title"],
                author_name=fields.get("author_name", ""),
                created_at=fields.get("created_at")
            )

        # REPLY (forum)
        elif model == "cocktails.reply":
            Reply.objects.create(
                id=pk,
                thread_id=fields["thread"],
                author_name=fields.get("author_name", ""),
                message=fields["message"],
                created_at=fields.get("created_at")
            )

    # Attach ingredients
    for pk, (cocktail, ingredient_ids) in cocktail_objects.items():
        for ing_id in ingredient_ids:
            try:
                ing = Ingredient.objects.get(id=ing_id)
                cocktail.ingredients.add(ing)
            except Ingredient.DoesNotExist:
                pass

    return JsonResponse({"status": "ok", "message": "Database reset and restored from JSON."})


# ============================================================
# USER AREA — DEVELOPMENT TOOLS
# ============================================================
from django.shortcuts import render, redirect, get_object_or_404
from django.http import JsonResponse
from .models import Thread, Reply
from .forms import ThreadForm, ReplyForm

# USER AREA
def user_area(request):
    return render(request, "user.html")

def user_forum(request):
    threads = Thread.objects.order_by('-created_at')
    return render(request, 'user/forum.html', {'threads': threads})

def new_thread(request):
    if request.method == 'POST':
        form = ThreadForm(request.POST)
        if form.is_valid():
            # Create the thread
            thread = Thread.objects.create(
                title=form.cleaned_data['title'],
                author_name=form.cleaned_data['author_name']
            )

            # Create the first reply (first post)
            Reply.objects.create(
                thread=thread,
                author_name=form.cleaned_data['author_name'],
                message=form.cleaned_data['message']
            )

            return redirect('forum')
    else:
        form = ThreadForm()

    return render(request, 'user/new_thread.html', {'form': form})

def thread_detail(request, thread_id):
    thread = get_object_or_404(Thread, id=thread_id)
    replies = thread.replies.order_by('created_at')

    if request.method == 'POST':
        form = ReplyForm(request.POST)
        if form.is_valid():
            reply = form.save(commit=False)
            reply.thread = thread
            reply.save()

            # AJAX response
            if request.headers.get("X-Requested-With") == "XMLHttpRequest":
                return JsonResponse({
                    "success": True,
                    "author_name": reply.author_name,
                    "message": reply.message,
                    "created_at": reply.created_at.strftime("%d %b %Y %H:%M")
                })

            return redirect('thread_detail', thread_id=thread.id)
    else:
        form = ReplyForm()

    return render(request, 'user/thread_detail.html', {
        'thread': thread,
        'replies': replies,
        'form': form
    })
def forum(request):
    threads = Thread.objects.all().order_by('-created_at')
    return render(request, 'user/forum.html', {'threads': threads})

def admin_forum(request):
    
    threads = Thread.objects.all().order_by('-created_at')
    return render(request, 'admin_forum.html', {'threads': threads})

def admin_forum_thread(request, thread_id):
    thread = get_object_or_404(Thread, id=thread_id)
    replies = Reply.objects.filter(thread=thread)
    return render(request, "forum_thread_section.html", {
    "thread": thread,
    "replies": replies,
})

def delete_thread(request, thread_id):
    thread = get_object_or_404(Thread, id=thread_id)
    thread.delete()
    return redirect('admin_forum')

def delete_reply(request, reply_id):
    reply = get_object_or_404(Reply, id=reply_id)
    thread_id = reply.thread.id
    reply.delete()
    return redirect('admin_forum_thread', thread_id)

def dashboard_forum(request):
    threads = Thread.objects.all().order_by('-created_at')
    return render(request, 'dashboard_forum_section.html', {
        'threads': threads
    })
def dashboard_forum_thread(request, thread_id):
    thread = get_object_or_404(Thread, id=thread_id)
    replies = Reply.objects.filter(thread=thread)
    return render(request, 'dashboard_forum_thread_section.html', {
        'thread': thread,
        'replies': replies
    })
def dashboard_delete_thread(request, thread_id):
    thread = get_object_or_404(Thread, id=thread_id)
    thread.delete()
    return redirect("dashboard_forum")

from django.http import JsonResponse
import json

def admin_reply(request, thread_id):
    if request.method == "POST":
        data = json.loads(request.body)
        message = data.get("message")

        thread = Thread.objects.get(id=thread_id)

        Reply.objects.create(
            thread=thread,
            author_name="Admin",
            message=message
        )

        # Re-render the modal content
        replies = thread.replies.all()
        return render(request, "forum_thread_section.html", {
            "thread": thread,
            "replies": replies
        })

