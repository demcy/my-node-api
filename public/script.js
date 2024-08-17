document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('authForm');
    const messageDiv = document.getElementById('message');
    const userCountDiv = document.getElementById('userCount');
    const currentPeopleDiv = document.getElementById('currentPeople');
    const recentUsersDiv = document.getElementById('recentUsers');

    // Initialize Socket.IO client
    const socket = io(); // Connect to the Socket.IO server

    // Handle form submission
    form.addEventListener('submit', async (event) => {
        event.preventDefault(); // Prevent the default form submission

        const formData = new FormData(form);
        const data = {};
        formData.forEach((value, key) => {
            data[key] = value;
        });
        console.log(data);
        try {
            let response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: data.username,
                    password: data.password
                })
            });

            const result = await response.json();
            console.log(result);

            switch (response.status) {
                case 200:
                    // Successful login
                    messageDiv.textContent = result.message;
                    console.log('Token:', result.token);
                    // Emit the authenticate event with the token
                    socket.emit('authenticate', result.token, (socketResponse) => {
                        console.log(socketResponse);
                        if (socketResponse.success) {
                            console.log('Socket authentication successful');
                            // Optionally, fetch the authenticated users list
                        } else {
                            console.error('Socket authentication failed:', socketResponse.error);
                        }
                    });
                    break;

                case 401:
                    // Invalid credentials
                    messageDiv.textContent = 'Invalid credentials. Please try again.';
                    break;

                case 400:
                    // User not found, attempt registration
                    response = await fetch('/api/auth/register', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            username: data.username,
                            password: data.password
                        })
                    });

                    const registerResult = await response.json();

                    if (response.ok) {
                        messageDiv.textContent = 'Registration successful! You can now log in.';
                    } else {
                        messageDiv.textContent = `Error: ${registerResult.message}`;
                    }
                    break;

                default:
                    // Handle other errors
                    messageDiv.textContent = `Error: ${result.message || 'Something went wrong.'}`;
                    break;
            }
        } catch (error) {
            messageDiv.textContent = `Error: ${error.message}`;
        }
    });

    // Fetch the number of authenticated users from the server
    async function fetchAuthenticatedUsers() {
        try {
            const response = await fetch('/authenticated-users-count');
            const data = await response.json();
            console.log(`Currently authenticated users: ${data.count}`);
            userCountDiv.textContent = `Currently authenticated users: ${data.count}`;
            let userNames = data.users.map(user => user).join(', ');
            recentUsersDiv.textContent = `Recently Authenticated People : ${userNames}`;
        } catch (error) {
            console.error('Error fetching authenticated users:', error);
            userCountDiv.textContent = 'Error loading user count';
        }
    }

    

    // Fetch authenticated users count on page load
    fetchAuthenticatedUsers();

    // Update current people count
    socket.on('current-people-update', (count) => {
        currentPeopleDiv.textContent = `Currently connected people: ${count}`;
    });

    // Update authenticated users list
    socket.on('authenticated-users-update', (data) => {
        userCountDiv.textContent = `Currently Authenticated People: ${data.count}`;
        // Update the list of authenticated users
        let userNames = data.users.map(user => user).join(', ');
        recentUsersDiv.textContent = `Recently Authenticated People : ${userNames}`;

    });
});
