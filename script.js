const puppeteer = require("puppeteer");
require("dotenv").config();
const colors = require("colors");
const logger = require("./logger");
const links = require("./links");

const markAttendance = async (page) => {
  try {
    for (const link of Object.values(links)) {
      await page.goto(link);
      await page.waitForSelector(".statuscol");
      const statusLink = await page.evaluate(() => {
        // return [...document.querySelectorAll(".statuscol a")][0];
        return [...document.querySelectorAll(".statuscol a")];
      });
      console.log(statusLink);
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
  // await page.keyboard.press("Enter");

  await page.waitForSelector(".colatt");

  await markAttendance(page);
  await browser.waitForTarget(() => {});
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
