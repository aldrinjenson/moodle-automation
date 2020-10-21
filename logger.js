module.exports = {
  error: (message) => console.error(message.red),
  warn: (message) => console.log(message.yellow),
  info: (message) => console.log(message.green),
  debug: (message) => console.log(message.blue),
};
