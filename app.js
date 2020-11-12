const {
  // main,
  subjectsMarked,
  manuallyMarked,
  timesMarked,
  timesChecked,
  scrape,
} = require("./script");
const express = require("express");
const subjectLinks = require("./subjectLinks");

process.env.NTBA_FIX_319 = 1;
const TelegramBot = require("node-telegram-bot-api");
const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

bot.onText(/\/scrape/, () => {
  bot.sendMessage(process.env.CHAT_ID, "Scraping..");
  scrape(bot, true);
});

const PORT = process.env.PORT || 5000;
const app = express();
app.set("view engine", "ejs");
app.use(express.static("public"));

app.get("/", (req, res) => {
  const subjectsLeftToMark = Object.keys(subjectLinks).filter(
    (subject) =>
      !subjectsMarked.includes(subject) && !manuallyMarked.includes(subject)
  );

  res.render("index", {
    subjectLinks,
    subjectsMarked,
    manuallyMarked,
    timesMarked,
    timesChecked,
    subjectsLeftToMark,
  });
});

app.get("/scrape", (req, res) => {
  scrape(bot);
  res.status(200).send({ msg: "Scraping started.." });
  console.log("request recieved to scrape");
});
app.listen(PORT);

// main(bot);
