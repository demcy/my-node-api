// public/chat.js
const socket = io();

const form = document.getElementById('form');
const input = document.getElementById('input');
const messages = document.getElementById('messages');

form.addEventListener('submit', (event) => {
  event.preventDefault();
  if (input.value) {
    socket.emit('message', { user: 'Anonymous', text: input.value });
    input.value = '';
  }
});

socket.on('message', (msg) => {
  const item = document.createElement('li');
  item.textContent = `${msg.user}: ${msg.text}`;
  messages.appendChild(item);
  window.scrollTo(0, document.body.scrollHeight);
});
