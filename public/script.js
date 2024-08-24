document.addEventListener('DOMContentLoaded', () => {
    const authForm = document.getElementById('authForm');
    const messageForm = document.getElementById('messageForm');
    const messageInput = document.getElementById('message');
    const authErrorDiv = document.getElementById('authError');
    const messageErrorDiv = document.getElementById('messageError');
    const userCountDiv = document.getElementById('userCount');
    const currentPeopleDiv = document.getElementById('currentPeople');
    const recentUsersDiv = document.getElementById('recentUsers');
    const authDiv = document.getElementById('auth');
    const sendDiv = document.getElementById('send_area');
    const chat = document.getElementById('chat');

    //setTimeout(() => {
        fetchAuthenticatedUsers();
        manageIO();
        fillMessages();

    //}, 100);
    

    // Initialize Socket.IO client
    const socket = io(); // Connect to the Socket.IO server

    messageForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const formData = new FormData(messageForm);
        const data = {};
        formData.forEach((value, key) => {
            data[key] = value;
        });
        try {
            let response = await fetch('/api/messages/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: data.message,
                })
            });
            const result = await response.json();
            if (response.status != 201) {
                authErrorDiv.textContent = result.message;
            }
            messageInput.value = '';
            socket.emit('message');
        } catch (error) {
            console.error('Error saving message');
            messageErrorDiv.textContent = 'Error saving message';
        }
    });

    // Handle form submission
    authForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Prevent the default form submission

        const formData = new FormData(authForm);
        const data = {};
        formData.forEach((value, key) => {
            data[key] = value;
        });
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
                    authErrorDiv.textContent = result.message;
                    authDiv.style.display = 'none';
                    sendDiv.style.display = 'block';
                    fetchAuthenticatedUsers();
                    socket.emit('authenticate');
                    break;
                case 401:
                    // Invalid credentials
                    authErrorDiv.textContent = 'Invalid credentials. Please try again.';
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
                        authErrorDiv.textContent = 'Registration successful! You can now log in.';
                    } else {
                        authErrorDiv.textContent = `Error: ${registerResult.message}`;
                    }
                    break;

                default:
                    // Handle other errors
                    authErrorDiv.textContent = `Error: ${result.message || 'Something went wrong.'}`;
                    break;
            }
        } catch (error) {
            authErrorDiv.textContent = `Error: ${error.message}`;
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

    async function fillMessages() {
        chat.textContent = ''
        try {
            const response = await fetch('/history');
            const data = await response.json();
            data.forEach(msg => {
                const messageDiv = document.createElement('div');
                messageDiv.classList.add('message');
    
                const userSpan = document.createElement('span');
                userSpan.classList.add('user');
                userSpan.textContent = msg.user;
    
                const messageText = document.createElement('span');
                messageText.textContent = `: ${msg.message}`;
    
                messageDiv.appendChild(userSpan);
                messageDiv.appendChild(messageText);
    
                chat.appendChild(messageDiv);
            });
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

    socket.on('update-chat', () => {
        fillMessages();
    });
});
