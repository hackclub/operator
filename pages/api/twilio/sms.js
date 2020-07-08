const _ = require('lodash')
const { WebClient: SlackWebClient } = require('@slack/web-api')
const slack = new SlackWebClient(process.env.SLACK_BOT_TOKEN)
const botSpamId = 'C0P5NE354'
const http = require('http');
const express = require('express');
const MessagingResponse = require('twilio').twiml.MessagingResponse;

 (req, res) => {
  const twiml = new MessagingResponse();

  twiml.message('hello');

  res.writeHead(200, {'Content-Type': 'text/xml'});
  res.end(twiml.toString());
};

/* TODO: recieve msg from someone, desplay msg saying they're not signed up for operator after checking an airtable then send slack URL with number in it */ 

const generateTokenRequestURL = (phoneNumber) => {
  return 'https://slack.com/oauth/v2/authorize?scope=chat:write&client_id=2210535565.1220598825398&redirect_uri=https://operator-bot-hackclub.herokuapp.com/api/slack/authuser?phone='+phoneNumber
}

export default async (req, res) => {
  console.log('Request Body:', req.body)
  const {
    text: Body,
    fromNumber: From,
    mediaCount: NumMedia = 0,
  } = req.body
  
  if (mediaCount) {
    // Lodash magic because Twilio adds all media URLs as 'MediaUrl0', 'MediaUrl1' etc
    const mediaUrls = _.map(_.range(mediaCount),
      v => req.body['MediaUrl'+v]
    )
    
  }
  
  const slackPostText = text
  
  const slackResponse = await slack.chat.postMessage({
    text: slackPostText,
    channel: botSpamId,
  });
  
    
  return res.json({ok: true})
}      