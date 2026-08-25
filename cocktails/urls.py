from django.urls import path
from . import views
from cocktails import views as cocktails_views

urlpatterns = [

    # ============================================================
    # INGREDIENTS — CRUD + JSON LIST
    # ============================================================

    # Add a new ingredient (form POST or AJAX)
    path("ingredient/add/", views.add_ingredient, name="add_ingredient"),

    # Edit an existing ingredient (AJAX POST)
    path("ingredient/edit/<int:id>/", views.edit_ingredient, name="edit_ingredient"),

    # Delete an ingredient (AJAX POST)
    path("ingredient/delete/<int:ingredient_id>/", views.delete_ingredient, name="delete_ingredient"),

    # Fetch full ingredient list (AJAX) — used when opening Ingredients modal
    path("ingredient/list/", views.ingredient_list, name="ingredient_list"),


    # ============================================================
    # HISTORY — CRUD + JSON LIST
    # ============================================================

    # Add history entry for a cocktail (one-to-one)
    path("history/add/<int:cocktail_id>/", views.history_add, name="history_add"),

    # Edit a history entry
    path("history/edit/<int:history_id>/", views.history_edit, name="history_edit"),

    # Delete a history entry
    path("history/delete/<int:history_id>/", views.history_delete, name="history_delete"),

    # JSON list of history entries (AJAX refresh)
    path("history/list/json/", views.history_list_json, name="history_list_json"),


    # ============================================================
    # RECIPES — CRUD + JSON LIST
    # ============================================================

    # Add recipe to a cocktail
    path("recipes/add/<int:cocktail_id>/", views.add_recipe, name="add-recipe"),

    # Edit recipe
    path("recipes/edit/<int:recipe_id>/", views.edit_recipe, name="edit-recipe"),

    # Delete recipe
    path("recipes/delete/<int:recipe_id>/", views.delete_recipe, name="delete-recipe"),

    # JSON list of recipes (AJAX refresh)
    path("recipes/list/json/", views.recipes_list_json, name="recipes_list_json"),


    # ============================================================
    # COCKTAILS — CRUD + VALIDATION + JSON LISTS
    # ============================================================

    # Add a new cocktail
    path("cocktail/add/", views.add_cocktail, name="add_cocktail"),

    # Check if cocktail name already exists (AJAX validation)
    path("cocktail/check-name/", views.check_cocktail_name, name="check_cocktail_name"),

    # Delete a cocktail
    path("cocktail/delete/<int:cocktail_id>/", views.delete_cocktail, name="delete_cocktail"),

    # Full cocktail list (AJAX)
    path("cocktails/list/json/", views.cocktails_list_json),

    # Simple cocktail list (alternate JSON format)
    path("cocktails/list/simple/", views.cocktails_list_json, name="cocktail_list_simple"),


    # Fetch single cocktail as JSON (used for modal editing / preview)
    path("cocktail/json/<int:cocktail_id>/", views.cocktail_json, name="cocktail_json"),


    # ============================================================
    # COCKTAIL CUSTOMISATION — INGREDIENT ASSIGNMENT
    # ============================================================

    # Get ingredients assigned to a cocktail (JSON)
    path("cocktail/<int:cocktail_id>/ingredients/", views.cocktail_ingredients_json),

    # Assign ingredient to cocktail
    path("cocktail/<int:cocktail_id>/add/<int:ingredient_id>/", views.cocktail_add_ingredient),

    # Remove ingredient from cocktail
    path("cocktail/<int:cocktail_id>/remove/<int:ingredient_id>/", views.cocktail_remove_ingredient),


    # ============================================================
    # IMAGES — UPLOAD, ASSIGN, LIST
    # ============================================================

    # Upload an image (cocktail image manager)
    path("images/upload/", views.upload_image, name="upload_image"),

    # Assign uploaded image to a cocktail
    path("images/assign/<int:cocktail_id>/<str:filename>/", views.assign_image, name="assign_image"),

    # List all uploaded images (AJAX)
    path("images/list/", views.image_list, name="image_list"),


    # ============================================================
    # GLOBAL REFRESH — MULTI‑SECTION AJAX UPDATE
    # ============================================================

    # Refresh all admin sections at once (ingredients, recipes, history, cocktails)
    path("refresh-all/", views.refresh_all, name="refresh_all"),

    # ============================================================
    # TEST DATA — DEVELOPMENT TOOLS
    # ============================================================

    path("testdata/", views.test_data_page, name="test_data_page"),
    path("testdata/break-bloody-mary/", views.break_bloody_mary, name="break_bloody_mary"),
    path("testdata/fix-bloody-mary/", views.fix_bloody_mary, name="fix_bloody_mary"),
    path("testdata/reset-db/", views.reset_db, name="reset_db"),

    # ============================================================
    # USER AREA — DEVELOPMENT TOOLS
    # ============================================================
    path("user/", views.user_area, name="user_area"),

    path('user/forum/', views.user_forum, name='user_forum'),
    path('user/forum/new/', views.new_thread, name='new_thread'),
    path('user/forum/<int:thread_id>/', views.thread_detail, name='thread_detail'),
    path('forum/', cocktails_views.forum, name='forum'),

    path("admin/forum/", cocktails_views.admin_forum, name="admin_forum"),
    path("admin/forum/thread/<int:thread_id>/", cocktails_views.admin_forum_thread, name="admin_forum_thread"),
    path("admin/forum/delete-thread/<int:thread_id>/", cocktails_views.delete_thread, name="delete_thread"),
    path("admin/forum/delete-reply/<int:reply_id>/", cocktails_views.delete_reply, name="delete_reply"),

    path("dashboard/forum/", views.dashboard_forum, name="dashboard_forum"),
    path("dashboard/forum/thread/<int:thread_id>/", views.dashboard_forum_thread, name="dashboard_forum_thread"),
    path("dashboard/forum/delete-thread/<int:thread_id>/", views.dashboard_delete_thread, name="dashboard_delete_thread"),

    path("admin/forum/reply/<int:thread_id>/", cocktails_views.admin_reply, name="admin_reply"),

    path('user/lookup/', views.ingredient_lookup, name='ingredient_lookup'),
    path('user/lookup/cocktail/<int:pk>/', views.lookup_cocktail_detail, name='lookup_cocktail_detail'),



]
