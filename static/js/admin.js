/* ============================================================
   GENERIC MODAL CONTROLS
   ============================================================ */

/**
 * Open any modal by ID
 */
function openModal(id) {
  document.getElementById(id).classList.remove("hidden");
}

/**
 * Close any modal by ID
 */
function closeModal(id) {
  document.getElementById(id).classList.add("hidden");
}

/**
 * Close modal when clicking the backdrop (outside modal-content)
 */
document.addEventListener("click", function (e) {
  const openModals = document.querySelectorAll(".modal:not(.hidden)");

  openModals.forEach((modal) => {
    if (e.target === modal) {
      modal.classList.add("hidden");
    }
  });
});

/**
 * Prevent clicks inside modal-content from closing the modal
 */
document.querySelectorAll(".modal-content").forEach((box) => {
  box.addEventListener("click", (e) => e.stopPropagation());
});


/* ============================================================
   INGREDIENT MODALS
   ============================================================ */

function openIngredientsModal() {
  removeScopedMessages("ingredient");
  openModal("ingredientsModal");
}

function closeIngredientsModal() {
  closeModal("ingredientsModal");
}

function openEditIngredientModal(id, name) {
  // Pre-fill edit form
  document.getElementById("editIngredientName").value = name;
  document.getElementById("editIngredientForm").action = `/ingredient/edit/${id}/`;
  openModal("editIngredientModal");
}

function closeEditIngredientModal() {
  closeModal("editIngredientModal");
}


/* ============================================================
   RECIPE MODALS
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
   HISTORY MODALS
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
  document.getElementById("deleteHistoryForm").action = `/history/delete/${id}/`;
  openModal("deleteHistoryModal");
}

function closeDeleteHistoryModal() {
  closeModal("deleteHistoryModal");
}


/* ============================================================
   MESSAGE SYSTEM
   ============================================================ */

/**
 * Remove messages containing a specific keyword
 */
function removeScopedMessages(keyword) {
  document.querySelectorAll(".message").forEach((msg) => {
    if (msg.textContent.toLowerCase().includes(keyword)) {
      msg.remove();
    }
  });
}

/**
 * Create a temporary message box
 */
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

/* Convenience traps */
function noHistoryTrap() {
  closeHistoryModal();
  createMessage("This cocktail has no history yet.");
}

function noRecipeTrap() {
  closeRecipesModal();
  createMessage("This cocktail has no recipe yet.");
}

function ingredientMessage(text) {
  closeIngredientsModal();
  createMessage(text);
}


/* ============================================================
   INGREDIENT LIST REFRESHER
   ============================================================ */

/**
 * Rebuild ingredient list inside the modal
 */
function refreshIngredientList(ingredients) {
  const list = document.querySelector(".modal-list");
  list.innerHTML = "";

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


/* ============================================================
   AJAX: ADD + EDIT INGREDIENTS
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {

  /* ADD INGREDIENT */
  const addForm = document.querySelector("#ingredientsModal form");

  addForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(addForm);

    const response = await fetch(addForm.action, {
      method: "POST",
      headers: { "X-Requested-With": "XMLHttpRequest" },
      body: formData,
    });

    const data = await response.json();

    if (data.error) {
      createMessage(data.message);
      closeIngredientsModal();
      return;
    }

    refreshIngredientList(data.ingredients);
    addForm.reset();
  });


  /* EDIT INGREDIENT */
  const editForm = document.getElementById("editIngredientForm");

  editForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(editForm);

    const response = await fetch(editForm.action, {
      method: "POST",
      headers: { "X-Requested-With": "XMLHttpRequest" },
      body: formData,
    });

    const data = await response.json();

    if (data.error) {
      createMessage(data.message);
      closeEditIngredientModal();
      return;
    }

    refreshIngredientList(data.ingredients);
    closeEditIngredientModal();
  });
});


/* ============================================================
   AJAX: DELETE INGREDIENT
   ============================================================ */

/**
 * Get CSRF token from page
 */
function getCSRFToken() {
  return document.querySelector("[name=csrfmiddlewaretoken]").value;
}

/**
 * Delete ingredient via AJAX
 */
async function deleteIngredient(event, id) {
  event.preventDefault();

  const response = await fetch(`/ingredient/delete/${id}/`, {
    method: "POST",
    headers: {
      "X-Requested-With": "XMLHttpRequest",
      "Content-Type": "application/json",
      "X-CSRFToken": getCSRFToken(),
    },
    body: JSON.stringify({}),
  });

  const data = await response.json();

  if (data.error) {
    createMessage(data.message);
    return;
  }

  refreshIngredientList(data.ingredients);
}


/* ============================================================
   AUTO-REMOVE DJANGO MESSAGES
   ============================================================ */

setTimeout(() => {
  document.querySelectorAll(".message").forEach((msg) => msg.remove());
}, 3000);
