# Moodle Attendance Automation

- nodeJs script to automate the attendance marking in Moodle and get updates in Telegram.
  Useful if you attend classes but forgets to mark attendance on Moodle for the subject every hour.
- Also includes a Dashboard url to see attendance statistics for each day. Check screnshots [here](./Screenshots/Dashboard.png)

## Steps to Run

- Create a `.env` file similar to the example file in the root directory which contains your credentials
- Update the subjectLinks.js file with the names and urls for your course subjects
- Install dependencies using `npm install`
- run server using `npm start`
- Host the server on heroku or any other platform of your choice and set up a cron job using [cron-job.org](https://cron-job.org/) to ping the `<HEROKU_BASE_URL>/scrape` url every 30 minutes from morning till evening
- Get notified on Telegram for every succesfull marking or in case some error occurred.

## Credits

https://github.com/puppeteer/puppeteer/

## Development

- When running locally, if you want to see the output of automation in progress, comment out [this line](https://github.com/aldrinjenson/moodle-automation/blob/29c8011868da073bd405ce2d2cbd72cfb0a22e62/script.js#L134) to have puppeteer run without headless mode. You can change it back before deploying.

## Contributing

There are some minor bugs in the UI for the attendance Dashboard and for giving custom commands to control the scraping through the Telegram bot(Attendance marking works fine though). If you are familiar with nodeJs and are interested to improve the project further, PRs are welcome.
