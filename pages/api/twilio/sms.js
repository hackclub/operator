const _ = require('lodash')
const http = require('http')
const express = require('express')
const AirtablePlus = require('airtable-plus')
const { WebClient: SlackWebClient } = require('@slack/web-api')
const MessagingResponse = require('twilio').twiml.MessagingResponse

const slack = new SlackWebClient(process.env.SLACK_BOT_TOKEN)
const botSpamId = 'C0P5NE354'

const userTable = new AirtablePlus({
    baseID: process.env.OPERATOR_AIRTABLE_BASE,
    apiKey: process.env.AIRTABLE_API_KEY,
    tableName: 'Users',
})

/* TODO: recieve msg from someone, desplay msg saying they're not signed up for operator after checking an airtable then send slack URL with number in it */

const generateTokenRequestURL = (phoneNumber) => {
  return 'https://slack.com/oauth/v2/authorize?scope=chat:write&client_id=2210535565.1220598825398&redirect_uri=https://operator-bot-hackclub.herokuapp.com/api/slack/authuser?phone=' + phoneNumber
}

export default async (req, res) => {
  console.log('Twilio Request Headers:', req.headers)
  console.log('Twilio Request Body:', req.body)
  const {
    Body: text,
    From: fromNumber,
    NumMedia: mediaCount = 0,
  } = req.body

  const twiml = new MessagingResponse()
  
  // Retrieve user record by number, in a way that safely returns null if no records found
  const user = [...await userTable.read({
    filterByFormula: `{Phone Number} = '${fromNumber}'`,
    maxRecords: 1
  }), null][0]

  if (!user) {
    console.log('No user record found for '+fromNumber)
    twiml.message('OMG I am soooo excited to connect you to the Hack Club Slack!! I don\'t recognize this number though… can you do me a favor and sign in here? ' + generateTokenRequestURL(fromNumber))

    res.writeHead(200, { 'Content-Type': 'text/xml' })
    return res.end(twiml.toString())
  }
  
  console.log('User Record: ', user)
  console.log('User Record Fields: ', user.fields)

  if (mediaCount) {
    // Lodash magic because Twilio adds all media URLs as 'MediaUrl0', 'MediaUrl1' etc
    const mediaUrls = _.map(_.range(mediaCount),
      v => req.body['MediaUrl' + v]
    )
  }

  /*
  const slackPostText = text
  
  const slackResponse = await slack.chat.postMessage({
    text: slackPostText,
    channel: botSpamId,
  })
  */

  return res.json({ ok: true })
}      