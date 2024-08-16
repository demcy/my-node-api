// public/script.js
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('auth-form');
    const messageDiv = document.getElementById('message');
  
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
  
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;
  
      try {
        const response = await fetch('/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });
  
        const result = await response.json();
        if (response.ok) {
          messageDiv.textContent = `Success: ${result.message}`;
        } else {
          messageDiv.textContent = `Error: ${result.message}`;
        }
      } catch (error) {
        messageDiv.textContent = `Error: ${error.message}`;
      }
    });
  });
  