const fs = require("fs");

const dateOptions = { hour: "numeric", minute: "numeric", hour12: true };

const formattedTodaysDate = new Date()
  .toLocaleDateString("en-IN", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  })
  .replace(/,/g, "");

const formattedDateString = formattedTodaysDate.replace(/,/g, "");

const clear = async () => {
  fs.truncate("logFile.txt", 0, () => {
    return true;
  });
};

module.exports = { dateOptions, clear };
