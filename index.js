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
controller.hears('who are you','direct_message,direct_mention,mention',function(bot,message) {

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
  var replyText = '';
  
  for (var i=0; i < result.length; ++i) {
       replyText+= '<' + 'https://issues.apache.org/jira/browse/' + result[i] + '|' + result[i] +'>\n';
	  
  }
  
  if (replyText !== '') {
	  bot.reply(message,{
		  pretext: 'Links from Apache Cordova JIRA',
		  	text: replyText,
	        username: "CordovaHelpBot",
	        icon_emoji: ":gear:",
	      });
  	
  }
  
  

});
