module.exports = function (io, socket) {


  socket.on('emit-general-broadcasts', data => {
    io.emit("receive-general-broadcasts", data)
  })

  socket.on('emit-selected-broadcasts', (targetUsers, data) => {
    for (let index = 0; index < targetUsers.length; index++) {
      io.emit(`receive-selected-broadcasts-${targetUsers[index]}`, data)
    }
  })

  


};