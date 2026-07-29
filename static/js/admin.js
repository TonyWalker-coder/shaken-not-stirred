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
  document.getElementById("editIngredientForm").action =
    `/ingredient/edit/${id}/`;
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

function openEditHistoryModal(historyId, text) {
    document.getElementById("editHistoryForm").action = `/history/edit/${historyId}/`;
    document.getElementById("editHistoryText").value = text;
    document.getElementById("editHistoryModal").classList.remove("hidden");
}



function closeEditHistoryModal(e) {
    if (e) e.stopPropagation();
    document.getElementById("editHistoryModal").classList.add("hidden");
}

function openAddHistoryModal(cocktailId) {
    document.getElementById("addHistoryForm").action = `/history/add/${cocktailId}/`;
    openModal("addHistoryModal");
}

function closeAddHistoryModal(e) {
    if (e) e.stopPropagation();
    document.getElementById("addHistoryModal").classList.add("hidden");
}

function openDeleteHistoryModal(historyId) {
    document.getElementById("deleteHistoryForm").action = `/history/delete/${historyId}/`;
    openModal("deleteHistoryModal");
}

function closeDeleteHistoryModal(e) {
    if (e) e.stopPropagation();
    document.getElementById("deleteHistoryModal").classList.add("hidden");
}

// --- HISTORY AJAX HANDLER ---
function ajaxHistorySubmit(formId) {
    const form = document.getElementById(formId);

    form.addEventListener("submit", function (e) {
        e.preventDefault();

        const url = form.action;
        const formData = new FormData(form);

        fetch(url, {
            method: "POST",
            headers: { "X-Requested-With": "XMLHttpRequest" },
            body: formData
        })
        .then(res => res.json())
        .then(data => {

            showMessage(data.message, data.error ? "error" : "success");

            if (!data.error) {
                refreshHistoryList();
            }

            // ⭐ CLOSE THE MODAL AFTER SUCCESSFUL EDIT
            if (formId === "editHistoryForm" && !data.error) {
                closeEditHistoryModal();
            }
        });
    });
}




function refreshHistoryList() {
    fetch("/history/list/json/")
        .then(res => res.json())
        .then(data => {
            const container = document.querySelector(".history-list");
            container.innerHTML = "";

            data.cocktails.forEach(c => {
                container.innerHTML += `
                    <div class="history-item">
                        <span class="history-name">${c.name}</span>
                        <div class="history-actions">
                            ${c.history ? `
                                <img src="/static/cocktails/icons/history-ok.png" class="history-icon">
                                <a href="#" class="edit-btn"
                                   onclick="openEditHistoryModal(${c.history_id}, '${c.history.replace(/'/g, "\\'")}')">Edit</a>
                                <a href="#" class="delete-btn"
                                   onclick="openDeleteHistoryModal(${c.history_id})">Delete</a>
                            ` : `
                                <img src="/static/cocktails/icons/missing.png" class="history-icon">
                                <a href="#" class="add-btn"
                                   onclick="openAddHistoryModal(${c.id})">Add</a>
                                <a href="#" class="delete-btn" onclick="noHistoryTrap()">Delete</a>
                            `}
                        </div>
                    </div>
                `;
            });
        });
}



// Attach handlers
ajaxHistorySubmit("addHistoryForm", "addHistoryModal");
ajaxHistorySubmit("editHistoryForm", "editHistoryModal");
ajaxHistorySubmit("deleteHistoryForm", "deleteHistoryModal");

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

function ajaxHistorySubmit(formId) {
    const oldForm = document.getElementById(formId);

    // Remove old listeners
    const form = oldForm.cloneNode(true);
    oldForm.parentNode.replaceChild(form, oldForm);

    form.addEventListener("submit", function (e) {
        e.preventDefault();

        const url = form.action;
        const formData = new FormData(form);

        fetch(url, {
            method: "POST",
            headers: { "X-Requested-With": "XMLHttpRequest" },
            body: formData
        })
        .then(res => res.json())
        .then(data => {

            if (!data.error) {
                refreshHistoryList();

                // ⭐ CLOSE THE CORRECT MODAL
                if (formId === "editHistoryForm") {
                    closeEditHistoryModal();
                }
                if (formId === "addHistoryForm") {
                    closeAddHistoryModal();
                }
                if (formId === "deleteHistoryForm") {
                    closeDeleteHistoryModal();
                }
            }
        });
    });
}




// Attach handlers
ajaxHistorySubmit("addHistoryForm");
ajaxHistorySubmit("editHistoryForm");
ajaxHistorySubmit("deleteHistoryForm");

function showMessage(text, type = "success") {
    const container = document.querySelector(".messages") || (() => {
        const newContainer = document.createElement("div");
        newContainer.className = "messages";
        document.body.prepend(newContainer);
        return newContainer;
    })();

    const box = document.createElement("p");
    box.className = `message ${type}`;
    box.textContent = text;

    container.appendChild(box);

    setTimeout(() => box.remove(), 3000);
}


/* ============================================================
   AUTO-REMOVE DJANGO MESSAGES
   ============================================================ */

setTimeout(() => {
  document.querySelectorAll(".message").forEach((msg) => msg.remove());
}, 3000);
