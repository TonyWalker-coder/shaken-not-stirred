import {
  modalMessage,
  closeModal,
  openModal,
  getCSRFToken,
} from "./admin-core.js";

/* ============================================================
   HISTORY — ADD / EDIT / DELETE (Unified Handler)
   ============================================================ */
/*
   Handles ALL history operations:
   - Add history text
   - Edit history text
   - Delete history entry

   Each form:
   - Lives inside a child modal (add/edit/delete)
   - Submits via AJAX
   - Closes the child modal
   - Reopens the main historyModal
   - Shows a "Working..." message
   - Performs the DB operation
   - Refreshes the history list
   - Shows a success message
*/

["addHistoryForm", "editHistoryForm", "deleteHistoryForm"].forEach((id) => {
  const form = document.getElementById(id);
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const childModalId = form.closest(".modal").id;

    // Close the child modal (edit/add/delete)
    closeModal(childModalId);

    // Open the parent history modal
    openModal("historyModal");

    // Unified loading message
    modalMessage("historyModal", "success", "Working...");

    // Perform DB operation
    const res = await fetch(form.action, {
      method: "POST",
      headers: { "X-Requested-With": "XMLHttpRequest" },
      body: formData,
    });

    const data = await res.json();

    if (data.error) {
      modalMessage("historyModal", "error", data.message);
      return;
    }

    // Refresh list after DB operation
    const listRes = await fetch("/history/list/json/", {
      headers: { "X-Requested-With": "XMLHttpRequest" },
    });

    const fullList = await listRes.json();

    refreshHistoryList(fullList.cocktails);

    // Unified success message
    if (data.message && data.message.trim().length > 0) {
      modalMessage("historyModal", "success", data.message);
    }
  });
});

/* ============================================================
   HISTORY — RENDER LIST
   ============================================================ */
/*
   Renders the full history list inside #historyModal.
   Called after every DB operation (add/edit/delete).
*/

export function refreshHistoryList(historyData) {
  const container = document.querySelector("#historyModal .history-list");
  if (!container) return;

  if (!Array.isArray(historyData)) {
    console.error("Invalid history data:", historyData);
    container.innerHTML = "<p class='empty-text'>No history found.</p>";
    return;
  }

  historyData.sort((a, b) => a.name.localeCompare(b.name));

  container.innerHTML = "";

  historyData.forEach((c) => {
    const hasHistory = c.history && c.history.trim().length > 0;

    container.innerHTML += `
      <div class="history-item">
        <span class="history-name">${c.name}</span>

        <div class="history-actions">
          ${
            hasHistory
              ? `
            <img src="/static/cocktails/icons/history-ok.png" class="history-icon">

            <button class="edit-btn"
                    data-open="editHistoryModal"
                    data-id="${c.history_id}"
                    data-text="${c.history.replace(/"/g, "&quot;")}"
                    data-child="true">
              Edit
            </button>

            <button class="delete-btn"
                    data-open="deleteHistoryModal"
                    data-id="${c.history_id}"
                    data-child="true">
              Delete
            </button>
          `
              : `
            <img src="/static/cocktails/icons/missing.png" class="history-icon">

            <button class="add-btn"
                    data-open="addHistoryModal"
                    data-id="${c.id}"
                    data-child="true">
              Add
            </button>

            <button class="delete-btn"
                    data-open="noHistoryTrap"
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
export async function refreshHistoryModal() {
  const res = await fetch("/history/list/json/", {
    headers: { "X-Requested-With": "XMLHttpRequest" },
  });

  const data = await res.json();

  refreshHistoryList(data.cocktails);
}

/* ============================================================
   HISTORY — POPULATE CHILD MODALS
   ============================================================ */
/*
   These handlers populate the child modals with the correct
   action URLs and text values before opening them.
*/

/* Populate edit history modal */
document.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-open='editHistoryModal']");
  if (!btn) return;

  document.getElementById("editHistoryForm").action =
    `/history/edit/${btn.dataset.id}/`;

  document.getElementById("editHistoryText").value = btn.dataset.text;
});

/* Populate add history modal */
document.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-open='addHistoryModal']");
  if (!btn) return;

  document.getElementById("addHistoryForm").action =
    `/history/add/${btn.dataset.id}/`;
});

/* Populate delete history modal */
document.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-open='deleteHistoryModal']");
  if (!btn) return;

  document.getElementById("deleteHistoryForm").action =
    `/history/delete/${btn.dataset.id}/`;
});
