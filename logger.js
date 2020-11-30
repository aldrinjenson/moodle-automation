const fs = require("fs");
// require("dotenv").config();
const tempLogFilePath = "./public/temp.txt";
const errorFilePath = "./public/errors.log";
const fullLogFilePath = "./public/logs.log";
const logStream = fs.createWriteStream(tempLogFilePath, { flags: "a" });

const logMsg = (msg) => {
  console.log(msg);
  logStream.write(msg + "\n");
};

// only fired when requested from telegram bot
const sendFullLogs = new Promise((resolve, reject) => {
  resolve("to be fixed");
  // fs.readFile(fullLogFilePath, (err, data) => {
  //   if (err) reject(err.toString());
  //   resolve(data.toString());
  // });
});

const sendErrorLog = new Promise((resolve, reject) => {
  resolve("to be fixed");
  // fs.readFile(errorFilePath, (err, data) => {
  //   if (err) reject(err.toString());
  //   resolve(data.toString());
  // });
});

const clearFullLogs = new Promise((resolve, reject) => {
  fs.writeFile(fullLogFilePath, "", (err) => {
    if (err) reject(err);
    resolve("error log file cleared");
  });
});

/////////////////////

const send = (bot) => {
  return new Promise((resolve, reject) => {
    try {
      fs.readFile(tempLogFilePath, (err, data) => {
        if (data.length > 1) {
          bot.sendMessage(process.env.CHAT_ID, data.toString());
          resolve();
        }
      });
    } catch (error) {
      reject(err);
    }
  });
};

const sendErrors = (bot) => {
  sendErrorLog
    .then((msg) => {
      if (msg.length > 1) bot.sendMessage(process.env.CHAT_ID, msg);
    })
    .catch((err) => bot.sendMessage(process.env.CHAT_ID, err));
};

const sendLogs = async (bot) => {
  send(bot)
    .then(() => {
      fs.writeFile(tempLogFilePath, "", () =>
        console.log("temp log File cleared")
      );
    })
    .then(() => sendErrors(bot))
    .catch((err) => {
      console.error(err);
      bot.sendMessage(process.env.CHAT_ID, err.toString());
    });
};

module.exports = {
  logMsg,
  sendLogs,
  sendErrorLog,
  sendFullLogs,
  clearFullLogs,
};
