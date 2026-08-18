// Auto-expand textareas
document.addEventListener("input", function (e) {
    if (e.target.tagName.toLowerCase() === "textarea") {
        e.target.style.height = "auto";
        e.target.style.height = (e.target.scrollHeight) + "px";
    }
});

// Fade-in animation
function fadeIn(element) {
    element.style.opacity = 0;
    element.style.transition = "opacity 0.4s ease-in-out";
    requestAnimationFrame(() => {
        element.style.opacity = 1;
    });
}

document.addEventListener("DOMContentLoaded", () => {
    const replyForm = document.querySelector("#reply-form");

    // Only run on thread_detail.html
    if (!replyForm) return;

    replyForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        // Client-side validation
        const name = replyForm.querySelector("input[name='author_name']").value.trim();
        const msg = replyForm.querySelector("textarea[name='message']").value.trim();

        if (!name || !msg) {
            alert("Please fill in both fields.");
            return;
        }

        const formData = new FormData(replyForm);

        const response = await fetch(window.location.href, {
            method: "POST",
            body: formData,
            headers: {
                "X-Requested-With": "XMLHttpRequest"
            }
        });

        const data = await response.json();

        if (data.success) {
            const replyList = document.querySelector(".reply-list");

            const newReply = document.createElement("div");
            newReply.classList.add("reply-card");
            newReply.innerHTML = `
                <p class="reply-author">${data.author_name}</p>
                <p>${data.message}</p>
                <p class="date">${data.created_at}</p>
            `;

            replyList.appendChild(newReply);
            fadeIn(newReply);

            replyForm.reset();
        }
    });
});
