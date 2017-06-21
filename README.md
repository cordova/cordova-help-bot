# cordova-help-bot
Help bot for Apache Cordova

This is currently running in the [Cordova Slack](http://slack.cordova.io).

Whenever a token in the form of CB-XXXX is mentioned, and the bot is present in the channel, it will grab the issue summary, resolution status, and issue status from JIRA and respond.

The bot can connect to up to two Slack teams.

Set these environment variables:
1. SLACK_TOKEN
2. SLACK_TOKEN_2

# Usage

    npm install
    npm start
