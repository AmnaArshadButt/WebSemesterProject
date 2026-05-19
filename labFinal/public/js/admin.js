document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.delete-form').forEach((form) => {
    form.addEventListener('submit', (event) => {
      const confirmed = window.confirm('Delete this product? This action cannot be undone.');
      if (!confirmed) {
        event.preventDefault();
      }
    });
  });
});