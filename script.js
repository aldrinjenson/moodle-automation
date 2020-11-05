const puppeteer = require("puppeteer");
// require("dotenv").config();
const cron = require("node-cron");
const parser = require("cron-parser");
const subjectLinks = require("./subjectLinks");
const { dateOptions } = require("./utils");
const { logMsg, sendLogs } = require("./logger");

const timeExp = "0 9-14 * * 1-5";
const interval = parser.parseExpression(timeExp);

let timesChecked = 0;
let timesMarked = 0;
let subjectsMarked = [];
let manuallyMarked = [];

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

const markAttendance = async (page, bot) => {
  timesChecked++;
  try {
    for (const [subject, subjectLink] of Object.entries(subjectLinks)) {
      if (
        !subjectsMarked.includes(subject) &&
        !manuallyMarked.includes(subject)
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
            subjectsMarked.push(subject);
            timesMarked++;
          } else {
            logMsg(`Error in marking attendance for ${subject}`);
          }
        } else {
          const isManuallyMarked = await checkManualMarking(page);
          if (isManuallyMarked) {
            logMsg(`Manually marked for ${subject}`);
            manuallyMarked.push(subject);
          } else logMsg(`Not available for ${subject}`);
        }
      }
    }
  } catch (error) {
    console.error(error);
  } finally {
    const subjectsLeft = Object.keys(subjectLinks).filter(
      (sub) => !subjectsMarked.includes(sub) && !manuallyMarked.includes(sub)
    );
    logMsg(`Times Checked = ${timesChecked}`);
    logMsg(`Times Marked Today = ${timesMarked}`);
    logMsg("Subjects Marked Today: " + subjectsMarked.join());
    logMsg("Subjects Manually marked Today: " + manuallyMarked.join());
    logMsg("Subjects Left to Mark: " + subjectsLeft.join());
    sendLogs(bot);
  }
};

const scrape = async (bot) => {
  const browser = await puppeteer.launch({ args: ["--no-sandbox"] });
  const page = await browser.newPage();
  await page.goto(process.env.BASE_URL);
  await page.type("#username", process.env.USERNAME);
  await page.type("#password", process.env.PASS);
  await page.keyboard.press("Enter");
  await page.waitForSelector(".colatt");
  await markAttendance(page, bot);
  await browser.close();
};

const main = (bot) => {
  logMsg("Started and running cron-job");
  cron.schedule(timeExp, () => {
    let dt = new Date();
    if (dt.getHours() < 9) {
      timesChecked = 0;
      timesMarked = 0;
      subjectsMarked = [];
      manuallyMarked = [];
    }
    try {
      logMsg(`\nChecking at ${dt.toLocaleTimeString("en-US", dateOptions)}`);
      logMsg(
        "Next check at " +
          interval.next().toDate().toLocaleTimeString("en-US", dateOptions)
      );
      scrape(bot);
    } catch (error) {
      console.error(error);
    }
  });
};

// main();

module.exports = {
  main,
  subjectsMarked,
  manuallyMarked,
  scrape,
  timesMarked,
  timesChecked,
};
