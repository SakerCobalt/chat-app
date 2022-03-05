//Because this script is called after we call the client side socket.io in the index.html, it has access to the io function
const socket = io()

const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormBtn = $messageForm.querySelector('button')
const $sendLocationBtn = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//Options
const {username, room} = Qs.parse(location.search, { ignoreQueryPrefix : true})

const autoscroll = ()=>{
  //New message element
  const $newMessage = $messages.lastElementChild

  //Height of the new message
  let newMessageHeight = $newMessage.offsetHeight  //Dosn't include margin
  const newMessageSytles = getComputedStyle($newMessage)
  const newMessageMargin = parseInt(newMessageSytles.marginBottom)
  newMessageHeight += newMessageMargin

  //Visible Height
  const visibleHeight = $messages.offsetHeight

  //Height of message container
  const containerHeight = $messages.scrollHeight

  //How far down are we currently scrolled
  //from 0 at top to end of container
  const scrollOffset = $messages.scrollTop + visibleHeight  

  if (containerHeight - newMessageHeight <= scrollOffset) {
    $messages.scrollTop = $messages.scrollHeight
  }

}

socket.on('message', (message)=>{
  // console.log(message)
  const html = Mustache.render(messageTemplate, {
    username:message.username,
    message:message.text,
    createdAt: moment(message.createdAt).format('HH:mm')
  })
  $messages.insertAdjacentHTML('beforeend',html)
  autoscroll()
})

socket.on('locationMessage',(message)=>{
  // console.log(url)
  const html = Mustache.render(locationMessageTemplate,{
    username:message.username,
    url:message.url,
    createdAt: moment(message.createdAt).format('HH:mm')
  })
  $messages.insertAdjacentHTML('beforeend',html)
  autoscroll()
})

socket.on('roomData',({room,users})=>{
  const html = Mustache.render(sidebarTemplate, {
    room,
    users
  })
  document.querySelector('#sidebar').innerHTML = html

})

$messageForm.addEventListener('submit', (e)=>{
  e.preventDefault()
  //disable form until previous message is completely sent
  $messageFormBtn.setAttribute('disabled','disabled')

  const message = e.target.elements.message.value

  socket.emit('sendMessage',message, (error)=>{
    //enable form send button
    $messageFormBtn.removeAttribute('disabled')
    $messageFormInput.value = ''
    $messageFormInput.focus() //moves the cursor back to the input block

    if (error) {
      return console.log(error)
    }
    console.log('Message Delivered')
  })
})

$sendLocationBtn.addEventListener('click',()=>{
  if(!navigator.geolocation){
    return alert('Geolocatioin is not supported by your browser.')
  }
  //Disable send location button
  $sendLocationBtn.disabled = true

  navigator.geolocation.getCurrentPosition((position)=>{
    const {latitude,longitude} = position.coords
    // console.log(latitude,longitude)
    socket.emit('sendLocation',{latitude,longitude},(response)=>{
      console.log('Location shared!')
      //enable send-location button
      $sendLocationBtn.disabled = false
    })
  })
})

socket.emit('join',{username, room}, (error)=>{
  if (error){
    alert(error)
    location.href='/'
  }
})