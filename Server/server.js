const express = require("express");
const bodyParser = require("body-parser");
const http = require("http");
// const io = require("socket.io")(http);
const SEND_PORT = 7681;
const REC_PORT = 7680;
const io = require("socket.io").listen(SEND_PORT);

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

io.on("connection", (socket) => {
  console.log("A user is connected:", socket.client.id);
});

app.post("/sendCommand", (req, res) => {
  const { command } = req.body;
  io.emit("command", command);
});

app.listen(REC_PORT, () => {
  console.log(`Remote Controller Server is listening on port ${REC_PORT}`);
});
