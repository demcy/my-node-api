document.addEventListener('DOMContentLoaded', () => {
    const authForm = document.getElementById('authForm');
    const messageDiv = document.getElementById('message');
    const userCountDiv = document.getElementById('userCount');
    const currentPeopleDiv = document.getElementById('currentPeople');
    const recentUsersDiv = document.getElementById('recentUsers');
    const authDiv = document.getElementById('auth');
    const sendDiv = document.getElementById('send_area');

    //setTimeout(() => {
        fetchAuthenticatedUsers();
        manageIO();

    //}, 100);
    

    // Initialize Socket.IO client
    const socket = io(); // Connect to the Socket.IO server

    // Handle form submission
    authForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Prevent the default form submission

        const formData = new FormData(authForm);
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
            //console.log(result);

            switch (response.status) {
                case 200:
                    // Successful login
                    messageDiv.textContent = result.message;
                    authDiv.style.display = 'none';
                    sendDiv.style.display = 'block';
                    fetchAuthenticatedUsers();
                    socket.emit('authenticate');
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
            const response = await fetch('/authenticated-users');
            const data = await response.json();
            userCountDiv.textContent = `Currently authenticated users: ${data.count}`;
            console.log(data.usernames)
            let usernames = data.usernames.map(username => username).join(', ');
            recentUsersDiv.textContent = `Recently Authenticated People : ${usernames}`;
        } catch (error) {
            console.error('Error fetching authenticated users:', error);
            userCountDiv.textContent = 'Error loading user count';
        }
    }

    async function manageIO() {
        try {
            const response = await fetch('/is-authenticated');
            const data = await response.json();
            if (data.valid) {
                authDiv.style.display = 'none';
                sendDiv.style.display = 'block';
                //socket.emit('authenticate', token, () => console.log('reconnect'));
            } else {
                authDiv.style.display = 'block';
                sendDiv.style.display = 'none';
            }
        } catch (error) {
            console.error('Error fetching token valid:', error);
        }
    }

    // ioManagement

    // Fetch authenticated users count on page load
    
    // Update current people count
    socket.on('current-people-update', (count) => {
        currentPeopleDiv.textContent = `Currently connected people: ${count}`;
    });

    // Update authenticated users list
    socket.on('authenticated-users-update', (data) => {
        fetchAuthenticatedUsers();
    });
});
