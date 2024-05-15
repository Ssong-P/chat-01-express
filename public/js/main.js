const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

// Get username and room from URL
// Qs lib & 구조분해
// const { username : room } = Qs.parse(location.search, {  <== ?username=zzz&room=JavaScript 이런식으로 잘림
const { username, room } = Qs.parse(location.search.substring(1), {
    // URL 쿼리 접두어 무시
    ignoreQueryPrefix: true
});

// socket이라는 변수를 접근할 수 있는 io로 설정
const socket = io();

// Join ChatRoom
socket.emit('joinRoom', { username, room });

// Get room and users
socket.on('roomUsers', ({ room, users }) => {
    outputRoomName(room);
    outputUsers(users);
})

// server에서 보낸 message 출력 (Message from server)
socket.on('message', message => {
    console.log(message);
    outputMessage(message);

    // Scroll down
    chatMessages.scrollTop = chatMessages.scrollHeight;
});

// Message submit
chatForm.addEventListener('submit', (e) => {

    // 파일로 전송되는 기본 동작 방지
    e.preventDefault();

    // Get message text
    // id=msg의 value 가져옴
    const msg = e.target.elements.msg.value;

    // console.log(msg);
    // Emit msssgae to server
    socket.emit('chatMessage', msg);
    
    // Clear input
    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();
});

// Output message to Dom
function outputMessage(message) {
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
                    <p class="text">
                        ${message.text}
                    </p>`;
    document.querySelector('.chat-messages').appendChild(div);
}

// Add room name to DOM
function outputRoomName(room) {
    roomName.innerText = room;
}

// Add users to DOM
function outputUsers(users) {
    userList.innerHTML = `
        ${users.map(user => `<li>${user.username}</li>`).join('')}
    `;
}