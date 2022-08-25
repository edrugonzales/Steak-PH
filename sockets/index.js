module.exports = function (io, socket) {
  // account name - account id - room id (store)
  socket.on('custom-event', (number, string, obj) => {
   console.log(socket.id)
  //  socket.emit()
   console.log(number, string, obj);
   io.emit('receive-message', {number, string, obj})
  });
};