const socket = io();
const searchElement = document.querySelector('input');

// Elements
const $messageForm = document.querySelector('#message-form');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');
const $locationButton = document.querySelector('#send-location');
const $messages = document.querySelector('#messages');

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationTemplate = document.querySelector('#location-template').innerHTML;
const sideBarTemplate = document.querySelector('#sidebar-template').innerHTML;

// options
const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true
});

const autoScroll = () => {
    // new messages element
    const $newMessage = $messages.lastElementChild;

    // height of last new message
    const newMessageStyle = getComputedStyle($newMessage);
    const newMessageMargin = parseInt(newMessageStyle.marginBottom);
    const newMessageHeight =$newMessage.offsetHeight + newMessageMargin;

    // visible height
    const visibleHeight = $messages.offsetHeight;
    

    // height of messages container
    const containerHeight = $messages.scrollHeight;
    

    // how far have i scrolled
    const scrollOffset = $messages.scrollTop + visibleHeight;

    if( containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight;
    }
}


socket.on('countupdated', (count) => {
    console.log('client socket connection', count); 
});

socket.on('locationMessage', (locationMessage) => {
     const html = Mustache.render(locationTemplate, {
         username : locationMessage.username,
        location : locationMessage.url,
        currentTime: moment(locationMessage.createdAt).format('h:mm a')
    });
    $messages.insertAdjacentHTML('beforeend', html);
    autoScroll();
});

socket.on('message', (message) => {
    console.log(message );
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message : message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    });
    $messages.insertAdjacentHTML('beforeend', html);
    autoScroll();
});

socket.on('roomData', ({ room , users}) => {
   const html = Mustache.render(sideBarTemplate , {
        room,
        users 
   });

   document.querySelector('#sidebar').innerHTML = html;
})

$messageForm.addEventListener('submit', (e) => {
        e.preventDefault();

        $messageFormButton.setAttribute('disabled', 'disabled');

        const message = e.target.elements.message.value;
        socket.emit('sendMessage', message , (error) => {
            $messageFormButton.removeAttribute('disabled');
            $messageFormInput.value = '';
            $messageFormInput.focus();

            if ( error) {
              return  console.log(error);
            }
        console.log('the message delivered');
        });
    });

socket.on('clientMessageSend', (message) => {
    console.log(message);
});

$locationButton.addEventListener('click', () => {
    if(!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser');
    }

    $locationButton.setAttribute('disabled','disabled');

    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {
            longitutde : position.coords.longitude,
            latitude : position.coords.latitude
        }, () => {
            $locationButton.removeAttribute('disabled');
            console.log('location shared!!');
        });
    });
});

/* socket.on('sendLocation', (location) => {
    console.log(location.longitutde);
    console.log(location.latitude);
}); */

socket.emit('join', { username , room} , (error) => {
        if(error) {
            alert(error);
            location.href = '/';
        }
});