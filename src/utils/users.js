const users = [];

// add User, remove User  , get User , getusersInRoom

const addUser = ({ id, username , room }) => {
        // clean the data
        username = username.trim().toLowerCase();
        room = room.trim().toLowerCase();

        // validate the data
        if(!username || !room) {
            return {
                error: 'username & room are required'
            };
        }

        // check for existing user

        const existingUser = users.find((user) => {
            return user.username === username && user.room === room
        });

        // validate username
         if( existingUser) {
            return {
                error: 'username is in use'
            };
         }

         // store user

         const user = { id, username, room};
         users.push(user);

         return { user };
};

const removeUser = (id) => {

    const index = users.findIndex((user) => user.id === id );
    if(index !== -1) {
        return users.splice(index,1)[0]
    }
};

const getUser = (id) => {

    return users.find((user) => user.id === id);
/*     const index = users.findIndex((user) => user.id === id);
    if( index > -1) {
        return users[index];
    }

    return undefined; */
};

const getUsersInRoom = (room) => {
    room = room.trim().toLowerCase();
    return users.filter((user) => user.room === room) 
  /*   if( roomUsers) {
        return roomUsers;
    }

    return []; */
}


module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}