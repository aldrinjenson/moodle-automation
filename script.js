const puppeteer = require("puppeteer");
require("dotenv").config();
const cron = require("node-cron");
const parser = require("cron-parser");
const subjectLinks = require("./subjectLinks");
const { dateOptions, formattedDateString } = require("./utils");

console.log(formattedDateString);

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

const markAttendance = async (page) => {
  timesChecked++;
  try {
    for (const [subject, subjectLink] of Object.entries(subjectLinks)) {
      if (!subjectsMarked.includes(subject)) {
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
            console.log(`Attendance marked for ${subject}`);
            subjectsMarked.push(subject);
            timesMarked++;
          } else {
            console.log(`Error in marking attendance for ${subject}`);
          }
        } else {
          const isManuallyMarked = await checkManualMarking(page);
          if (isManuallyMarked) {
            console.log(`Manually marked for ${subject}`);
            manuallyMarked.push(subject);
          } else console.log(`Not available for ${subject}`);
        }
      }
    }
  } catch (error) {
    console.error(error);
  } finally {
    const subjectsLeft = Object.keys(subjectLinks).filter(
      (sub) => !subjectsMarked.includes(sub) && !manuallyMarked.includes(sub)
    );
    console.log(`Times Checked = ${timesChecked}`);
    console.log(`Times Marked Today = ${timesMarked}`);
    console.log("Subjects Marked Today: " + subjectsMarked.join());
    console.log("Subjects Manually marked Today: " + manuallyMarked.join());
    console.log("Subjects Left to Mark: " + subjectsLeft.join());
    console.log(
      "Next check at " +
        interval.next().toDate().toLocaleTimeString("en-US", dateOptions)
    );
  }
};

const scrape = async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.goto(process.env.BASE_URL);
  await page.type("#username", process.env.USERNAME);
  await page.type("#password", process.env.PASS);
  await page.keyboard.press("Enter");
  await page.waitForSelector(".colatt");
  await markAttendance(page);
  await browser.close();
};

const main = () => {
  console.log("Started and running cron-job");
  cron.schedule(timeExp, () => {
    let dt = new Date();
    if (dt.getHours() < 9) {
      timesChecked = 0;
      timesMarked = 0;
      subjectsMarked = [];
      manuallyMarked = [];
    }
    try {
      console.log(
        `\nChecking at ${dt.toLocaleTimeString("en-US", dateOptions)}`
      );
      scrape();
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
