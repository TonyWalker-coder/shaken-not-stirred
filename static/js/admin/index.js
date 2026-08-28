// ===============================
// COCKTAIL TILE LOADING SPINNER
// Page complete – Tony, 28/08/2026
// ===============================
document.getElementById("cocktailTile").addEventListener("click", function () {
  this.querySelector(".tile-text").style.display = "none";
  this.querySelector(".spinner").style.display = "inline";
});


// ===============================
// ADMIN LOGIN MODAL — OPEN
// ===============================
function openAdminLoginModal() {
  const modal = document.getElementById("adminLoginModal");
  modal.classList.remove("hidden");

  // Move keyboard focus into the modal (accessibility)
  const firstFocusable = modal.querySelector("input, button, [tabindex]:not([tabindex='-1'])");
  if (firstFocusable) firstFocusable.focus();

  trapFocus(modal);
}

document.getElementById("adminLoginBtn")
  .addEventListener("click", openAdminLoginModal);


// ===============================
// ADMIN LOGIN MODAL — CLOSE
// ===============================
function closeAdminLoginModal() {
  const modal = document.getElementById("adminLoginModal");
  modal.classList.add("hidden");

  // Return focus to the Admin tile (accessibility)
  document.getElementById("adminLoginBtn").focus();
}

document.getElementById("adminLoginClose")
  .addEventListener("click", closeAdminLoginModal);


// ===============================
// CLICK OUTSIDE TO CLOSE MODAL
// ===============================
document.getElementById("adminLoginModal")
  .addEventListener("click", function (e) {
    const content = document.querySelector("#adminLoginModal .modal-content");

    if (!content.contains(e.target)) {
      closeAdminLoginModal();
    }
  });

document.querySelector("#adminLoginModal .modal-content")
  .addEventListener("click", function (e) {
    e.stopPropagation();
  });


// ===============================
// ESC KEY CLOSE BEHAVIOUR
// ===============================
// Allows users to press ESC to close the modal.
document.addEventListener("keydown", function (e) {
  const modal = document.getElementById("adminLoginModal");
  if (!modal.classList.contains("hidden") && e.key === "Escape") {
    closeAdminLoginModal();
  }
});


// ===============================
// FOCUS TRAP LOGIC (ACCESSIBILITY)
// ===============================
// Prevents keyboard users from tabbing out of the modal.
function trapFocus(modal) {
  const focusableSelectors = [
    "button",
    "input",
    "select",
    "textarea",
    "a[href]",
    "[tabindex]:not([tabindex='-1'])"
  ];

  const focusableElements = modal.querySelectorAll(focusableSelectors.join(","));
  const first = focusableElements[0];
  const last = focusableElements[focusableElements.length - 1];

  modal.addEventListener("keydown", function (e) {
    if (e.key !== "Tab") return;

    // SHIFT + TAB (reverse)
    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    }
    // TAB (forward)
    else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });
}
