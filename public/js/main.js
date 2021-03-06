const chatForm = document.getElementById('chat-form')
    , chatMessages = document.querySelector('.chat-messages')
    , roomName = document.getElementById('room-name')
    , userList = document.getElementById('users')

// Get username and room from URL
const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true,
});

const socket = io();

// Join chatroom
socket.emit('joinRoom', { username, room});

// Get room and users
socket.on('roomUsers', ({ room, users }) => {
    outputRoomName(room);
    outputUsers(users);
});

// Message from server
socket.on('message', (message) => {
    console.log(message);
    outputMessage(message);

    //  Scroll down
    chatMessages.scrollTop = chatMessages.scrollHeight; 
});


// Message Submit
chatForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Get message Text
    let msg = e.target.elements.msg.value;

    msg = msg.trim();

    if(!msg) {
        console.log(msg);
        return false;
    }

    //  Emit message to server
    socket.emit('chatMessage', msg);

    // Clear input
    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();
});


// Output message to DOM
const outputMessage = (message) => {
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
    <p class="text">
        ${message.text}
    </p>`

    // const p = document.createElement('p');
    // p.classList.add('meta');
    // p.innerText = message.username;
    // p.innerHTML += `<span>${message.time}</span>`;
    // div.appendChild(p);

    // const para = document.createElement('p');
    // para.classList.add('text');
    // para.innerText = message.text;
    // div.appendChild(para);
    document.querySelector('.chat-messages').appendChild(div);
}

//  Add room name to DOM
const outputRoomName = (room) => {
    roomName.innerText = room;
};

// Add Users to DOM
const outputUsers = (users) => {
    userList.innerHTML = `${users.map(user => `<li>${user.username}</li>`).join('')}`;
};

// Prompt the user before leave chat room
document.getElementById('leave-btn').addEventListener('click', () => {
    const leaveRoom = confirm('Are you sure want to leave the chatroom?');

    if(leaveRoom) {
        window.location = '../index';
    }
});
