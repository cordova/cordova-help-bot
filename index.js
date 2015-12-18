#!/usr/bin/env node

var Botkit = require('botkit');

var controller = Botkit.slackbot({
  debug: false
});

// connect the bot to a stream of messages
controller.spawn({
  token: 'xoxb-16969299168-wTDHL8El1Qnbz36eDe27OpIV',
}).startRTM()

// give the bot something to listen for.
controller.hears('hello','direct_message,direct_mention,mention',function(bot,message) {

  bot.reply(message,'Hello yourself.');

});

// give the bot something to listen for.
controller.hears('who is cordovahelpbot','direct_message,direct_mention,mention',function(bot,message) {

	bot.identifyBot(function(err,identity) {
	  // identity contains...
	  // {name, id, team_id}
	  bot.reply(message, "I'm me.");
	})
});

controller.hears('CB-[0-9]+',['direct_message','direct_mention','mention','ambient'],function(bot,message) {

	var re = /(CB-[0-9]+)/g;
	var result = message.text.match(re);
  // do something to respond to message
  // all of the fields available in a normal Slack message object are available
  // https://api.slack.com/events/message
  bot.reply(message,'You used a keyword!');
  
  for (var i=0; i < result.length; ++i) {
	  //bot.reply(message, '<' + 'https://issues.apache.org/jira/browse/' + result[i] + '|' + result[i] +'>');
	  //bot.reply(message, 'https://issues.apache.org/jira/browse/' + result[i]);
	  
	  bot.reply(message,{
	        text: '<' + 'https://issues.apache.org/jira/browse/' + result[i] + '|' + result[i] +'>',
	        username: "CordovaHelpBot",
	        icon_emoji: ":floppy_disk:",
	      });
  }

});
