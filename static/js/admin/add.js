import {
  modalMessage,
  getCSRFToken
} from "./admin-core.js";

/* ============================================================
   ADD COCKTAIL — NAME VALIDATION
   ============================================================ */

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
   ADD COCKTAIL — SUBMIT HANDLER (FIXED)
   ============================================================ */

document.getElementById("addCocktailForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  e.stopPropagation();
  if (!nameIsValid) return;

  const form = e.target;

  /* ---------------------------
     PREVENT DOUBLE SUBMISSION
     --------------------------- */
  if (form.dataset.locked === "1") return;
  form.dataset.locked = "1";

  const formData = new FormData(form);

  /* ---------------------------
     MANUAL WORKING MESSAGE (KEEPING THIS)
     --------------------------- */
  const msgBox = document.querySelector("#addCocktailModal .modal-message.success");
  msgBox.textContent = "Working...";
  msgBox.classList.remove("hidden");
  msgBox.classList.add("show");

  const modalContent = document.querySelector("#addCocktailModal .modal-content");
  if (modalContent) modalContent.scrollTop = 0;

  /* ---------------------------
     POST COCKTAIL
     --------------------------- */
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
    form.dataset.locked = ""; // unlock
    return;
  }

  /* ---------------------------
     REFRESH INGREDIENT CHECKBOX LIST
     --------------------------- */
  const ingRes = await fetch("/refresh-all/", {
    headers: { "X-Requested-With": "XMLHttpRequest" }
  });

  const ingData = await ingRes.json();
  refreshIngredientCheckboxList(ingData.ingredients);

  /* ---------------------------
     RESET FIELDS
     --------------------------- */
  const historyField = document.getElementById("newCocktailHistory");
  const recipeField = document.getElementById("newCocktailRecipe");

  if (historyField) historyField.value = "";
  if (recipeField) recipeField.value = "";

  document
    .querySelectorAll("#addCocktailModal input[type='checkbox']")
    .forEach((cb) => (cb.checked = false));

  form.reset();
  nameIsValid = false;
  createBtn.disabled = true;
  nameMsg.style.display = "none";

  /* ---------------------------
     UNIFIED SUCCESS MESSAGE
     --------------------------- */
  modalMessage("addCocktailModal", "success", "Cocktail added!");

  /* ---------------------------
     UNLOCK FORM
     --------------------------- */
  form.dataset.locked = "";
});

/* ============================================================
   INLINE INGREDIENT ADD
   ============================================================ */

const inlineInput = document.getElementById("newIngredientName");
const inlineBtn = document.getElementById("addIngredientInlineBtn");
const inlineMsg = document.getElementById("inlineIngredientMsg");

inlineBtn?.addEventListener("click", async () => {
  const name = inlineInput.value.trim().toLowerCase();
  if (!name) return;

  modalMessage("addCocktailModal", "success", "Working...");

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

  refreshIngredientCheckboxList(data.ingredients);
});

/* ============================================================
   REBUILD INGREDIENT CHECKBOX LIST
   ============================================================ */

function refreshIngredientCheckboxList(ingredients) {
  const list = document.querySelector("#addCocktailModal .modal-list");
  if (!list) return;

  list.innerHTML = "";

  // ⭐ SORT HERE
  ingredients.sort((a, b) => a.name.localeCompare(b.name));

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

