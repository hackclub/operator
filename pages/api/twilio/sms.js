const _ = require('lodash')
const http = require('http')
const express = require('express')
const FormData = require('form-data')
const AirtablePlus = require('airtable-plus')
const { WebClient: SlackWebClient } = require('@slack/web-api')
const MessagingResponse = require('twilio').twiml.MessagingResponse

const slack = new SlackWebClient(process.env.SLACK_BOT_TOKEN)
const botSpamId = 'C0P5NE354'

const userTable = new AirtablePlus({
  baseID: process.env.OPERATOR_AIRTABLE_BASE,
  apiKey: process.env.AIRTABLE_API_KEY,
  tableName: 'Users'
})

const generateTokenRequestUrl = (token) =>
  'https://slack.com/oauth/v2/authorize?user_scope=chat:write,files:write&client_id=2210535565.1220598825398&state=' + token

export default async (req, res) => {
  console.log('Twilio Request Headers:', req.headers)
  console.log('Twilio Request Body:', req.body)
  const {
    Body: text,
    From: fromNumber,
    NumMedia: mediaCount = 0,
  } = req.body

  const twiml = new MessagingResponse()
  
  console.log('Retrieving user for number ' + fromNumber)
  let user = await userTable.read({
    filterByFormula: `{Phone Number} = '${fromNumber}'`,
    maxRecords: 1
  })
  if (user.length > 0) user = user[0]
  
  const newToken = () => _.join(_.map(_.range(8), () => _.random(0, 9)), '')
  
  if (!user || user.fields['Test Auth Flow'] || !user.fields['Slack Token']) {
    const smsAuthRequestToken = newToken()
    const tokenRequestUrl = generateTokenRequestUrl(smsAuthRequestToken)
    
    if (!user) {
      console.log(`No user record found for ${fromNumber}.`)
      
      user = await userTable.create({
        'Phone Number': fromNumber,
        'SMS Auth Request Token': smsAuthRequestToken
      })
      
      console.log('Created a new user:', user)
      twiml.message('OMG I am soooo excited to connect you to the Hack Club Slack!! I don’t recognize this number though… can you do me a favor and sign in here?' + tokenRequestUrl)
      twiml.message('i’m the operator, btw. My real name is Lucille but you can just call me Operator :)')
    }
    else {
      if (user.fields['Test Auth Flow'])
        console.log(`Testing auth flow for existing number ${fromNumber}`)
      else
        console.log(`Creating new auth link for existing number ${fromNumber}`)
      
      user = await userTable.update(user.id, {
        'SMS Auth Request Token': smsAuthRequestToken
      })
      
      console.log('User is now updated to:', user)
      twiml.message('Oh hey it’s you again!!')
      twiml.message('Sorry I don’t think you signed in yet!\nyou can do that here:\n' + tokenRequestUrl)
    }

    res.writeHead(200, { 'Content-Type': 'text/xml' })
    return res.end(twiml.toString())
  }
  
  console.log('User Record: ', user)
  
  const {
    'Slack Token': userToken,
    'Slack ID': userId,
    'Name': userName
  } = user.fields
  
  let slackPostText = text
  let slackResponse = null

  if (mediaCount) {
    // Lodash magic because Twilio adds all media URLs as 'MediaUrl0', 'MediaUrl1' etc
    const mediaUrls = _.map(_.range(mediaCount),
      v => req.body['MediaUrl' + v]
    )
    console.log('Extracted media URLs: ', mediaUrls)
    
    const mediaTypes = _.map(mediaUrls, v => v.split('.')[1])
    console.log('Extracted media types: ', mediaTypes)
    
    const fetchFile = url => fetch(url).then(res => res.arrayBuffer())

    const mediaBuffers = await Promise.all(_.map(mediaUrls, fetchFile))
    console.log('All media buffers fetched')
    
    const uploadFile = async (file, index) => {
      const fileName = 'file_' + index
      const fileType = mediaTypes[index]

      const form = new FormData()
      form.append('token', userToken)
      form.append('filename', fileName)
      form.append('filetype', fileType)
      form.append('file', file, {
        filename: `${fileName}.${fileType}`
      })

      return await fetch('https://slack.com/api/files.upload', {
        method: 'POST',
        body: form
      })
        .then(r => r.json())
    }

    const slackMediaResponses = await Promise.all(_.map(slackMediaUrls, uploadFile))
  }
  
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
