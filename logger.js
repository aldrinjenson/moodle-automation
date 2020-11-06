const fs = require("fs");
// require("dotenv").config();
const filePath = "./public/temp.txt";
const logStream = fs.createWriteStream(filePath, { flags: "a" });

const logMsg = (msg) => {
  console.log(msg);
  logStream.write(msg + "\n");
};

const clearLogs = () => {
  fs.writeFile(filePath, "", function () {
    console.log("Temp log cleared");
  });
};

const sendLogs = (bot) => {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      console.error(err);
      return;
    }
    bot
      .sendMessage(process.env.CHAT_ID, data.toString() || "Log empty")
      .then(() => {
        clearLogs();
      });
  });
};

module.exports = { logMsg, sendLogs, clearLogs };
