const fs = require("fs");
const { logMsg } = require("./logger");
const subjectLinks = require("./subjectLinks");
const dailyCheckLogFile = "./public/dailyLogDetails.txt";

const dateOptions = { hour: "numeric", minute: "numeric", hour12: true };

const writeObjToFile = (obj) => {
  fs.writeFile(dailyCheckLogFile, JSON.stringify(obj), (err) => {
    console.log("Object stored to dailyCheckLog");
  });
};

const initialObj = {
  timesChecked: 0,
  timesMarked: 0,
  subjectsMarked: [],
  manuallyMarked: [],
  nextCheckAt: new Date().toLocaleTimeString("en-US", dateOptions),
  subjectsLeft: Object.keys(subjectLinks),
};

const readObjFromFile = () => {
  const executor = (resolve, reject) => {
    fs.readFile(dailyCheckLogFile, (err, data) => {
      if (err) {
        logMsg("error in reading obj");
        resolve(initialObj);
      } else {
        resolve(JSON.parse(data) || initialObj);
      }
    });
  };
  return new Promise(executor);
};

module.exports = { dateOptions, writeObjToFile, readObjFromFile, initialObj };
