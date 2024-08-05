document.addEventListener("DOMContentLoaded", function () {
  let formToSubmit;

  // Seleccionar todos los botones de eliminar
  const deleteButtons = document.querySelectorAll(".delete-btn");

  if (deleteButtons.length > 0) {
    deleteButtons.forEach((button) => {
      button.addEventListener("click", function (event) {
        event.preventDefault();
        formToSubmit = this.closest(".delete-form");
        const modal = document.getElementById("confirmDeleteModal");
        if (modal) {
          $("#confirmDeleteModal").modal("show");
        }
      });
    });
  }

  // Seleccionar el botón de confirmación de eliminación
  const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
  if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener("click", function () {
      if (formToSubmit) {
        formToSubmit.submit();
      }
    });
  }
});
