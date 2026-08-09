import {
  modalMessage,
  closeModal,
  openModal,
  getCSRFToken,
  refreshImageList
} from "./admin-core.js";

/* ============================================================
   IMAGE UPLOAD — DELEGATED SUBMIT HANDLER
   ============================================================ */
/*
   Handles image uploads inside imagesModal:
   - Prevents default form submission
   - Sends FormData via AJAX
   - Shows success/error messages
   - Refreshes the live image list
*/

document.addEventListener("submit", async (e) => {
  const form = e.target;
  if (!form.matches("#imageUploadForm")) return;

  e.preventDefault();

  const formData = new FormData(form);

  const res = await fetch(form.action, {
    method: "POST",
    headers: { "X-Requested-With": "XMLHttpRequest" },
    body: formData
  });

  const data = await res.json();

  if (data.error) {
    modalMessage("imagesModal", "error", data.error);
    return;
  }

  modalMessage("imagesModal", "success", "Image uploaded!");
  form.reset();

  await refreshImageList();   // unified helper from admin-core.js
});

/* ============================================================
   ASSIGN IMAGE — OPEN CONFIRM MODAL
   ============================================================ */
/*
   When user clicks "Assign" on an image:
   - Ensures a cocktail is selected
   - Fetches live cocktail data
   - Updates confirm modal previews
   - Sets correct form action
   - Opens confirm modal
*/

document.addEventListener("click", async (e) => {
  const btn = e.target.closest("[data-open='assignImageConfirmModal']");
  if (!btn) return;

  const filename = btn.dataset.image;
  if (!filename) {
    modalMessage("imagesModal", "error", "Image filename missing.");
    return;
  }

  const cocktailId = Number(document.getElementById("imageCocktailSelect").value);
  if (!cocktailId) {
    modalMessage("imagesModal", "error", "Please select a cocktail first.");
    return;
  }

  // Fetch live cocktail data
  const resCocktail = await fetch(`/cocktail/json/${cocktailId}/`, {
    headers: { "X-Requested-With": "XMLHttpRequest" }
  });
  const cocktail = await resCocktail.json();

  // Current cocktail image preview
  const currentImg =
    (cocktail.image_url
      ? `/static/${cocktail.image_url}`
      : "/static/cocktails/buttons/no-image.png") + `?v=${Date.now()}`;

  document.getElementById("assignCocktailCurrentImage").src = currentImg;
  document.getElementById("assignImageText").textContent =
    `Assign this image to ${cocktail.name}?`;

  // New image preview
  document.getElementById("assignNewImageThumb").src =
    `/static/cocktails/buttons/${filename}?v=${Date.now()}`;
  document.getElementById("assignImageFilename").textContent = filename;

  // Set form action
  const form = document.getElementById("assignImageForm");
  form.action = `/images/assign/${cocktailId}/${filename}/`;

  openModal("assignImageConfirmModal");
});

/* ============================================================
   ASSIGN IMAGE — AJAX SUBMIT
   ============================================================ */
/*
   Handles assignment confirmation:
   - Prevents default form submission
   - Sends POST request
   - Shows success/error messages
   - Refreshes image list
*/

document.addEventListener("submit", async (e) => {
  const form = e.target;
  if (!form.matches("#assignImageForm")) return;

  e.preventDefault();

  const res = await fetch(form.action, {
    method: "POST",
    headers: {
      "X-Requested-With": "XMLHttpRequest",
      "X-CSRFToken": getCSRFToken(),
      "Content-Type": "application/json"
    },
    body: JSON.stringify({})
  });

  const data = await res.json();

  if (data.error) {
    modalMessage("assignImageConfirmModal", "error", data.message);
    return;
  }

  closeModal("assignImageConfirmModal");
  modalMessage("imagesModal", "success", "Image assigned!");

  await refreshImageList();   // unified refresh
});
