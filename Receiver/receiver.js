const PORT = 7681;
const { exec } = require("child_process");
const io = require("socket.io-client");

const connectionAddr = "http://localhost";
const socket = io.connect(`${connectionAddr}:${PORT}`, {
  reconnection: true,
});

socket.on("connect", () => {
  console.log("Connected to server");
});

exec("ls ~", (err, stdout, stderr) => {
  if (err) console.log(err);
  if (stderr) console.log(stderr);
  else {
    console.log(stdout);
  }
});
