import {
  modalMessage,
  closeModal,
  openModal,
  getCSRFToken
} from "./admin-core.js";

/* ============================================================
   ADD COCKTAIL — NAME VALIDATION
   ============================================================ */
/*
   Live validation for the cocktail name field.
   Prevents duplicate names and disables the Create button
   until the name is valid.
*/

const cocktailNameInput = document.getElementById("newCocktailName");
const nameMsg = document.getElementById("nameValidationMsg");
const createBtn = document.getElementById("createCocktailBtn");

let nameIsValid = false;

cocktailNameInput?.addEventListener("input", async () => {
  const name = cocktailNameInput.value.trim();

  if (!name) {
    nameMsg.style.display = "none";
    createBtn.disabled = true;
    nameIsValid = false;
    return;
  }

  const res = await fetch(`/cocktail/check-name/?name=${encodeURIComponent(name)}`, {
    headers: { "X-Requested-With": "XMLHttpRequest" }
  });

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

/* ============================================================
   ADD COCKTAIL — SUBMIT HANDLER
   ============================================================ */
/*
   Handles the main Add Cocktail form:
   - Keeps modal open
   - Shows a manual "Working..." message
   - Sends POST request
   - Refreshes ingredient checkbox list
   - Clears fields
   - Shows unified success message
*/

document.getElementById("addCocktailForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!nameIsValid) return;

  const form = e.target;
  const formData = new FormData(form);

  // Keep modal open
  openModal("addCocktailModal");

  // Manual "Working..." message (before unified system takes over)
  const msgBox = document.querySelector("#addCocktailModal .modal-message.success");
  msgBox.textContent = "Working...";
  msgBox.classList.remove("hidden");
  msgBox.classList.add("show");

  // Scroll modal to top
  const modalContent = document.querySelector("#addCocktailModal .modal-content");
  if (modalContent) modalContent.scrollTop = 0;

  // POST cocktail
  const res = await fetch(form.action, {
    method: "POST",
    headers: { "X-Requested-With": "XMLHttpRequest" },
    body: formData
  });

  const data = await res.json();

  if (data.error) {
    const errBox = document.querySelector("#addCocktailModal .modal-message.error");
    errBox.textContent = data.message;
    errBox.classList.remove("hidden");
    errBox.classList.add("show");
    return;
  }

  // Refresh-all endpoint (returns updated ingredient list)
  const ingRes = await fetch("/refresh-all/", {
    headers: { "X-Requested-With": "XMLHttpRequest" }
  });

  const ingData = await ingRes.json();

  // Rebuild ingredient checkbox list
  refreshIngredientCheckboxList(ingData.ingredients);

  // Clear history + recipe fields
  const historyField = document.getElementById("newCocktailHistory");
  const recipeField = document.getElementById("newCocktailRecipe");

  if (historyField) historyField.value = "";
  if (recipeField) recipeField.value = "";

  // Clear ingredient checkboxes
  document
    .querySelectorAll("#addCocktailModal input[type='checkbox']")
    .forEach((cb) => (cb.checked = false));

  // Reset form fields
  form.reset();
  nameIsValid = false;
  createBtn.disabled = true;
  nameMsg.style.display = "none";

  // Unified success message
  modalMessage("addCocktailModal", "success", "Cocktail added!");
});

/* ============================================================
   INLINE INGREDIENT ADD (INSIDE ADD COCKTAIL MODAL)
   ============================================================ */
/*
   Allows adding a new ingredient directly inside the Add Cocktail modal.
   - Shows unified "Working..." message
   - Sends POST request
   - Refreshes ingredient checkbox list
*/

const inlineInput = document.getElementById("newIngredientName");
const inlineBtn = document.getElementById("addIngredientInlineBtn");
const inlineMsg = document.getElementById("inlineIngredientMsg");

inlineBtn?.addEventListener("click", async () => {
  const name = inlineInput.value.trim().toLowerCase();
  if (!name) return;

  // Unified "Working..." message
  modalMessage("addCocktailModal", "success", "Working...");

  // Scroll modal to top
  const modalContent = document.querySelector("#addCocktailModal .modal-content");
  if (modalContent) modalContent.scrollTop = 0;

  const formData = new FormData();
  formData.append("name", name);

  const res = await fetch("/ingredient/add/", {
    method: "POST",
    headers: {
      "X-Requested-With": "XMLHttpRequest",
      "X-CSRFToken": getCSRFToken()
    },
    body: formData
  });

  const data = await res.json();

  if (data.error) {
    inlineMsg.textContent = data.message;
    inlineMsg.style.display = "block";
    return;
  }

  inlineMsg.style.display = "none";
  inlineInput.value = "";

  // Refresh ingredient checkbox list
  refreshIngredientCheckboxList(data.ingredients);
});

/* ============================================================
   REBUILD INGREDIENT CHECKBOX LIST
   ============================================================ */
/*
   Rebuilds the ingredient checkbox list inside the Add Cocktail modal.
   Called after:
   - refresh-all
   - inline ingredient add
*/

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
