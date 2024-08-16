document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('authForm'); // Updated form ID
    const messageDiv = document.getElementById('message');
    const userCountDiv = document.getElementById('userCount');

    // Handle form submission
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

    // Fetch the number of authenticated users from the server
    async function fetchAuthenticatedUsers() {
        try {
            const response = await fetch('/api/auth/authenticated-users');
            const data = await response.json();
            userCountDiv.textContent = `Currently authenticated users: ${data.count}`;
        } catch (error) {
            console.error('Error fetching authenticated users:', error);
            userCountDiv.textContent = 'Error loading user count';
        }
    }

    // Fetch authenticated users count on page load
    fetchAuthenticatedUsers();
});
