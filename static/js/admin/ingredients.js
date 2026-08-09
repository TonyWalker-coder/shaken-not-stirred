import {
  modalMessage,
  closeModal,
  getCSRFToken,
  refreshIngredientList
} from "./admin-core.js";

/* ============================================================
   INGREDIENTS — ADD NEW INGREDIENT
   ============================================================ */
/*
   Handles the form inside #ingredientsModal.
   Sends the ingredient name to the server, receives the updated
   ingredient list, refreshes the UI, and shows a success message.
*/
document.addEventListener("submit", async (e) => {
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

/* ============================================================
   INGREDIENTS — EDIT EXISTING INGREDIENT
   ============================================================ */
/*
   Handles the edit form inside #editIngredientModal.
   Updates the ingredient name, refreshes the list, closes the modal,
   and shows a success message.
*/
document.getElementById("editIngredientForm")?.addEventListener("submit", async (e) => {
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
/*
   Handles delete buttons inside the ingredient list.
   Sends a POST request to delete the ingredient, refreshes the list,
   and shows a success message.
*/
document.addEventListener("click", async (e) => {
  const btn = e.target.closest("[data-delete-ingredient]");
  if (!btn) return;

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
