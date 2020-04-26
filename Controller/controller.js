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
    console.log(
      "\nAVAILABLE COMMANDS: \n\tshow\n\tconnect <user>\n\t[all standard bash commands]\n\treturn\n"
    );
    getCommand();
  } else if (command === "show") {
    socket.emit("show-users");
    socket.on("show-users", (users) => {
      for (let i = 0; i < users.length; i++) {
        console.log(`\t${users[i]}`);
      }
      getCommand();
    });
  } else if (command.substr(0, "connect ".length) === "connect ") {
    const connectTo = command.substr("connect ".length, command.length);
    socket.emit("connect-user", connectTo);
    socket.on("connect-user", (success) => {
      if (success === 0) {
        log("error", "User not connected to server");
      } else if (success === 1) {
        connection = connectTo;
      }
      getCommand();
    });
  } else if (command === "return") {
    if (connection === "UNCONNECTED") {
      console.log("No connection established");
      getCommand();
    } else {
      socket.emit("return");
      socket.on("return", () => {
        log("info", `Disconnected from ${connection}`);
        connection = "UNCONNECTED";
        getCommand();
      });
    }
  } else {
    console.log("\nCommand not valid\n");
    getCommand();
  }
}

setTimeout(() => getCommand(), 500);
