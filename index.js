#!/usr/bin/env node

var Botkit = require('botkit');
var util = require('util');
var rp = require('request-promise');
var xml2js = require('xml2js');

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

	var re = /(CB-[0-9]+)/gi;
	var result = message.text.match(re);
  // do something to respond to message
  // all of the fields available in a normal Slack message object are available
  // https://api.slack.com/events/message
  
  if (result) {
	  for (var i=0; i < result.length; ++i) {
		  (function(key) {
		   var link = util.format('<https://issues.apache.org/jira/browse/%s|%s>', key, key);
		   rp(util.format('https://issues.apache.org/jira/si/jira.issueviews:issue-xml/%s/%s.xml', key, key))
		       .then(function (xmlString) {
				   
				   
				  var parseString = xml2js.parseString;
				  parseString(xmlString, function (err, result) {
					  var summary = result.rss.channel[0].item[0].summary[0];
					  
				 	  bot.reply(message,{
						  	text: util.format('[%s] %s', link, summary),
				 	        username: "CordovaHelpBot",
				 	        icon_emoji: ":gear:",
				 	      });
					  
				  });
				   
		           // Process xml...
		       })
		       .catch(function (err) {
		           // Crawling failed...
		       });
		   })(result[i].toUpperCase());
	   }
  }
  

});
