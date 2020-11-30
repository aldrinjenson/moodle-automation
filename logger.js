const fs = require("fs");
// require("dotenv").config();
const filePath = "./public/temp.txt";
const logStream = fs.createWriteStream(filePath, { flags: "a" });

const logMsg = (msg) => {
  console.log(msg);
  logStream.write(msg + "\n");
};

const read = () => {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, (err, data) => {
      if (err) reject(err);
      resolve(data);
    });
  });
};

const send = (bot) => {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, (err, data) => {
      if (err) reject(err);
      bot.sendMessage(process.env.CHAT_ID, data.toString());
      resolve();
    });
  });
};

const sendLogs = async (bot) => {
  read()
    .then(() => send(bot))
    .then(() => {
      fs.writeFile(filePath, "", () => console.log("File cleared"));
    })
    .catch((err) => {
      console.error(err);
      bot.sendMessage(process.env.CHAT_ID, err.toString());
    });
};

module.exports = { logMsg, sendLogs };
