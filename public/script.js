document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('auth-form');
  const messageDiv = document.getElementById('message');

  form.addEventListener('submit', async (event) => {
      event.preventDefault(); // Prevent the default form submission

      const formData = new FormData(form);
      const data = {};
      formData.forEach((value, key) => {
          data[key] = value;
      });

      try {
          const response = await fetch('/', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify(data)
          });

          const result = await response.json();
          if (response.ok) {
              messageDiv.textContent = result.message;
          } else {
              messageDiv.textContent = `Error: ${result.message}`;
          }
      } catch (error) {
          messageDiv.textContent = `Error: ${error.message}`;
      }
  });
});
