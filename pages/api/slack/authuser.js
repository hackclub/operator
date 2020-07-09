const _ = require('lodash')
const { WebClient: SlackWebClient } = require('@slack/web-api')
const AirtablePlus = require('airtable-plus')

const slack = new SlackWebClient(process.env.SLACK_BOT_TOKEN)
const botSpamId = 'C0P5NE354'

export default async (req, res) => {
  console.log('Slack Auth Request: ', req)
  console.log('Slack Auth Request URL: ', req.url)
  
  // Get query string from URL (and return empty string if none exists)
  const query = decodeURI([...req.url.split('?'), ''][1])
  
  if (query == '') return res.json({ok: false, error: 'No query string provided'})
  
  // Turn all query string parameters into an object
  const params = _.fromPairs(_.map(query.split('&'), v => v.split('=')))
  console.log('Auth Params: ', params)
  
  const {
    phone,
    code,
    state
  } = params
  
  const oauthRequest = {
    code,
    client_id: process.env.SLACK_CLIENT_ID,
    client_secret: process.env.SLACK_CLIENT_SECRET,
    redirect_uri: 'https://operator-bot-hackclub.herokuapp.com'+req.url
  }
  
  console.log('Sending OAuth access request to slack: ', oauthRequest)
  
  const result = await slack.oauth.v2.access(oauthRequest)
  console.log('sent code:', code, 'to slack and got back', result)
  
  return res.json({ok: true})
}