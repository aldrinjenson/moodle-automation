const puppeteer = require("puppeteer");
require("dotenv").config();
const colors = require("colors");
const logger = require("./logger");
const links = require("./links");

const markAttendance = async (page) => {
  try {
    for (const [subject, link] of Object.entries(links)) {
      await page.goto(link, { waitUntil: "networkidle2" });
      // await page.waitForSelector(".statuscol");
      // const statusLink = await page.evaluate(() => {
      //   return [...document.querySelectorAll(".statuscol a")];
      // });
      const statusLink = await page.$eval(".statuscol a", (el) => el);
      console.log(statusLink);

      if (statusLink && statusLink.length) {
        await page.goto(statusLink, { waitUntil: "networkidle2" });

        const attendanceLink = await page.$eval(
          ".statuscol.cell a",
          (e) => e.href
        );
        if (attendanceLink) {
          await page.goto(attendanceLink, { waitUntil: "networkidle2" });
          await page.waitForSelector(".statusdesc");
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
          } else {
            console.log(`Error in marking attendance for ${subject}`);
          }
        }
      } else {
        console.log(`Not available for ${subject}`);
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

  await browser.waitForTarget(() => false);
  // await browser.close();
};

const main = () => {
  try {
    scrape();
  } catch (error) {
    logger.error(error);
  }
};

main();
