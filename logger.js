const fs = require("fs");
// require("dotenv").config();
const filePath = "./public/temp.txt";
const logStream = fs.createWriteStream(filePath, { flags: "a" });

const logMsg = (msg) => {
  console.log(msg);
  logStream.write(msg + "\n");
};

const sendLogs = (bot) => {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      console.error(err);
      return;
    }
    bot.sendMessage(process.env.CHAT_ID, data.toString());
  });
  fs.writeFile(filePath, "", function () {
    console.log("File cleared");
  });
};

module.exports = { logMsg, sendLogs };
