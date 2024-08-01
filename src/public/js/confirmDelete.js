document.addEventListener("DOMContentLoaded", function () {
  let formToSubmit;

  document.querySelectorAll(".delete-btn").forEach((button) => {
    button.addEventListener("click", function (event) {
      event.preventDefault();
      formToSubmit = this.closest(".delete-form");
      $("#confirmDeleteModal").modal("show");
    });
  });

  document
    .getElementById("confirmDeleteBtn")
    .addEventListener("click", function () {
      formToSubmit.submit();
    });
});
