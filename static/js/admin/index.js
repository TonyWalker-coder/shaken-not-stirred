// ===============================
// COCKTAIL TILE LOADING SPINNER
// Page complete – Tony, 28/08/2026
// ===============================
// When the user clicks the Cocktails tile, hide the text and show the spinner.
// Gives a visual cue that navigation is happening.
document.getElementById("cocktailTile").addEventListener("click", function () {
  this.querySelector(".tile-text").style.display = "none";
  this.querySelector(".spinner").style.display = "inline";
});


// ===============================
// ADMIN LOGIN MODAL — OPEN
// ===============================
// Reveals the admin login modal by removing the 'hidden' class.
function openAdminLoginModal() {
  document.getElementById("adminLoginModal").classList.remove("hidden");
}

// Attach open behaviour to the Admin tile button.
document.getElementById("adminLoginBtn")
  .addEventListener("click", openAdminLoginModal);


// ===============================
// ADMIN LOGIN MODAL — CLOSE
// ===============================
// Hides the admin login modal by adding the 'hidden' class.
function closeAdminLoginModal() {
  document.getElementById("adminLoginModal").classList.add("hidden");
}

// Attach close behaviour to the X button inside the modal.
document.getElementById("adminLoginClose")
  .addEventListener("click", closeAdminLoginModal);


// ===============================
// CLICK OUTSIDE TO CLOSE MODAL
// ===============================
// If the user clicks anywhere outside the modal-content area,
// close the modal. Clicking inside the modal-content should NOT close it.
document
  .getElementById("adminLoginModal")
  .addEventListener("click", function (e) {
    const content = document.querySelector("#adminLoginModal .modal-content");

    // If the click target is NOT inside the modal-content, close the modal.
    if (!content.contains(e.target)) {
      closeAdminLoginModal();
    }
  });


// ===============================
// PREVENT MODAL FROM CLOSING WHEN CLICKING INSIDE CONTENT
// ===============================
// Stops click events inside the modal-content from bubbling up
// to the modal backdrop listener above.
document
  .querySelector("#adminLoginModal .modal-content")
  .addEventListener("click", function (e) {
    e.stopPropagation();
  });
