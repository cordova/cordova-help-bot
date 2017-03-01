#!/usr/bin/env node

var Botkit = require('botkit');
var util = require('util');
var rp = require('request-promise');
var xml2js = require('xml2js');
var Promise = require('bluebird');
require('newrelic');

var controller = Botkit.slackbot({
    debug: false
});

// connect the bot to a stream of messages
var bot = controller.spawn({
    token: process.env.SLACK_TOKEN
});

function startRTM() {
    // start Slack RTM
    bot.startRTM(function(err, bot, payload) {
        if (err) {
            console.log('Failed to start RTM for bot1')
            return setTimeout(startRtm, 60000);
        }
        console.log("RTM started for bot1!");
    });

    if (process.env.SLACK_TOKEN_2) {
        var bot2 = controller.spawn({
            token: process.env.SLACK_TOKEN_2,
        });
        bot2.startRTM(function(err, bot, payload) {
            if (err) {
                console.log('Failed to start RTM for bot2')
                return setTimeout(startRtm, 60000);
            }
            console.log("RTM started for bot2!");
        });
    }
}

controller.on('rtm_close', function(bot, err) {
    startRTM();
});

startRTM();

// prepare the webhook
controller.setupWebserver(process.env.PORT || 3001, function(err, webserver) {
    controller.createWebhookEndpoints(webserver, bot, function() {
        // handle errors...
    });
});

// give the bot something to listen for.
controller.hears('hello', 'direct_message,direct_mention,mention', function(bot, message) {
    bot.reply(message, 'Hello yourself.');
});

// give the bot something to listen for.
controller.hears('help', 'direct_message,direct_mention,mention', function(bot, message) {
    bot.reply(message, 'Hello! I will expand any Cordova JIRA links in the form of CB-XXXX. Invite me to a channel, mention me in a message, or directly message me to see it in action.');
});


// give the bot something to listen for.
controller.hears('who are you', 'direct_message,direct_mention,mention', function(bot, message) {

    bot.identifyBot(function(err, identity) {
        // identity contains...
        // {name, id, team_id}
        bot.reply(message, util.format("I'm %s.", identity.name));
    })
});

function newJiraXmlPromise(key) {
    return new Promise(function(resolve, reject) {
        key = key.toUpperCase();
        rp(util.format('https://issues.apache.org/jira/si/jira.issueviews:issue-xml/%s/%s.xml', key, key))
            .then(function(xmlString) {
                xml2js.parseString(xmlString, function(err, result) {
                    if (err) {
                        var obj = { key: key, error: err };
                        resolve(obj);
                    } else {
                        var obj = {
                            key: key,
                            summary: result.rss.channel[0].item[0].summary[0],
                            status: result.rss.channel[0].item[0].status[0]._,
                            statusIconUrl: result.rss.channel[0].item[0].status[0].$.iconUrl,
                            resolution: result.rss.channel[0].item[0].resolution[0]._
                        };

                        resolve(obj);
                    }
                });
            })
            .catch(function(err) {
                var obj = { key: key, error: err };
                resolve(obj);
            });
    });
}

controller.hears('CB-[0-9]+', ['direct_message', 'direct_mention', 'mention', 'ambient'], function(bot, message) {

    var re = /(CB-[0-9]+)/gi;
    var result = message.text.match(re);

    if (result) {
        var promises = result
            .filter(function(elem, index, self) {  // remove duplicate keys
                return index == self.indexOf(elem); 
            })
            .map(function(elem) { // transform each element to a promise
                return newJiraXmlPromise(elem);
            });
        
        Promise.all(promises).then(function(values) {
            values = values.map(function(val) { // transform the objects to strings
                if (!val.err) {
                    var link = util.format('<https://issues.apache.org/jira/browse/%s|%s>', val.key, val.key);
                    return util.format('[%s, (%s, %s)] %s', link, val.status, val.resolution, val.summary);
                } else {
                    return util.format('[%s] %s', val.key, '*error: issue key not found in JIRA*')
                }
            });
            bot.reply(message, {
                text: values.join('\n'),
                username: "CordovaHelpBot",
                icon_emoji: ":gear:",
            });
        });
    }
});

// JIRA REST API, here "orientation" is being searched for. paged at 5, starting at 0. only showing link and summary fields
// https://issues.apache.org/jira/rest/api/2/search?jql=(summary%20~%20%22orientation%22%20OR%20description%20~%20%22orientation%22%20OR%20comment%20~%20%22orientation%22)%20AND%20project%20%3D%20CB%20AND%20resolution%20%3D%20Unresolved%20ORDER%20BY%20created&startAt=0&maxResults=5&fields=link,summary
