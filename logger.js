const colors = require("colors");

module.exports = {
  error: (message) => console.log(message.red),
  warn: (message) => console.log(message.yellow),
  info: (message) => console.log(message.green),
  debug: (message) => console.log(message.blue),
};
