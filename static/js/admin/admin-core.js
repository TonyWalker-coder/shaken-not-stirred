import { refreshHistoryModal } from "./history.js";
import { refreshRecipesModal } from "./recipes.js";

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

document.addEventListener("click", async (e) => {
  const openTarget = e.target.closest("[data-open]");
  const closeTarget = e.target.closest("[data-close]");

  /* ---------------------------
     OPEN MODAL
     --------------------------- */
  if (openTarget) {
    const id = openTarget.dataset.open;

    if (openTarget.dataset.child === "true") {
      openModal(id);
      return;
    }

    if (id === "ingredientsModal") return;

    if (id === "imagesModal") {
      const select = document.getElementById("imageCocktailSelect");
      select.value = "";
      refreshCocktailDropdown(select);
    }

    if (id === "historyModal") {
      await refreshHistoryModal();   // now valid
    }

    if (id === "recipesModal") {
    await refreshRecipesModal();
    }

    openModal(id);

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

// ===============================
// Load a dashboard section via AJAX
// Inserts the returned HTML into #dashboard-content
// ===============================
export async function loadDashboardSection(url) {
  const res = await fetch(url, {
    headers: { "X-Requested-With": "XMLHttpRequest" } // tells Django it's an AJAX request
  });

  const html = await res.text();

  const container = document.getElementById("dashboard-content");
  if (container) {
    container.innerHTML = html; // replace dashboard content with server-rendered HTML
  }
}
window.loadDashboardSection = loadDashboardSection;


// ===============================
// Open the forum modal and load the forum list
// ===============================
export async function openForum() {
  const res = await fetch("/dashboard/forum/", {
    headers: { "X-Requested-With": "XMLHttpRequest" }
  });

  const html = await res.text();

  const container = document.getElementById("forumModalContent");
  container.innerHTML = html; // inject forum HTML into modal

  openModal("forumModal"); // show modal
}
window.openForum = openForum;


// ===============================
// Load a specific thread into the modal
// ===============================
export async function loadThread(threadId) {
  const res = await fetch(`/admin/forum/thread/${threadId}/`, {
    headers: { "X-Requested-With": "XMLHttpRequest" }
  });

  const html = await res.text();

  document.getElementById("forumModalContent").innerHTML = html; // replace modal content with thread view
}
window.loadThread = loadThread;


// ===============================
// Admin reply prompt (quick reply)
// ===============================
function adminReply(threadId) {
    const message = prompt("Enter your reply:");
    if (!message) return; // cancelled or empty

    fetch(`/admin/forum/reply/${threadId}/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCookie("csrftoken") // Django CSRF protection
        },
        body: JSON.stringify({ message })
    })
    .then(res => res.text())
    .then(html => {
        // refresh thread view with updated replies
        document.getElementById("forumModalContent").innerHTML = html;
    });
}
window.adminReply = adminReply;


// ===============================
// Delete an entire thread (with confirmation)
// ===============================
function deleteThread(threadId) {
    if (!confirm("Delete this thread and all replies?")) return;

    fetch(`/admin/forum/delete-thread/${threadId}/`, {
        method: "POST",
        headers: {
            "X-CSRFToken": getCookie("csrftoken")
        }
    })
    .then(() => {
        closeForumModal(); // hide modal
        location.reload(); // refresh admin page to update thread list
    });
}
window.deleteThread = deleteThread;


// ===============================
// Utility: Get a cookie value (used for CSRF)
// ===============================
function getCookie(name) {
    let cookieValue = null;

    if (document.cookie && document.cookie !== "") {
        const cookies = document.cookie.split(";");
        for (let cookie of cookies) {
            cookie = cookie.trim();
            if (cookie.startsWith(name + "=")) {
                cookieValue = cookie.substring(name.length + 1);
                break;
            }
        }
    }

    return cookieValue;
}
window.getCookie = getCookie;


// ===============================
// UI Toggles for reply/delete forms
// ===============================
function showReplyForm() {
    document.getElementById("replyForm").style.display = "block";
    document.getElementById("deleteConfirm").style.display = "none";

    // Scroll the actual scrollable modal container
    const modal = document.querySelector("#forumModal .modal-content");

    if (modal) {
        setTimeout(() => {
            modal.scrollTop = modal.scrollHeight;
        }, 50);
    }
}

window.showReplyForm = showReplyForm;

function showDeleteConfirm() {
    document.getElementById("deleteConfirm").style.display = "block";
    document.getElementById("replyForm").style.display = "none";

    // Scroll the actual scrollable modal container
    const modal = document.querySelector("#forumModal .modal-content");

    if (modal) {
        setTimeout(() => {
            modal.scrollTop = modal.scrollHeight;
        }, 50);
    }
}

window.showDeleteConfirm = showDeleteConfirm;


function hideDeleteConfirm() {
    document.getElementById("deleteConfirm").style.display = "none";
}
window.hideDeleteConfirm = hideDeleteConfirm;


// ===============================
// Submit a reply from the modal reply form
// ===============================
function submitReply(threadId) {
    const message = document.getElementById("replyMessage").value.trim();
    if (!message) return;

    fetch(`/admin/forum/reply/${threadId}/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCookie("csrftoken")
        },
        body: JSON.stringify({ message })
    })
    .then(res => res.text())
    .then(html => {
        // reload thread with new reply included
        document.getElementById("forumModalContent").innerHTML = html;
    });
}
window.submitReply = submitReply;


// ===============================
// Confirm delete inside modal
// ===============================
function confirmDelete(threadId) {
    fetch(`/admin/forum/delete-thread/${threadId}/`, {
        method: "POST",
        headers: {
            "X-CSRFToken": getCookie("csrftoken")
        }
    })
    .then(() => {
        closeForumModal();
        location.reload();
    });
}
window.confirmDelete = confirmDelete;


// ===============================
// Close the forum modal
// ===============================
function closeForumModal() {
    const modal = document.getElementById("forumModal");
    if (modal) {
        modal.style.display = "none";
    }
}
window.closeForumModal = closeForumModal;
