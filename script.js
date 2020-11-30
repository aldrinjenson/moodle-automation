const puppeteer = require("puppeteer");
// require("dotenv").config();
const subjectLinks = require("./subjectLinks");
const { dateOptions, readObjFromFile, writeObjToFile } = require("./utils");
const { logMsg, sendLogs } = require("./logger");

let checkDetails;

const checkManualMarking = async (page) => {
  const isManuallyMarked = await page.evaluate(() => {
    const nobr = [...document.querySelectorAll("nobr")].find(
      (el) =>
        el.innerText ===
        new Date()
          .toLocaleDateString("en-IN", {
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "numeric",
          })
          .replace(/,/g, "")
    );
    if (!nobr) return false;
    const parentRow = nobr.parentElement.parentElement;
    const presentRows = [...document.querySelectorAll(".statuscol.cell.c2")]
      .filter((el) => el.innerText === "Present")
      .map((el) => el.parentElement);
    return presentRows.includes(parentRow);
  });
  return isManuallyMarked;
};

const markAttendance = async (page, bot, isFromTelegram) => {
  checkDetails.timesChecked++;
  for (const [subject, subjectLink] of Object.entries(subjectLinks)) {
    try {
      if (
        !checkDetails.subjectsMarked.includes(subject) &&
        !checkDetails.manuallyMarked.includes(subject)
      ) {
        await page.goto(subjectLink);
        await page.waitForSelector(".statuscol");

        const attendanceLink = await page.evaluate(() => {
          let link = document.querySelector(".statuscol a");
          return link ? link.href : "";
        });

        if (attendanceLink) {
          await page.goto(attendanceLink, { waitUntil: "networkidle2" });

          await page.evaluate(() => {
            const label = [...document.querySelectorAll(".statusdesc")].find(
              (el) => el.innerText === "Present"
            );
            label.click();
            return;
          });
          await page.click("#id_submitbutton");
          await page.waitForSelector("#user-notifications");

          const notificationText = await page.$eval(
            "#user-notifications div ",
            (e) => e.innerText
          );
          if (
            notificationText.slice(2) ===
            "Your attendance in this session has been recorded."
          ) {
            logMsg(`Attendance marked for ${subject}`);
            checkDetails.subjectsMarked.push(subject);
            checkDetails.timesMarked++;
            bot.sendMessage(
              process.env.CHAT_ID,
              `Attendance marked for ${subject}`
            );
          } else {
            logMsg(`Error in marking attendance for ${subject}`);
            bot.sendMessage(
              process.env.CHAT_ID,
              `Attendance marking error for ${subject}`
            );
          }
        } else {
          const isManuallyMarked = await checkManualMarking(page);
          if (isManuallyMarked) {
            logMsg(`Manually marked for ${subject}`);
            checkDetails.manuallyMarked.push(subject);
          } else logMsg(`Not available for ${subject}`);
        }
      }
    } catch (error) {
      console.error(error);
      bot.sendMessage(process.env.CHAT_ID, `${subject} - ${error.toString()}`);
    }
  }
  checkDetails.subjectsLeft = Object.keys(subjectLinks).filter(
    (sub) =>
      !checkDetails.subjectsMarked.includes(sub) &&
      !checkDetails.manuallyMarked.includes(sub)
  );
  logMsg(`Times Checked = ${checkDetails.timesChecked}`);
  logMsg(`Times Marked Today = ${checkDetails.timesMarked}`);
  logMsg("Subjects Marked Today: " + checkDetails.subjectsMarked.join(", "));
  logMsg(
    "Subjects Manually marked Today: " + checkDetails.manuallyMarked.join(", ")
  );
  logMsg("Subjects Left to Mark: " + checkDetails.subjectsLeft.join(", "));
  logMsg("Next check at " + checkDetails.nextCheckAt);
  isFromTelegram && sendLogs(bot);
};

const scrape = async (bot, isFromTelegram = false) => {
  checkDetails = await readObjFromFile();
  let dt = new Date();
  logMsg(`\nChecking at ${dt.toLocaleTimeString()}`);
  if (dt.getHours() < 9) {
    checkDetails.timesChecked = 0;
    checkDetails.timesMarked = 0;
    checkDetails.subjectsMarked = [];
    checkDetails.manuallyMarked = [];
  }
  dt.setMinutes(1);
  dt.setHours(dt.getHours() == 3 ? 9 : dt.getHours() + 1);
  checkDetails.nextCheckAt = dt.toLocaleTimeString("en-US", dateOptions);

  console.log("Subjects marked = ", checkDetails.subjectsMarked.join(","));
  console.log("times checked = " + checkDetails.timesChecked);

  const browser = await puppeteer.launch({ args: ["--no-sandbox"] });
  const page = await browser.newPage();
  await page.goto(process.env.BASE_URL);
  await page.type("#username", process.env.USERNAME);
  await page.type("#password", process.env.PASS);
  await page.keyboard.press("Enter");
  await page.waitForSelector(".colatt");
  await markAttendance(page, bot, isFromTelegram);
  await browser.close();
  writeObjToFile(checkDetails);
};

module.exports = scrape;
