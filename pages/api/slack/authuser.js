const _ = require('lodash')
const { WebClient: SlackWebClient } = require('@slack/web-api')
const AirtablePlus = require('airtable-plus')

const slack = new SlackWebClient(process.env.SLACK_BOT_TOKEN)
const botSpamId = 'C0P5NE354'

const userTable = new AirtablePlus({
    baseID: process.env.OPERATOR_AIRTABLE_BASE,
    apiKey: process.env.AIRTABLE_API_KEY,
    tableName: 'Users',
})

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
    code,
    state
  } = params

  const user = [...await userTable.read({
    filterByFormula: `{SMS Auth Request Token} = '${state}'`,
    maxRecords: 1
  }), null][0]

  if (!user) {
    console.log('user does not have correct state in request')
    return res.json({error: 'This authorization link does not match any of our SMS authorization requests!'})
  }
  
  const oauthRequest = {
    code,
    client_id: process.env.SLACK_CLIENT_ID,
    client_secret: process.env.SLACK_CLIENT_SECRET,
    redirect_uri: 'https://operator-bot-hackclub.herokuapp.com/api/slack/authuser'
  }

  console.log('Sending OAuth access request to slack: ', oauthRequest)
  
  const result = await slack.oauth.v2.access(oauthRequest)
  
  console.log('sent code:', code, 'to slack and got back', result)
  
  const updateUser = await userTable.update(user.id, {
    'Slack Token': result.authed_user.access_token,
    'Slack Token Scopes': result.authed_user.scope,
    'Slack ID': result.authed_user.id
  })

  return res.json({ok: true})
}