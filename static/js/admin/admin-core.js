/* ============================================================
   UNIVERSAL MODAL ENGINE (NO INLINE JS)
   ============================================================ */

export function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove("hidden");
}

export function closeModal(id) {
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

/* ============================================================
   DELEGATED MODAL OPEN/CLOSE — CLEAN VERSION
   ============================================================ */

document.addEventListener("click", (e) => {
  const openTarget = e.target.closest("[data-open]");
  const closeTarget = e.target.closest("[data-close]");

  /* ---------------------------
     OPEN MODAL
     --------------------------- */
  if (openTarget) {
    const id = openTarget.dataset.open;

    openModal(id);

    // Skip refresh for child modals
    if (openTarget.dataset.child) return;

    // Remove OLD ingredient modal logic (no hide/showIngredientList)
    // Remove OLD refreshAll logic

    // Show unified loading message
    modalMessage(id, "success", "Working...");
  }

  /* ---------------------------
     CLOSE MODAL
     --------------------------- */
  if (closeTarget) {
    const id = closeTarget.dataset.close;
    closeModal(id);
  }
});

/* ============================================================
   NEW MESSAGE SYSTEM
   ============================================================ */

function smoothScrollToTop(element) {
  const start = element.scrollTop;
  const duration = 200;
  const startTime = performance.now();

  function animate(time) {
    const progress = Math.min((time - startTime) / duration, 1);
    element.scrollTop = start * (1 - progress);

    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  }

  requestAnimationFrame(animate);
}

export function modalMessage(modalId, type, text) {
  const modal = document.getElementById(modalId);
  if (!modal) return;

  const successBox = modal.querySelector(".modal-message.success");
  const errorBox = modal.querySelector(".modal-message.error");

  successBox.classList.remove("show");
  errorBox.classList.remove("show");

  if (type === "success") {
    successBox.textContent = text;
    successBox.classList.add("show");
  } else {
    errorBox.textContent = text;
    errorBox.classList.add("show");
  }

  const modalContent = modal.querySelector(".modal-content");
  if (modalContent) smoothScrollToTop(modalContent);

  setTimeout(() => {
    successBox.classList.remove("show");
    errorBox.classList.remove("show");
  }, 3000);
}

/* ============================================================
   CSRF TOKEN
   ============================================================ */

export function getCSRFToken() {
  const token = document.querySelector("[name=csrfmiddlewaretoken]");
  return token ? token.value : "";
}

/* ============================================================
   UNIVERSAL — REFRESH ANY COCKTAIL DROPDOWN
   ============================================================ */

export async function refreshCocktailDropdown(selectEl) {
  if (!selectEl) return;

  const res = await fetch("/cocktails/list/simple/", {
    headers: { "X-Requested-With": "XMLHttpRequest" },
  });

  const data = await res.json();

  selectEl.innerHTML = '<option value="">-- choose cocktail --</option>';

  (data.cocktails || [])
    .sort((a, b) => a.name.localeCompare(b.name))
    .forEach((c) => {
      const opt = document.createElement("option");
      opt.value = c.id;
      opt.textContent = c.name;
      selectEl.appendChild(opt);
    });
}

/* ============================================================
   UNIVERSAL — REFRESH IMAGE LIST
   ============================================================ */

export async function refreshImageList() {
  const res = await fetch("/images/list/", {
    headers: { "X-Requested-With": "XMLHttpRequest" },
  });
  const data = await res.json();

  const container = document.getElementById("imageList");
  if (!container) return;

  container.innerHTML = "";

  if (!data.images || !data.images.length) {
    container.innerHTML = `<p class="empty-text">No images found.</p>`;
    return;
  }

  data.images.forEach((img) => {
    const item = document.createElement("div");
    item.className = "modal-item";

    item.innerHTML = `
      <img src="/static/cocktails/buttons/${img}?v=${Date.now()}" class="item-thumb" />
      <p class="assign-image-filename">${img}</p>
      <button class="add-btn" data-open="assignImageConfirmModal" data-image="${img}">
        Assign
      </button>
    `;

    container.appendChild(item);
  });
}

/* ============================================================
   UNIVERSAL — REFRESH INGREDIENT LIST
   ============================================================ */

export function refreshIngredientList(ingredients) {
  const list = document.querySelector(".modal-list");
  if (!list) return;

  list.innerHTML = "";

  ingredients
    .sort((a, b) => a.name.localeCompare(b.name))
    .forEach((ingredient) => {
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
