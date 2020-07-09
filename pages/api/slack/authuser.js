const _ = require('lodash')
const { WebClient: SlackWebClient } = require('@slack/web-api')
const AirtablePlus = require('airtable-plus')

const slack = new SlackWebClient(process.env.SLACK_BOT_TOKEN)
const botSpamId = 'C0P5NE354'

export default async (req, res) => {
  console.log('Slack Auth Request URL: ', req.url)
  
  // Get query string from URL (and return empty string if none exists)
  const query = decodeURI([...req.url.split('?'), ''][1])
  
  if (query == '') return res.json({ok: false, error: 'No query string provided'})
  
  // Turn all query string parameters into an object
  const params = _.fromPairs(_.map(query.split('&'), v => v.split('=')))

  const {
    phone,
    code,
    state
  } = params
  
  console.log('Auth Params: ', params)

  return res.json({ok: true})
}      