// OPEN LOOKUP MODAL
//document.getElementById("lookupBtn").onclick = function (e) {
  //e.stopPropagation();
//
 // const frame = document.getElementById("lookupFrame");
//
//  frame.style.visibility = "hidden"; // Hide old content instantly
//  frame.src = frame.src; // Trigger reload
//
 // frame.onload = function () {
 //   frame.style.visibility = "visible"; // Show only when fresh
//  };
//
//  document.getElementById("lookupModal").style.display = "flex";
//};

// OPEN CHILD MODAL FROM MESSAGE
window.addEventListener("message", function (e) {

    console.log("MESSAGE RECEIVED:", e.data);

    if (e.data.type === "openChild") {

        document.getElementById("childTitle").textContent =
            "Cocktail ID: " + e.data.id;

        openModal("childModal");
    }
});

// CLOSE MODAL (X BUTTON)
//document.querySelectorAll(".close").forEach(btn => {
//    btn.onclick = () => {
//        btn.closest(".modal").style.display = "none";
//    };
//});
//
// CLICK OUTSIDE TO CLOSE LOOKUP MODAL
//document.addEventListener("click", function (e) {
 // const lookupModal = document.getElementById("lookupModal");
//
//  if (
//    lookupModal.style.display === "flex" &&
//    !e.target.closest("#lookupModal .modal-content")
//  ) {
//    lookupModal.style.display = "none";
//  }
//});
//
//// CLICK OUTSIDE TO CLOSE CHILD MODAL
//document.addEventListener("click", function (e) {
//  const childModal = document.getElementById("childModal");
//
 // if (
 //   childModal.style.display === "flex" &&
//    !e.target.closest("#childModal .modal-content")
//  ) {
    childModal.style.display = "none";
//  }
//});
//
//// PREVENT INSIDE CLICKS FROM CLOSING EITHER MODAL
//document.querySelectorAll(".modal-content").forEach((box) => {
//  box.addEventListener("click", function (e) {
//    e.stopPropagation();
 // });
//});
