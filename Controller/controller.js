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

// let command = "";
let connection = "UNCONNECTED";

function getCommand() {
  inputReader.question(`[${connection}]: `, (command) => {
    if (command === "exit") {
      log("end", "Closing controller");
      inputReader.close();
      process.exit(1);
    } else if (command === "help") {
      console.log(
        "\nAVAILABLE COMMANDS: \n\tshow\n\tconnect <user>\n\t[all standard bash commands]\n\tdisconnect\n"
      );
      getCommand();
    } else {
      console.log("You entered command: ", command);
      getCommand();
    }
  });
}

// while (command != "exit") {
//   // process.stdout.write(`[${connection}]: `);
//   inputReader.question(`[${connection}]: `, async (newCommand) => {
//     console.log("You entered command: ", newCommand);
//     command = newCommand;
//   });
//   // const newCommand = await inputReader.question(`[$(connection)]`);
//   // console.log("You entered command: ", newCommand);
//   // command = newCommand;
// }

setTimeout(() => getCommand(), 300);
// getCommand();
