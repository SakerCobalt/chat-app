const users = []

//add user
const addUser = ({id,username,room})=>{
  //Clean the data
  username = username.trim().toLowerCase()
  room = room.trim().toLowerCase()

  if (!room || !username) {
    return {
      error: 'Username and Room are requried.'
    }
  }

  //check for existing user
  const existingUser = users.find((user)=>{
    //If both of these are true, then there is already the user in the same room
    return user.room === room && user.username === username
  })
  if (existingUser){
    return {
      error: 'Username is in use!'
    }
  }

  //Store user
  const user = {id, username, room}
  users.push(user)
  return {user}
}

const removeUser = (id)=>{
  const index = users.findIndex((user)=>{
    return user.id === id
  })
  if (index !== -1) {
    //splice returns the array of items removed
    return users.splice(index,1)[0]
  }
}

const getUser = (id)=>{
  return users.find((user)=>{
    return user.id === id
  })
}

const getUsersInRoom = (room) =>{
  return users.filter((user)=>{
    return user.room === room
  })
}

// addUser({
//   id:22,
//   username:"Andrew",
//   room:"South Philly"
// })

// addUser({
//   id: 42,
//   username: 'Mike',
//   room:'South Philly'
// })

// addUser({
//   id:32,
//   username: 'Andrew',
//   room:'Center City'
// })

// const user = getUser(42)
// console.log(user)

// const userList = getUsersInRoom('south philly')
// console.log(userList)

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom
}