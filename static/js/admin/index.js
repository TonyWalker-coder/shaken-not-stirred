document.getElementById("cocktailTile").addEventListener("click", function () {
  this.querySelector(".tile-text").style.display = "none";
  this.querySelector(".spinner").style.display = "inline";
});

function openAdminLoginModal() {
  document.getElementById("adminLoginModal").classList.remove("hidden");
}
document.getElementById("adminLoginBtn")
  .addEventListener("click", openAdminLoginModal);

function closeAdminLoginModal() {
  document.getElementById("adminLoginModal").classList.add("hidden");
}
document.getElementById("adminLoginClose")
  .addEventListener("click", closeAdminLoginModal);

// Close when clicking outside modal-content
document
  .getElementById("adminLoginModal")
  .addEventListener("click", function (e) {
    const content = document.querySelector("#adminLoginModal .modal-content");

    // If the click is NOT inside the modal-content, close it
    if (!content.contains(e.target)) {
      closeAdminLoginModal();
    }
  });

document
  .querySelector("#adminLoginModal .modal-content")
  .addEventListener("click", function (e) {
    e.stopPropagation();
  });
