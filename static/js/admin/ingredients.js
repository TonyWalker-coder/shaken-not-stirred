import {
  modalMessage,
  closeModal,
  openModal,
  getCSRFToken,
} from "./admin-core.js";

/* ============================================================
   INGREDIENTS — ADD NEW INGREDIENT  
   ============================================================ */
document.addEventListener("submit", async (e) => {
  e.stopPropagation();
  const form = e.target;
  if (!form.matches("#ingredientsModal form")) return;

  e.preventDefault();

  const formData = new FormData(form);

  const res = await fetch(form.action, {
    method: "POST",
    headers: { "X-Requested-With": "XMLHttpRequest" },
    body: formData,
  });

  const data = await res.json();

  if (data.error) {
    modalMessage("ingredientsModal", "error", data.message);
    return;
  }

  refreshIngredientList(data.ingredients);
  modalMessage("ingredientsModal", "success", "Ingredient added!");
  form.reset();
});

document.addEventListener("submit", async (e) => {
  const form = e.target.closest("#editIngredientForm");
  if (!form) return;

  e.preventDefault();
  e.stopPropagation();

  const formData = new FormData(form);

  const res = await fetch(form.action, {
    method: "POST",
    headers: { "X-Requested-With": "XMLHttpRequest" },
    body: formData,
  });

  const data = await res.json();

  if (data.error) {
    modalMessage("editIngredientModal", "error", data.message);
    return;
  }

  closeModal("editIngredientModal");
  refreshIngredientList(data.ingredients);
  modalMessage("ingredientsModal", "success", "Ingredient updated!");
});



/* ============================================================
   INGREDIENTS — DELETE INGREDIENT
   ============================================================ */
document.addEventListener("click", async (e) => {
  const btn = e.target.closest("[data-delete-ingredient]");
  if (!btn) return;

  e.stopPropagation();

  const ingredientId = btn.dataset.deleteIngredient;

  const res = await fetch(`/ingredient/delete/${ingredientId}/`, {
    method: "POST",
    headers: {
      "X-Requested-With": "XMLHttpRequest",
      "X-CSRFToken": getCSRFToken(),
    },
  });

  const data = await res.json();

  if (data.error) {
    modalMessage("ingredientsModal", "error", data.message);
    return;
  }

  refreshIngredientList(data.ingredients);
  modalMessage("ingredientsModal", "success", "Ingredient deleted!");
});

/* ============================================================
   REFRESH INGREDIENT LIST — FIXED & STABLE
   ============================================================ */

function refreshIngredientList(ingredients) {
  console.log("REFRESH LIST:", ingredients); 
  const list = document.querySelector("#ingredientsModal .modal-list");
  if (!list) return;

  list.innerHTML = "";

  ingredients
    .filter((ing) => ing.name && ing.name.trim().length > 0) // remove null/blank
    .sort((a, b) => a.name.localeCompare(b.name))
    .forEach((ingredient) => {
      const div = document.createElement("div");
      div.classList.add("modal-item");

      div.innerHTML = `
        <span class="item-name">${ingredient.name}</span>
        <div class="item-actions" style="display:flex; align-items:center; gap:10px;">
          <img src="/static/cocktails/icons/${ingredient.used ? "ingredient-ok.png" : "missing.png"}"
               class="ingredient-status-icon">

          <button class="edit-btn"
                  data-open="editIngredientModal"
                  data-id="${ingredient.id}"
                  data-name="${ingredient.name.replace(/"/g, "&quot;")}">
            Edit
          </button>

          <button class="delete-btn"
                  data-delete-ingredient="${ingredient.id}">
            Delete
          </button>
        </div>
      `;

      list.appendChild(div);
    });
}
document.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-open='editIngredientModal']");
  if (!btn) return;

  const id = btn.dataset.id;
  const name = btn.dataset.name;

  const form = document.getElementById("editIngredientForm");
  form.action = `/ingredient/edit/${id}/`;

  document.getElementById("editIngredientName").value = name;

  openModal("editIngredientModal");
});

document.addEventListener("click", async (e) => {
  const btn = e.target.closest("[data-open='ingredientsModal']");
  if (!btn) return;

  e.preventDefault();
  e.stopPropagation();

  // Fetch fresh ingredients BEFORE opening modal
  const res = await fetch("/ingredient/list/", {
    headers: { "X-Requested-With": "XMLHttpRequest" },
    
    
  });

  const data = await res.json();
  
  

  refreshIngredientList(data.ingredients);

  // NOW open the modal
  openModal("ingredientsModal");
});
