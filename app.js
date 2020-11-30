const scrape = require("./script");
const express = require("express");
const subjectLinks = require("./subjectLinks");

process.env.NTBA_FIX_319 = 1;
const TelegramBot = require("node-telegram-bot-api");
const { readObjFromFile } = require("./utils");
const { sendFullLogs, sendErrorLog, clearFullLogs } = require("./logger");
const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

bot.onText(/\/scrape/, () => {
  bot.sendMessage(process.env.CHAT_ID, "Scraping..");
  scrape(bot, true);
});

bot.onText(/\/errors/, () => {
  bot.sendMessage(process.env.CHAT_ID, "Getting error log:\n");
  sendErrorLog
    .then((msg) => bot.sendMessage(process.env.CHAT_ID, msg))
    .catch((err) => bot.sendMessage(process.env.CHAT_ID, err));
});

bot.onText(/\/fullLog/, () => {
  bot.sendMessage(process.env.CHAT_ID, "Getting full log:\n").then(() => {
    sendFullLogs
      .then((msg) => bot.sendMessage(process.env.CHAT_ID, msg))
      .catch((err) => bot.sendMessage(process.env.CHAT_ID, err));
  });
});

bot.onText(/\/clearFullLog/, () => {
  bot.sendMessage(process.env.CHAT_ID, "Clearing full log:\n");
  clearFullLogs
    .then((msg) => bot.sendMessage(process.env.CHAT_ID, msg))
    .catch((err) => bot.sendMessage(process.env.CHAT_ID, err));
});

const PORT = process.env.PORT || 5000;
const app = express();
app.set("view engine", "ejs");
app.use(express.static("public"));

app.get("/", (req, res) => {
  readObjFromFile().then((value) => {
    res.render("index", {
      ...value,
      subjectLinks,
    });
  });
});

app.get("/scrape", (req, res) => {
  scrape(bot);
  res.status(200).send({ msg: "Scraping started.." });
  console.log("request recieved to scrape");
});
app.listen(PORT);

// main(bot);
