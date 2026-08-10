import {
  modalMessage,
  closeModal,
  openModal,
  getCSRFToken,
} from "./admin-core.js";
console.log("DELETE.JS LOADED");

document.addEventListener("click", (e) => {
  console.log("CLICK:", e.target);
});
/* ============================================================
   DELETE COCKTAIL — OPEN CONFIRM MODAL
   ============================================================ */
/*
   When the user clicks a delete button inside the deleteCocktailModal,
   this handler:
   - Injects the cocktail name into the confirmation text
   - Sets the correct form action URL
   - Opens the confirmDeleteCocktailModal
*/

document.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-open='confirmDeleteCocktailModal']");
  if (!btn) return;

  const cocktailId = btn.dataset.id;
  const cocktailName = btn.dataset.name;

  // Inject name into confirmation text
  const text = document.getElementById("confirmDeleteCocktailText");
  text.textContent = `Are you sure you want to delete "${cocktailName}"?`;

  // Set form action
  const form = document.getElementById("deleteCocktailForm");
  form.action = `/cocktail/delete/${cocktailId}/`;

  openModal("confirmDeleteCocktailModal");
});

/* ============================================================
   DELETE COCKTAIL — AJAX SUBMIT (Unified)
   ============================================================ */
/*
   Handles the actual delete operation:
   - Closes confirm modal
   - Opens main deleteCocktailModal
   - Shows unified "Working..." message
   - Sends POST delete request
   - Refreshes all cocktail lists (history, recipes, delete modal)
   - Shows unified success message
*/

/* ============================================================
   DELETE COCKTAIL — AJAX SUBMIT (Delegated)
   ============================================================ */
/*
   Delegated submit handler:
   - Works even if the form is rebuilt dynamically
   - Prevents silent failures when deleteCocktailForm is not present at page load
*/

document.addEventListener("submit", async (e) => {
  const form = e.target.closest("#deleteCocktailForm");
  if (!form) return;   // Ignore all other forms

  e.preventDefault();

  const url = form.action;

  closeModal("confirmDeleteCocktailModal");
  openModal("deleteCocktailModal");
  modalMessage("deleteCocktailModal", "success", "Working...");

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
    modalMessage("deleteCocktailModal", "error", data.message);
    return;
  }

  refreshCocktailList(data.cocktails);
  modalMessage("deleteCocktailModal", "success", "Cocktail deleted!");
});


/* ============================================================
   REFRESH COCKTAIL LISTS (History / Recipes / Delete Modal)
   ============================================================ */
/*
   Rebuilds all cocktail lists after a delete:
   - History modal list
   - Recipes modal list
   - DeleteCocktailModal list

   This ensures all modals stay in sync after a deletion.
*/

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
            <button class="add-btn" data-open="addHistoryModal" data-id="${c.id}" data-child="true">Add</button>
            <button class="delete-btn" data-open="noHistoryTrap" data-child="true">Delete</button>
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
            <button class="add-btn" data-open="addRecipeModal" data-id="${c.id}" data-child="true">Add</button>
            <button class="delete-btn" data-open="noRecipeTrap" data-child="true">Delete</button>
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
                    data-name="${c.name.replace(/"/g, "&quot;")}"
                    data-child="true">
              Delete
            </button>
          </div>
        </div>
      `;
    });
  }
}

/* ============================================================
   OPEN DELETE MODAL (Fetch Fresh List)
   ============================================================ */
/*
   When the user opens the deleteCocktailModal:
   - Fetch fresh cocktail list
   - Refresh modal list
   - Open modal
*/

document.addEventListener("click", async (e) => {
  const btn = e.target.closest("[data-open='deleteCocktailModal']");
  if (!btn) return;

  const res = await fetch("/cocktails/list/json/", {
    headers: { "X-Requested-With": "XMLHttpRequest" },
  });

  const data = await res.json();

  refreshCocktailList(data.cocktails);

  openModal("deleteCocktailModal");
});
