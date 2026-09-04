import {
  modalMessage,
  closeModal,
  openModal
} from "./admin-core.js";

/* ============================================================
   RECIPES — RENDER LIST INSIDE MAIN MODAL
   ============================================================ */
/*
   Fetches the full recipe list and renders it inside #recipesModal.
   Called after every DB operation (add/edit/delete).
*/

export async function refreshRecipesModal() {
  const res = await fetch("/recipes/list/json/", {
    headers: { "X-Requested-With": "XMLHttpRequest" }
  });

  const data = await res.json();
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
                    data-text="${c.recipe.replace(/"/g, "&quot;")}"
                    data-child="true">
              Edit
            </button>

            <button class="delete-btn"
                    data-open="deleteRecipeModal"
                    data-id="${c.recipe_id}"
                    data-child="true">
              Delete
            </button>
          `
              : `
            <img src="/static/cocktails/icons/missing.png" class="history-icon">

            <button class="add-btn"
                    data-open="addRecipeModal"
                    data-id="${c.id}"
                    data-child="true">
              Add
            </button>

            <button class="delete-btn"
                    data-open="noRecipeTrap"
                    data-child="true">
              Delete
            </button>
          `
          }
        </div>
      </div>
    `;
  });
}

/* ============================================================
   RECIPES — POPULATE CHILD MODALS
   ============================================================ */
/*
   These handlers populate the add/edit/delete modals with the
   correct action URLs and text values before opening them.
*/

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

/* ============================================================
   RECIPES — ADD / EDIT / DELETE (Unified Handler)
   ============================================================ */
/*
   Handles ALL recipe operations:
   - Add recipe text
   - Edit recipe text
   - Delete recipe entry

   Each form:
   - Lives inside a child modal (add/edit/delete)
   - Submits via AJAX
   - Closes the child modal
   - Reopens the main recipesModal
   - Shows a "Working..." message
   - Performs the DB operation
   - Refreshes the recipe list
   - Shows a success message
*/

["addRecipeForm", "editRecipeForm", "deleteRecipeForm"].forEach((id) => {
  const form = document.getElementById(id);
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const childModalId = form.closest(".modal").id;

    // 1. Close child modal
    closeModal(childModalId);

    // 2. Open parent recipes modal
    openModal("recipesModal");

    // 3. Unified loading message
    modalMessage("recipesModal", "success", "Working...");

    // 4. Perform DB operation
    const res = await fetch(form.action, {
      method: "POST",
      headers: { "X-Requested-With": "XMLHttpRequest" },
      body: formData,
    });

    const data = await res.json();

    if (data.error) {
      modalMessage("recipesModal", "error", data.message || "Error");
      return;
    }

    await refreshRecipesModal();

    // 6. Unified success message
    let msg = "Recipe updated!";
    if (id === "addRecipeForm") msg = "Recipe added!";
    if (id === "deleteRecipeForm") msg = "Recipe deleted!";

    modalMessage("recipesModal", "success", msg);
  });
});
