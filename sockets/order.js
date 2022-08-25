module.exports = function (io, socket) {
  socket.on("create-order", (data) => {
    let parseData = JSON.parse(data);

    console.log(`From socket ${parseData.shop}`);

    //Emit to Chomper
    io.emit(`new-order-${parseData.user._id}`, parseData);

    //Emit to Merchant
    io.emit(`new-order-${parseData.shop}`, parseData);
  });

  socket.on("update-order", (data) => {
    console.log(data);
    let parseData = JSON.parse(data);

    //Emit
    io.emit(`order-update-${parseData._id}`, parseData);
  });
};
