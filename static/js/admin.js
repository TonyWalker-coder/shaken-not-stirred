/* ============================================================
   GENERIC MODAL CONTROLS
   ============================================================ */

/* Open any modal by ID */
function openModal(id) {
  document.getElementById(id).classList.remove("hidden");
}

/* Close any modal by ID */
function closeModal(id) {
  document.getElementById(id).classList.add("hidden");
}

/* Close when clicking backdrop */
document.addEventListener("click", function (e) {
  const openModals = document.querySelectorAll(".modal:not(.hidden)");

  openModals.forEach((modal) => {
    if (e.target === modal) {
      modal.classList.add("hidden");
    }
  });
});

/* Prevent inside clicks from closing */
document.querySelectorAll(".modal-content").forEach((box) => {
  box.addEventListener("click", (e) => e.stopPropagation());
});

/* ============================================================
       INGREDIENTS
    ============================================================ */

function openIngredientsModal() {
  removeScopedMessages("ingredient");
  openModal("ingredientsModal");
}

function closeIngredientsModal() {
  closeModal("ingredientsModal");
}

function openEditIngredientModal(id, name) {
  document.getElementById("editIngredientName").value = name;
  document.getElementById("editIngredientForm").action =
    `/ingredient/edit/${id}/`;
  openModal("editIngredientModal");
}

function closeEditIngredientModal() {
  closeModal("editIngredientModal");
}

/* ============================================================
       RECIPES
       ============================================================ */

function openRecipesModal() {
  openModal("recipesModal");
}

function closeRecipesModal() {
  closeModal("recipesModal");
}

function openEditRecipeModal(id, text) {
  document.getElementById("editRecipeText").value = text;
  document.getElementById("editRecipeForm").action = `/recipe/edit/${id}/`;
  openModal("editRecipeModal");
}

function closeEditRecipeModal() {
  closeModal("editRecipeModal");
}

function openAddRecipeModal(id) {
  document.getElementById("addRecipeForm").action = `/recipe/add/${id}/`;
  openModal("addRecipeModal");
}

function closeAddRecipeModal() {
  closeModal("addRecipeModal");
}

function openDeleteRecipeModal(id) {
  document.getElementById("deleteRecipeForm").action = `/recipe/delete/${id}/`;
  openModal("deleteRecipeModal");
}

function closeDeleteRecipeModal() {
  closeModal("deleteRecipeModal");
}

/* ============================================================
       HISTORY
       ============================================================ */

function openHistoryModal() {
  openModal("historyModal");
}

function closeHistoryModal() {
  closeModal("historyModal");
}

function openEditHistoryModal(id, text) {
  document.getElementById("editHistoryText").value = text;
  document.getElementById("editHistoryForm").action = `/history/edit/${id}/`;
  openModal("editHistoryModal");
}

function closeEditHistoryModal() {
  closeModal("editHistoryModal");
}

function openAddHistoryModal(id) {
  document.getElementById("addHistoryForm").action = `/history/add/${id}/`;
  openModal("addHistoryModal");
}

function closeAddHistoryModal() {
  closeModal("addHistoryModal");
}

function openDeleteHistoryModal(id) {
  document.getElementById("deleteHistoryForm").action =
    `/history/delete/${id}/`;
  openModal("deleteHistoryModal");
}

function closeDeleteHistoryModal() {
  closeModal("deleteHistoryModal");
}

/* ============================================================
       MESSAGE SYSTEM (Shared)
       ============================================================ */

/* Remove messages only for a specific feature */
function removeScopedMessages(keyword) {
  document.querySelectorAll(".message").forEach((msg) => {
    if (msg.textContent.toLowerCase().includes(keyword)) {
      msg.remove();
    }
  });
}

/* Create a message (used by ingredients/history/recipes) */
function createMessage(text) {
  const container =
    document.querySelector(".messages") ||
    (() => {
      const newContainer = document.createElement("div");
      newContainer.className = "messages";
      document.body.prepend(newContainer);
      return newContainer;
    })();

  const box = document.createElement("p");
  box.className = "message";
  box.textContent = text;

  container.appendChild(box);

  setTimeout(() => box.remove(), 3000);
}

/* History trap */
function noHistoryTrap() {
  closeHistoryModal();
  createMessage("This cocktail has no history yet.");
}

/* Recipe trap */
function noRecipeTrap() {
  closeRecipesModal();
  createMessage("This cocktail has no recipe yet.");
}

/* Ingredient trap */
function ingredientMessage(text) {
  closeIngredientsModal();
  createMessage(text);
}

function refreshIngredientList(ingredients) {
  const list = document.querySelector(".modal-list");
  list.innerHTML = ""; // clear existing list

  ingredients.forEach((ingredient) => {
    const div = document.createElement("div");
    div.classList.add("modal-item");

    div.innerHTML = `
            <span class="item-name">${ingredient.name}</span>

            <div class="item-actions" style="display:flex; align-items:center; gap:10px;">
                <img src="/static/cocktails/icons/${ingredient.used ? "ingredient-ok.png" : "missing.png"}"
                     class="ingredient-status-icon">

                <a href="#" class="edit-btn"
                   onclick="openEditIngredientModal(${ingredient.id}, '${ingredient.name.replace(/'/g, "\\'")}')">
                    Edit
                </a>

                <a href="/ingredient/delete/${ingredient.id}/" 
                    class="delete-btn"
                    onclick="deleteIngredient(event, ${ingredient.id})">
                    Delete
                </a>

            </div>
        `;

    list.appendChild(div);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("#ingredientsModal form");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(form);

    const response = await fetch(form.action, {
      method: "POST",
      headers: {
        "X-Requested-With": "XMLHttpRequest",
      },
      body: formData,
    });

    const data = await response.json();

    // ⭐ DUPLICATE INGREDIENT → use your existing message system
    if (data.error) {
      createMessage(data.message); // your existing message system
      closeIngredientsModal(); // <-- THIS closes the modal
      return;
    }

    // ⭐ SUCCESS → add ingredient to list
    refreshIngredientList(data.ingredients);
    form.reset();
  });
});

function addIngredientToList(ingredient) {
  const list = document.querySelector(".modal-list");

  // Remove "No ingredients yet" if present
  const emptyText = list.querySelector(".empty-text");
  if (emptyText) emptyText.remove();

  const div = document.createElement("div");
  div.classList.add("modal-item");

  div.innerHTML = `
        <span class="item-name">${ingredient.name}</span>

        <div class="item-actions" style="display:flex; align-items:center; gap:10px;">
            <img src="/static/cocktails/icons/${ingredient.used ? "ingredient-ok.png" : "missing.png"}"
                 class="ingredient-status-icon">

            <a href="#" class="edit-btn"
               onclick="openEditIngredientModal(${ingredient.id}, '${ingredient.name.replace(/'/g, "\\'")}')">
                Edit
            </a>

            <a href="/ingredients/delete/${ingredient.id}" class="delete-btn">
                Delete
            </a>
        </div>
    `;

  list.appendChild(div);
}

document.addEventListener("DOMContentLoaded", () => {
  const editForm = document.getElementById("editIngredientForm");

  editForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(editForm);

    const response = await fetch(editForm.action, {
      method: "POST",
      headers: {
        "X-Requested-With": "XMLHttpRequest",
      },
      body: formData,
    });

    const data = await response.json();

    // Duplicate → message + close modal
    if (data.error) {
      createMessage(data.message);
      closeEditIngredientModal();
      return;
    }

    // Success → refresh list + close child modal
    refreshIngredientList(data.ingredients);
    closeEditIngredientModal(); // ⭐ THIS WAS MISSING
  });
});

function getCSRFToken() {
  return document.querySelector("[name=csrfmiddlewaretoken]").value;
}

async function deleteIngredient(event, id) {
  event.preventDefault(); // stop normal navigation

  const response = await fetch(`/ingredient/delete/${id}/`, {
    method: "POST",
    headers: {
      "X-Requested-With": "XMLHttpRequest",
      "Content-Type": "application/json",
      "X-CSRFToken": getCSRFToken(), // ⭐ REQUIRED
    },
    body: JSON.stringify({}),
  });

  const data = await response.json();

  // Ingredient is used → message + keep modal open
  if (data.error) {
    createMessage(data.message);
    return;
  }

  // Success → refresh list
  refreshIngredientList(data.ingredients);
}

/* ============================================================
       Auto-remove Django messages
       ============================================================ */

setTimeout(() => {
  document.querySelectorAll(".message").forEach((msg) => msg.remove());
}, 3000);
