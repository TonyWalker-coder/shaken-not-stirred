/* ============================================================
   GENERIC MODAL CONTROLS
   ============================================================ */

    /* Open any modal by ID */
    function openModal(id) {
        document.getElementById(id).classList.remove("hidden");
    }

    /* Close any modal by ID */
    function closeModal(id) {
        document.getElementById(id).classList.add("hidden");
    }

    /* Close when clicking backdrop */
    document.addEventListener("click", function (e) {
        const openModals = document.querySelectorAll(".modal:not(.hidden)");

        openModals.forEach(modal => {
            if (e.target === modal) {
                modal.classList.add("hidden");
            }
        });
    });

    /* Prevent inside clicks from closing */
    document.querySelectorAll('.modal-content').forEach(box => {
        box.addEventListener('click', e => e.stopPropagation());
    });


    /* ============================================================
       INGREDIENTS
       ============================================================ */

    function openIngredientsModal() {
        removeScopedMessages("ingredient");
        openModal("ingredientsModal");
    }

    function closeIngredientsModal() {
        closeModal("ingredientsModal");
    }

    function openEditIngredientModal(id, name) {
        document.getElementById("editIngredientName").value = name;
        document.getElementById("editIngredientForm").action = `/ingredient/edit/${id}/`;
        openModal("editIngredientModal");
    }

    function closeEditIngredientModal() {
        closeModal("editIngredientModal");
    }


    /* ============================================================
       RECIPES
       ============================================================ */

    function openRecipesModal() {
        openModal("recipesModal");
    }

    function closeRecipesModal() {
        closeModal("recipesModal");
    }

    function openEditRecipeModal(id, text) {
        document.getElementById("editRecipeText").value = text;
        document.getElementById("editRecipeForm").action = `/recipe/edit/${id}/`;
        openModal("editRecipeModal");
    }

    function closeEditRecipeModal() {
        closeModal("editRecipeModal");
    }

    function openAddRecipeModal(id) {
        document.getElementById("addRecipeForm").action = `/recipe/add/${id}/`;
        openModal("addRecipeModal");
    }

    function closeAddRecipeModal() {
        closeModal("addRecipeModal");
    }

    function openDeleteRecipeModal(id) {
        document.getElementById("deleteRecipeForm").action = `/recipe/delete/${id}/`;
        openModal("deleteRecipeModal");
    }

    function closeDeleteRecipeModal() {
        closeModal("deleteRecipeModal");
    }


    /* ============================================================
       HISTORY
       ============================================================ */

    function openHistoryModal() {
        openModal("historyModal");
    }

    function closeHistoryModal() {
        closeModal("historyModal");
    }

    function openEditHistoryModal(id, text) {
        document.getElementById("editHistoryText").value = text;
        document.getElementById("editHistoryForm").action = `/history/edit/${id}/`;
        openModal("editHistoryModal");
    }

    function closeEditHistoryModal() {
        closeModal("editHistoryModal");
    }

    function openAddHistoryModal(id) {
        document.getElementById("addHistoryForm").action = `/history/add/${id}/`;
        openModal("addHistoryModal");
    }

    function closeAddHistoryModal() {
        closeModal("addHistoryModal");
    }

    function openDeleteHistoryModal(id) {
        document.getElementById("deleteHistoryForm").action = `/history/delete/${id}/`;
        openModal("deleteHistoryModal");
    }

    function closeDeleteHistoryModal() {
        closeModal("deleteHistoryModal");
    }


    /* ============================================================
       MESSAGE SYSTEM (Shared)
       ============================================================ */

    /* Remove messages only for a specific feature */
    function removeScopedMessages(keyword) {
        document.querySelectorAll('.message').forEach(msg => {
            if (msg.textContent.toLowerCase().includes(keyword)) {
                msg.remove();
            }
        });
    }

    /* Create a message (used by ingredients/history/recipes) */
    function createMessage(text) {
        const container = document.querySelector('.messages') || (() => {
            const newContainer = document.createElement('div');
            newContainer.className = 'messages';
            document.body.prepend(newContainer);
            return newContainer;
        })();

        const box = document.createElement('p');
        box.className = 'message';
        box.textContent = text;

        container.appendChild(box);

        setTimeout(() => box.remove(), 3000);
    }

    /* History trap */
    function noHistoryTrap() {
        closeHistoryModal();
        createMessage("This cocktail has no history yet.");
    }

    /* Recipe trap */
    function noRecipeTrap() {
        closeRecipesModal();
        createMessage("This cocktail has no recipe yet.");
    }

    /* Ingredient trap */
    function ingredientMessage(text) {
        closeIngredientsModal();
        createMessage(text);
    }


    /* ============================================================
       Auto-remove Django messages
       ============================================================ */

    setTimeout(() => {
        document.querySelectorAll('.message').forEach(msg => msg.remove());
    }, 3000);