/* ============================================================
   UNIVERSAL MODAL ENGINE — OPTION A (NO INLINE JS)
   ============================================================ */

function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove("hidden");
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.add("hidden");
}

/* Backdrop click closes modal */
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("modal")) {
    e.target.classList.add("hidden");
  }
});

/* Prevent closing when clicking inside modal-content */
document.addEventListener("click", (e) => {
  if (e.target.closest(".modal-content")) {
    e.stopPropagation();
  }
});

/* Delegated modal open/close buttons */
document.addEventListener("click", (e) => {
  const openTarget = e.target.closest("[data-open]");
  const closeTarget = e.target.closest("[data-close]");

  if (openTarget) {
    const id = openTarget.dataset.open;
    openModal(id);
  }

  if (closeTarget) {
    const id = closeTarget.dataset.close;
    closeModal(id);
  }
});


/* ============================================================
   MESSAGE SYSTEM
   ============================================================ */

function getMessageContainer() {
  return (
    document.querySelector(".messages") ||
    (() => {
      const div = document.createElement("div");
      div.className = "messages";
      document.body.prepend(div);
      return div;
    })()
  );
}

function showMessage(text, type = "error") {
  const container = getMessageContainer();
  const msg = document.createElement("p");
  msg.className = `message ${type}`;
  msg.textContent = text;
  container.appendChild(msg);
  setTimeout(() => msg.remove(), 3000);
}

function removeScopedMessages(keyword) {
  document.querySelectorAll(".message").forEach((msg) => {
    if (msg.textContent.toLowerCase().includes(keyword.toLowerCase())) {
      msg.remove();
    }
  });
}

/* ============================================================
   INGREDIENTS
   ============================================================ */

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

/* Ingredient modal population */
document.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-open='editIngredientModal']");
  if (!btn) return;

  const id = btn.dataset.id;
  const name = btn.dataset.name;

  document.getElementById("editIngredientName").value = name;
  document.getElementById("editIngredientForm").action =
    `/ingredient/edit/${id}/`;
});

/* Ingredient add form */
document.addEventListener("DOMContentLoaded", () => {
  const addForm = document.querySelector("#ingredientsModal form");
  if (!addForm) return;

  addForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(addForm);

    const res = await fetch(addForm.action, {
      method: "POST",
      headers: { "X-Requested-With": "XMLHttpRequest" },
      body: formData,
    });

    const data = await res.json();

    if (data.error) {
      showMessage(data.message, "error");
      closeModal("ingredientsModal");
      return;
    }

    refreshIngredientList(data.ingredients);
    addForm.reset();
  });
});

/* Ingredient edit form */
document
  .getElementById("editIngredientForm")
  ?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);

    const res = await fetch(form.action, {
      method: "POST",
      headers: { "X-Requested-With": "XMLHttpRequest" },
      body: formData,
    });

    const data = await res.json();

    if (data.error) {
      showMessage(data.message, "error");
      closeModal("editIngredientModal");
      return;
    }

    refreshIngredientList(data.ingredients);
    closeModal("editIngredientModal");
  });

/* Ingredient delete */
function getCSRFToken() {
  const token = document.querySelector("[name=csrfmiddlewaretoken]");
  return token ? token.value : "";
}

/* History AJAX submit */
["addHistoryForm", "editHistoryForm", "deleteHistoryForm"].forEach((id) => {
  const form = document.getElementById(id);
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const formData = new FormData(form);

    fetch(form.action, {
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
        closeModal(form.closest(".modal").id);
      });
  });
});

/* ============================================================
   RECIPES (Unified)
   ============================================================ */

function refreshRecipesModal() {
  fetch("/recipes/list/json/")
    .then((res) => res.json())
    .then((data) => {
      const container = document.querySelector("#recipesModal .history-list");
      if (!container) return;

      container.innerHTML = "";

      data.cocktails.forEach((c) => {
        container.innerHTML += `
          <div class="history-item">
            <span class="history-name">${c.name}</span>
            <div class="history-actions">

              ${
                c.recipe
                  ? `
              <img src="/static/cocktails/icons/recipe-ok.png" class="history-icon">

              <button class="edit-btn"
                      data-open="editRecipeModal"
                      data-id="${c.recipe_id}"
                      data-text="${c.recipe.replace(/"/g, "&quot;")}">
                Edit
              </button>

              <button class="delete-btn"
                      data-open="deleteRecipeModal"
                      data-id="${c.recipe_id}">
                Delete
              </button>
              `
                  : `
              <img src="/static/cocktails/icons/missing.png" class="history-icon">

              <button class="add-btn"
                      data-open="addRecipeModal"
                      data-id="${c.id}">
                Add
              </button>

              <button class="delete-btn"
                      data-open="noRecipeTrap">
                Delete
              </button>
              `
              }

            </div>
          </div>
        `;
      });
    });
}

/* Populate edit recipe modal */
document.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-open='editRecipeModal']");
  if (!btn) return;

  document.getElementById("editRecipeForm").action =
    `/recipes/edit/${btn.dataset.id}/`;
  document.getElementById("editRecipeText").value = btn.dataset.text;
});

/* Populate add recipe modal */
document.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-open='addRecipeModal']");
  if (!btn) return;

  document.getElementById("addRecipeForm").action =
    `/recipes/add/${btn.dataset.id}/`;
});

/* Populate delete recipe modal */
document.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-open='deleteRecipeModal']");
  if (!btn) return;

  document.getElementById("deleteRecipeForm").action =
    `/recipes/delete/${btn.dataset.id}/`;
});

/* Recipe AJAX submit */
["addRecipeForm", "editRecipeForm", "deleteRecipeForm"].forEach((id) => {
  const form = document.getElementById(id);
  if (!form) return;

  document.addEventListener("click", async (e) => {
    const btn = e.target.closest("[data-delete-ingredient]");
    if (!btn) return;

    const id = btn.dataset.deleteIngredient;

    const res = await fetch(`/ingredient/delete/${id}/`, {
      method: "POST",
      headers: {
        "X-Requested-With": "XMLHttpRequest",
        "Content-Type": "application/json",
        "X-CSRFToken": getCSRFToken(),
      },
      body: JSON.stringify({}),
    });

    const data = await res.json();

    if (data.error) {
      closeModal("ingredientsModal");
      showMessage(data.message, "error");
      return;
    }

    refreshIngredientList(data.ingredients);
  });

  /* ============================================================
   HISTORY (Unified)
   ============================================================ */

  function refreshHistoryList() {
    fetch("/history/list/json/")
      .then((res) => res.json())
      .then((data) => {
        const container = document.querySelector("#historyModal .history-list");
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

              <button class="edit-btn"
                      data-open="editHistoryModal"
                      data-id="${c.history_id}"
                      data-text="${c.history.replace(/"/g, "&quot;")}">
                Edit
              </button>

              <button class="delete-btn"
                      data-open="deleteHistoryModal"
                      data-id="${c.history_id}">
                Delete
              </button>
              `
                  : `
              <img src="/static/cocktails/icons/missing.png" class="history-icon">

              <button class="add-btn"
                      data-open="addHistoryModal"
                      data-id="${c.id}">
                Add
              </button>

              <button class="delete-btn"
                      data-open="noHistoryTrap">
                Delete
              </button>
              `
              }

            </div>
          </div>
        `;
        });
      });
  }

  /* Populate edit history modal */
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-open='editHistoryModal']");
    if (!btn) return;

    document.getElementById("editHistoryForm").action =
      `/history/edit/${btn.dataset.id}/`;
    document.getElementById("editHistoryText").value = btn.dataset.text;
  });

  /* Populate add history modal */
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-open='addHistoryModal']");
    if (!btn) return;

    document.getElementById("addHistoryForm").action =
      `/history/add/${btn.dataset.id}/`;
  });

  /* Populate delete history modal */
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-open='deleteHistoryModal']");
    if (!btn) return;

    document.getElementById("deleteHistoryForm").action =
      `/history/delete/${btn.dataset.id}/`;
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const formData = new FormData(form);

    fetch(form.action, {
      method: "POST",
      headers: { "X-Requested-With": "XMLHttpRequest" },
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        closeModal(form.closest(".modal").id);
        refreshRecipesModal();
      });
  });
});

/* ============================================================
   ADD COCKTAIL — UNIQUE NAME VALIDATION + CREATE LOCK
   ============================================================ */

const cocktailNameInput = document.getElementById("newCocktailName");
const nameMsg = document.getElementById("nameValidationMsg");
const createBtn = document.getElementById("createCocktailBtn");

let nameIsValid = false;

/* Live name validation */
cocktailNameInput?.addEventListener("input", async () => {
  const name = cocktailNameInput.value.trim();

  if (!name) {
    nameMsg.style.display = "none";
    createBtn.disabled = true;
    nameIsValid = false;
    return;
  }

  const res = await fetch(
    `/cocktail/check-name/?name=${encodeURIComponent(name)}`,
    {
      headers: { "X-Requested-With": "XMLHttpRequest" },
    },
  );

  const data = await res.json();

  if (data.exists) {
    nameMsg.style.display = "block";
    nameIsValid = false;
    createBtn.disabled = true;
  } else {
    nameMsg.style.display = "none";
    nameIsValid = true;
    createBtn.disabled = false;
  }
});

/* Submit handler */
document
  .getElementById("addCocktailForm")
  ?.addEventListener("submit", async (e) => {
    console.log("CREATE BUTTON CLICKED");
    e.preventDefault();
    if (!nameIsValid) return;

    const form = e.target;
    const formData = new FormData(form);

    const res = await fetch(form.action, {
      method: "POST",
      headers: { "X-Requested-With": "XMLHttpRequest" },
      body: formData,
    });

    const data = await res.json();

    if (data.error) {
      showMessage(data.message, "error");
      return;
    }

    // Close the Add Cocktail modal
    closeModal("addCocktailModal");

    // Show the reminder modal
    openModal("imageReminderModal");

    refreshHistoryList?.();
    refreshRecipesModal?.();
  });

/* ============================================================
   INLINE INGREDIENT ADD (INSIDE ADD COCKTAIL MODAL)
   ============================================================ */

const inlineInput = document.getElementById("newIngredientName");
const inlineBtn = document.getElementById("addIngredientInlineBtn");
const inlineMsg = document.getElementById("inlineIngredientMsg");

inlineBtn?.addEventListener("click", async () => {
  const name = inlineInput.value.trim().toLowerCase();
  if (!name) return;

  const formData = new FormData();
  formData.append("name", name);

  const res = await fetch("/ingredient/add/", {
    method: "POST",
    headers: {
      "X-Requested-With": "XMLHttpRequest",
      "X-CSRFToken": getCSRFToken(),
    },
    body: formData,
  });

  const data = await res.json();

  if (data.error) {
    inlineMsg.textContent = data.message;
    inlineMsg.style.display = "block";
    return;
  }

  // Ingredient added → refresh ingredient list
  inlineMsg.style.display = "none";
  inlineInput.value = "";

  refreshIngredientCheckboxList(data.ingredients);
});

function refreshIngredientCheckboxList(ingredients) {
  const list = document.querySelector("#addCocktailModal .modal-list");
  if (!list) return;

  list.innerHTML = "";

  ingredients.forEach((ing) => {
    const div = document.createElement("div");
    div.className = "modal-item";

    div.innerHTML = `
      <label class="ingredient-select">
        <input type="checkbox" name="ingredients" value="${ing.id}" />
        <span>${ing.name}</span>
      </label>
    `;

    list.appendChild(div);
  });
}

/* ============================================================
   DELETE COCKTAILS
   ============================================================ */

/* 1. Open confirm modal + inject cocktail name + ID */
document.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-open='confirmDeleteCocktailModal']");
  if (!btn) return;

  const cocktailId = btn.dataset.id;
  const cocktailName = btn.dataset.name;

  // Update confirm text
  const text = document.getElementById("confirmDeleteCocktailText");
  text.textContent = `Are you sure you want to delete "${cocktailName}"?`;

  // Update form action
  const form = document.getElementById("deleteCocktailForm");
  form.action = `/cocktail/delete/${cocktailId}/`;

  openModal("confirmDeleteCocktailModal");
});

/* 2. Delete Cocktail (AJAX) */
document
  .getElementById("deleteCocktailForm")
  ?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const form = e.target;
    const url = form.action;

    const res = await fetch(url, {
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
      showMessage(data.message, "error");
      closeModal("confirmDeleteCocktailModal");
      return;
    }

    // SUCCESS — refresh all cocktail-related modals
    refreshCocktailList(data.cocktails);

    closeModal("confirmDeleteCocktailModal");
    closeModal("deleteCocktailModal");
    refreshCocktailList?.(data.cocktails);

    showMessage("Cocktail deleted", "success");
  });

/* 3. Refresh cocktail list (used by delete + add) */
function refreshCocktailList(cocktails) {
  /* HISTORY MODAL */
  const historyBlock = document.querySelector("#historyModal .history-list");
  if (historyBlock) {
    historyBlock.innerHTML = "";
    cocktails.forEach((c) => {
      historyBlock.innerHTML += `
        <div class="history-item">
          <span class="history-name">${c.name}</span>
          <div class="history-actions">
            <img src="/static/cocktails/icons/missing.png" class="history-icon">
            <button class="add-btn" data-open="addHistoryModal" data-id="${c.id}">Add</button>
            <button class="delete-btn" data-open="noHistoryTrap">Delete</button>
          </div>
        </div>
      `;
    });
  }

  /* RECIPES MODAL */
  const recipeBlock = document.querySelector("#recipesModal .history-list");
  if (recipeBlock) {
    recipeBlock.innerHTML = "";
    cocktails.forEach((c) => {
      recipeBlock.innerHTML += `
        <div class="history-item">
          <span class="history-name">${c.name}</span>
          <div class="history-actions">
            <img src="/static/cocktails/icons/missing.png" class="history-icon">
            <button class="add-btn" data-open="addRecipeModal" data-id="${c.id}">Add</button>
            <button class="delete-btn" data-open="noRecipeTrap">Delete</button>
          </div>
        </div>
      `;
    });
  }

  /* DELETE COCKTAIL MODAL */
  const deleteBlock = document.querySelector(
    "#deleteCocktailModal .modal-list",
  );
  if (deleteBlock) {
    deleteBlock.innerHTML = "";
    cocktails.forEach((c) => {
      deleteBlock.innerHTML += `
        <div class="modal-item">
          <span class="item-name">${c.name}</span>
          <div class="item-actions">
            <button class="delete-btn"
                    data-open="confirmDeleteCocktailModal"
                    data-id="${c.id}"
                    data-name="${c.name.replace(/"/g, "&quot;")}">
              Delete
            </button>
          </div>
        </div>
      `;
    });
  }
}

document.addEventListener("click", async (e) => {
  const btn = e.target.closest("[data-open='deleteCocktailModal']");
  if (!btn) return;

  // Fetch fresh cocktail list
  const res = await fetch("/cocktails/list/json/", {
    headers: { "X-Requested-With": "XMLHttpRequest" },
  });

  const data = await res.json();

  // Refresh the delete modal list
  refreshCocktailList(data.cocktails);

  // Now open the modal
  openModal("deleteCocktailModal");
});

/* ============================================================
   CUSTOMISE COCKTAIL
   ============================================================ */

/* Reset customise modal every time it opens */
document.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-open='customiseModal']");
  if (!btn) return;

  const select = document.getElementById("customiseCocktailSelect");
  const list = document.getElementById("customiseIngredientList");

  if (select) select.value = "";
  if (list) {
    list.innerHTML =
      '<p class="empty-text">Choose a cocktail to view ingredients.</p>';
  }
});

/* 1. Load ingredient list when selecting a cocktail */
document.addEventListener("change", (e) => {
  if (!e.target.matches("#customiseCocktailSelect")) return;

  const cocktailId = e.target.value;
  const list = document.getElementById("customiseIngredientList");

  if (!cocktailId) {
    list.innerHTML =
      '<p class="empty-text">Choose a cocktail to view ingredients.</p>';
    return;
  }

  fetch(`/cocktail/${cocktailId}/ingredients/`, {
    headers: { "X-Requested-With": "XMLHttpRequest" },
  })
    .then((res) => res.json())
    .then((data) => {
      list.innerHTML = "";

      data.all_ingredients.forEach((ing) => {
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
});

/* 2. Add / Remove ingredient from cocktail */
document.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-customise-action]");
  if (!btn) return;

  const action = btn.dataset.customiseAction;
  const ingredientId = btn.dataset.ingredientId;
  const cocktailId = btn.dataset.cocktailId;

  fetch(`/cocktail/${cocktailId}/${action}/${ingredientId}/`, {
    method: "POST",
    headers: {
      "X-Requested-With": "XMLHttpRequest",
      "X-CSRFToken": getCSRFToken(),
      "Content-Type": "application/json"
    },
    body: JSON.stringify({})
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.error) {
        showMessage(data.message, "error");
        return;
      }

      const select = document.getElementById("customiseCocktailSelect");

      if (select) {
        // Trigger a REAL change event → refreshes ingredient list immediately
        select.dispatchEvent(new Event("change", { bubbles: true }));
      }
    });
});








/* ============================================================
   AUTO-CLEAR INITIAL MESSAGES
   ============================================================ */

setTimeout(() => {
  document.querySelectorAll(".message").forEach((msg) => msg.remove());
}, 3000);
