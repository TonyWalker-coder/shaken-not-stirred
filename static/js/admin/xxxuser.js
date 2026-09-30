/* global openModal */
// OPEN CHILD MODAL FROM MESSAGE
window.addEventListener("message", function (e) {

    console.log("MESSAGE RECEIVED:", e.data);

    if (e.data.type === "openChild") {

        document.getElementById("childTitle").textContent =
            "Cocktail ID: " + e.data.id;

        openModal("childModal");
    }
});