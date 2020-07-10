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

const generateTokenRequestURL = (token) => {
  return 'https://slack.com/oauth/v2/authorize?user_scope=chat:write&client_id=2210535565.1220598825398&state=' + token
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
  
  if (!user || user.fields['Test Auth Flow']) {
    let smsAuthRequestToken
    
    if (!user) {
      smsAuthRequestToken = Math.random().toString().split('.')[1]
      console.log(`No user record found for ${fromNumber}. Generating new user number record with code ${slackAuthRequestToken}`)
      
      const result = await userTable.create({
        'Phone Number': fromNumber,
        'SMS Auth Request Token': smsAuthRequestToken
      })
    }
    else {
      console.log(`Testing auth flow for existing number ${fromNumber}`)
      smsAuthRequestToken = user.fields['SMS Auth Request Token']
    }
    
    twiml.message('OMG I am soooo excited to connect you to the Hack Club Slack!! I don\'t recognize this number though… can you do me a favor and sign in here? ' + generateTokenRequestURL(smsAuthRequestToken))

    res.writeHead(200, { 'Content-Type': 'text/xml' })
    return res.end(twiml.toString())
  }
  
  console.log('User Record: ', user)
  
  const {
    'Slack Token': userToken,
    'Slack ID': userId,
    'Name': userName
  } = user.fields

  if (mediaCount) {
    // Lodash magic because Twilio adds all media URLs as 'MediaUrl0', 'MediaUrl1' etc
    const mediaUrls = _.map(_.range(mediaCount),
      v => req.body['MediaUrl' + v]
    )
  }
  
  const slackPostText = text
  let slackResponse = null
  
  try {
    slackResponse = await slack.chat.postMessage({
      text: slackPostText,
      channel: botSpamId,
      token: userToken
    })
  } catch (err) {
    console.log(`Sorry ${userName}, posting your message to slack returned an error: `, err)
    twiml.message(`Sorry ${userName}, posting your message to slack returned an error:\n\n`, err)
    res.writeHead(200, { 'Content-Type': 'text/xml' })
    return res.end(twiml.toString())
  }
  
  twiml.message('ok i posted ur msg to slack!')
  res.writeHead(200, { 'Content-Type': 'text/xml' })
  return res.end(twiml.toString())
}      