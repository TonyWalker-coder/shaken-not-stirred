import {
  modalMessage,
  openModal,
  getCSRFToken,
  refreshCocktailDropdown
} from "./admin-core.js";

/* ============================================================
   CUSTOMISE COCKTAIL — OPEN MODAL
   ============================================================ */
/*
   When the customise modal opens:
   - Reset the dropdown
   - Reset the ingredient list
   - Fetch fresh cocktail list for the dropdown
*/

document.addEventListener("click", async (e) => {
  const btn = e.target.closest("[data-open='customiseModal']");
  if (!btn) return;

  const select = document.getElementById("customiseCocktailSelect");
  const list = document.getElementById("customiseIngredientList");

  if (!select || !list) return;

  // Reset UI
  select.value = "";
  list.innerHTML =
    '<p class="empty-text">Choose a cocktail to view ingredients.</p>';

  // Refresh dropdown using unified helper
  await refreshCocktailDropdown(select);

  openModal("customiseModal");
});

/* ============================================================
   LOAD INGREDIENT LIST WHEN COCKTAIL IS SELECTED
   ============================================================ */
/*
   When a cocktail is selected:
   - Show "Working..."
   - Fetch ingredient data
   - Build ingredient list with add/remove buttons
*/

document.addEventListener("change", async (e) => {
  if (!e.target.matches("#customiseCocktailSelect")) return;

  const cocktailId = e.target.value;
  const list = document.getElementById("customiseIngredientList");

  if (!cocktailId) {
    list.innerHTML =
      '<p class="empty-text">Choose a cocktail to view ingredients.</p>';
    return;
  }

  modalMessage("customiseModal", "success", "Working...");

  const res = await fetch(`/cocktail/${cocktailId}/ingredients/`, {
    headers: { "X-Requested-With": "XMLHttpRequest" },
  });

  const data = await res.json();

  list.innerHTML = "";

  // Build ingredient list
  data.all_ingredients
    .sort((a, b) => a.name.localeCompare(b.name))
    .forEach((ing) => {
      const inCocktail = data.cocktail_ingredients.includes(ing.id);

      const div = document.createElement("div");
      div.classList.add("modal-item");

      div.innerHTML = `
        <span class="item-name">${ing.name}</span>

        <div class="item-actions" style="display:flex; align-items:center; gap:10px;">
          <img src="/static/cocktails/icons/${inCocktail ? "ingredient-ok.png" : "missing.png"}"
               class="ingredient-status-icon">

          <button class="${inCocktail ? "delete-btn" : "add-btn"}"
                  data-customise-action="${inCocktail ? "remove" : "add"}"
                  data-ingredient-id="${ing.id}"
                  data-cocktail-id="${cocktailId}">
            ${inCocktail ? "Remove" : "Add"}
          </button>
        </div>
      `;

      list.appendChild(div);
    });
});

/* ============================================================
   ADD / REMOVE INGREDIENT
   ============================================================ */
/*
   Delegated click handler:
   - Handles both Add and Remove buttons
   - Sends POST request
   - Refreshes ingredient list by re-triggering the dropdown change
*/

document.addEventListener("click", async (e) => {
  const btn = e.target.closest("button[data-customise-action]");
  if (!btn) return;

  const action = btn.dataset.customiseAction;
  const ingredientId = btn.dataset.ingredientId;
  const cocktailId = btn.dataset.cocktailId;

  const res = await fetch(`/cocktail/${cocktailId}/${action}/${ingredientId}/`, {
    method: "POST",
    headers: {
      "X-Requested-With": "XMLHttpRequest",
      "X-CSRFToken": getCSRFToken(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
  });

  const data = await res.json();

  if (data.error) {
    modalMessage("customiseModal", "error", data.message);
    return;
  }

  // Force refresh of ingredient list
  const select = document.getElementById("customiseCocktailSelect");
  if (select) {
    select.dispatchEvent(new Event("change", { bubbles: true }));
  }
});
