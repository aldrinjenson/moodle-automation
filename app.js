// const {
//   main,
//   subjectsMarked,
//   manuallyMarked,
//   timesMarked,
//   timesChecked,
//   scrape,
// } = require("./script");
// const express = require("express");
// const subjectLinks = require("./subjectLinks");

// const PORT = process.env.PORT || 5000;
// const app = express();
// app.set("view engine", "ejs");
// app.use(express.static("public"));

// const subjectsLeftToMark = Object.keys(subjectLinks).filter(
//   (subject) =>
//     !subjectsMarked.includes(subject) && !manuallyMarked.includes(subject)
// );

// app.get("/", (req, res) => {
//   res.render("index", {
//     main,
//     subjectLinks,
//     subjectsMarked,
//     manuallyMarked,
//     timesMarked,
//     timesChecked,
//     subjectsLeftToMark,
//   });
// });

// app.get("/scrape", (req, res) => {
//   scrape();
//   res.redirect("/");
// });

// main();
// app.listen(PORT);

process.env.NTBA_FIX_319 = 1;
const TelegramBot = require("node-telegram-bot-api");
const { scrape, main } = require("./script");
const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

bot.onText(/\/scrape/, () => {
  bot.sendMessage(process.env.CHAT_ID, "Scraping..");
  scrape(bot);
});

main(bot);
