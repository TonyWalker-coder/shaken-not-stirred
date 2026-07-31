function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove("hidden");
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.add("hidden");
}

document.addEventListener("click", function (e) {
  document.querySelectorAll(".modal:not(.hidden)").forEach((modal) => {
    if (e.target === modal) modal.classList.add("hidden");
  });
});

document.querySelectorAll(".modal-content").forEach((box) => {
  box.addEventListener("click", (e) => e.stopPropagation());
});

function getMessageContainer() {
  return (
    document.querySelector(".messages") ||
    (() => {
      const newContainer = document.createElement("div");
      newContainer.className = "messages";
      document.body.prepend(newContainer);
      return newContainer;
    })()
  );
}

function showMessage(text, type = "error") {
  const container = getMessageContainer();
  const box = document.createElement("p");
  box.className = `message ${type}`;
  box.textContent = text;
  container.appendChild(box);
  setTimeout(() => box.remove(), 3000);
}

function removeScopedMessages(keyword) {
  document.querySelectorAll(".message").forEach((msg) => {
    if (msg.textContent.toLowerCase().includes(keyword.toLowerCase())) {
      msg.remove();
    }
  });
}

function noHistoryTrap() {
  closeHistoryModal();
  showMessage("This cocktail has no history yet.", "error");
}

function noRecipeTrap() {
  closeRecipesModal();
  showMessage("This cocktail has no recipe yet.", "error");
}

function ingredientMessage(text) {
  closeIngredientsModal();
  showMessage(text, "error");
}

function openIngredientsModal() {
  removeScopedMessages("ingredient");
  openModal("ingredientsModal");
}

function closeIngredientsModal() {
  closeModal("ingredientsModal");
}

function openEditIngredientModal(id, name) {
  document.getElementById("editIngredientName").value = name;
  document.getElementById("editIngredientForm").action = `/ingredient/edit/${id}/`;
  openModal("editIngredientModal");
}

function closeEditIngredientModal() {
  closeModal("editIngredientModal");
}

/* ================================
   RECIPE MODAL — OPEN / CLOSE
================================ */

function openRecipesModal() {
    document.getElementById("recipesModal").classList.remove("hidden");
}

function closeRecipesModal() {
    document.getElementById("recipesModal").classList.add("hidden");
}

/* ================================
   EDIT RECIPE
================================ */

function openEditRecipeModal(recipeId, text) {
    const modal = document.getElementById("editRecipeModal");
    const form = document.getElementById("editRecipeForm");
    const textarea = document.getElementById("editRecipeText");

    textarea.value = text;
    form.action = `/recipes/edit/${recipeId}/`;

    modal.classList.remove("hidden");
}

function closeEditRecipeModal(event) {
    event?.stopPropagation();
    document.getElementById("editRecipeModal").classList.add("hidden");
}


/* ================================
   ADD RECIPE
================================ */

function openAddRecipeModal(cocktailId) {
    const modal = document.getElementById("addRecipeModal");
    const form = document.getElementById("addRecipeForm");

    form.action = `/recipes/add/${cocktailId}/`;
    modal.classList.remove("hidden");
}

function closeAddRecipeModal(event) {
    event?.stopPropagation();
    document.getElementById("addRecipeModal").classList.add("hidden");
}

/* ================================
   DELETE RECIPE
================================ */

function openDeleteRecipeModal(recipeId) {
    const modal = document.getElementById("deleteRecipeModal");
    const form = document.getElementById("deleteRecipeForm");

    form.action = `/recipes/delete/${recipeId}/`;
    modal.classList.remove("hidden");
}

function closeDeleteRecipeModal(event) {
    event?.stopPropagation();
    document.getElementById("deleteRecipeModal").classList.add("hidden");
}

/* ================================
   AUTO-CLOSE CHILD MODALS + REFRESH
================================ */

document.getElementById("addRecipeForm").addEventListener("submit", function () {
    
    refreshRecipesModal();
    closeAddRecipeModal();
});

document.getElementById("editRecipeForm").addEventListener("submit", function () {
    
    refreshRecipesModal();
    closeEditRecipeModal();
});

document.getElementById("deleteRecipeForm").addEventListener("submit", function () {
    
    refreshRecipesModal();
    closeDeleteRecipeModal();
});


/* ================================
   REFRESH THE RECIPE MODAL CONTENT
================================ */

function refreshRecipesModal() {
    fetch("/recipes/modal/")
        .then(response => response.text())
        .then(html => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, "text/html");

            const newList = doc.querySelector(".history-list");
            const oldList = document.querySelector("#recipesModal .history-list");

            oldList.innerHTML = newList.innerHTML;
        })
        .catch(err => console.error("Refresh failed:", err));
}

function openHistoryModal() {
  openModal("historyModal");
}

function closeHistoryModal() {
  closeModal("historyModal");
}

function openEditHistoryModal(historyId, text) {
  document.getElementById("editHistoryForm").action = `/history/edit/${historyId}/`;
  document.getElementById("editHistoryText").value = text;
  openModal("editHistoryModal");
}

function closeEditHistoryModal(e) {
  if (e) e.stopPropagation();
  closeModal("editHistoryModal");
}

function openAddHistoryModal(cocktailId) {
  document.getElementById("addHistoryForm").action = `/history/add/${cocktailId}/`;
  openModal("addHistoryModal");
}

function closeAddHistoryModal(e) {
  if (e) e.stopPropagation();
  closeModal("addHistoryModal");
}

function openDeleteHistoryModal(historyId) {
  document.getElementById("deleteHistoryForm").action = `/history/delete/${historyId}/`;
  openModal("deleteHistoryModal");
}

function closeDeleteHistoryModal(e) {
  if (e) e.stopPropagation();
  closeModal("deleteHistoryModal");
}

function ajaxHistorySubmit(formId) {
  const oldForm = document.getElementById(formId);
  if (!oldForm) return;

  const form = oldForm.cloneNode(true);
  oldForm.parentNode.replaceChild(form, oldForm);

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    const url = form.action;
    const formData = new FormData(form);

    fetch(url, {
      method: "POST",
      headers: { "X-Requested-With": "XMLHttpRequest" },
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          showMessage(data.message, "error");
          return;
        }

        refreshHistoryList();

        if (formId === "editHistoryForm") closeEditHistoryModal();
        if (formId === "addHistoryForm") closeAddHistoryModal();
        if (formId === "deleteHistoryForm") closeDeleteHistoryModal();
      });
  });
}

ajaxHistorySubmit("addHistoryForm");
ajaxHistorySubmit("editHistoryForm");
ajaxHistorySubmit("deleteHistoryForm");

function refreshHistoryList() {
  fetch("/history/list/json/")
    .then((res) => res.json())
    .then((data) => {
      const container = document.querySelector(".history-list");
      if (!container) return;

      container.innerHTML = "";

      data.cocktails.forEach((c) => {
        container.innerHTML += `
          <div class="history-item">
            <span class="history-name">${c.name}</span>
            <div class="history-actions">
              ${
                c.history
                  ? `
                <img src="/static/cocktails/icons/history-ok.png" class="history-icon">
                <a href="#" class="edit-btn"
                   onclick="openEditHistoryModal(${c.history_id}, '${c.history.replace(/'/g, "\\'")}')">Edit</a>
                <a href="#" class="delete-btn"
                   onclick="openDeleteHistoryModal(${c.history_id})">Delete</a>
              `
                  : `
                <img src="/static/cocktails/icons/missing.png" class="history-icon">
                <a href="#" class="add-btn"
                   onclick="openAddHistoryModal(${c.id})">Add</a>
                <a href="#" class="delete-btn" onclick="noHistoryTrap()">Delete</a>
              `
              }
            </div>
          </div>
        `;
      });
    });
}

function refreshIngredientList(ingredients) {
  const list = document.querySelector(".modal-list");
  if (!list) return;

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

document.addEventListener("DOMContentLoaded", () => {
  const addForm = document.querySelector("#ingredientsModal form");
  if (addForm) {
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
        showMessage(data.message, "error");
        closeIngredientsModal();
        return;
      }

      refreshIngredientList(data.ingredients);
      addForm.reset();
    });
  }

  const editForm = document.getElementById("editIngredientForm");
  if (editForm) {
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
        showMessage(data.message, "error");
        closeEditIngredientModal();
        return;
      }

      refreshIngredientList(data.ingredients);
      closeEditIngredientModal();
    });
  }
});

function getCSRFToken() {
  const token = document.querySelector("[name=csrfmiddlewaretoken]");
  return token ? token.value : "";
}

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

    // ⭐ CLOSE THE INGREDIENTS MODAL
    document.getElementById("ingredientsModal").classList.add("hidden");

    // ⭐ SHOW THE ERROR MESSAGE
    showMessage(data.message, "error");
    return;
  }

  refreshIngredientList(data.ingredients);
}



setTimeout(() => {
  document.querySelectorAll(".message").forEach((msg) => msg.remove());
}, 3000);
