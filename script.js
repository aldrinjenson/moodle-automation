const puppeteer = require("puppeteer");
require("dotenv").config();
const cron = require("node-cron");
const logger = require("./logger");
const subjectLinks = require("./subjectLinks");

let timesChecked = 0;
let timesMarked = 0;
let subjectsMarked = [];

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

        // if (attendanceLink) {
        // console.log(statusLink, "sup");
        // await page.goto(statusLink, { waitUntil: "networkidle2" });

        // console.log("error below this");
        // const attendanceLink = await page.$eval(".statuscol.cell a", (e) =>
        //   e ? e.href : ""
        // );
        // console.log("error above this");

        if (attendanceLink) {
          await page.goto(attendanceLink, { waitUntil: "networkidle2" });

          await page.evaluate(() => {
            let label = [...document.querySelectorAll(".statusdesc")].find(
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
          console.log(`Not available for ${subject}`);
        }
      }
    }
  } catch (error) {
    logger.error(error);
  }
};

const scrape = async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto(process.env.BASE_URL);

  await page.type("#username", process.env.USERNAME);
  await page.type("#password", process.env.PASS);
  await page.keyboard.press("Enter");

  await page.waitForSelector(".colatt");

  await markAttendance(page);

  // await browser.waitForTarget(() => false);
  await browser.close();
};

const main = () => {
  console.log("Started and running cron-job");
  cron.schedule("0 9-13 * * 1-5", () => {
    // cron.schedule("* * * * *", () => {
    if (new Date().getHours() < 10) {
      timesChecked = 0;
      timesMarked = 0;
      subjectsMarked = [];
    }
    try {
      console.log(`Checking at ${new Date().toLocaleTimeString()}`);
      console.log(`Times Checked = ${timesChecked}`);
      console.log(`Times Marked Today = ${timesMarked}`);
      console.log("Subjects Marked Today: " + subjectsMarked.join());
      scrape();
    } catch (error) {
      logger.error(error);
    }
  });
};

main();
