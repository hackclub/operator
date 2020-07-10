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
  //console.log('Slack Auth Request: ', req)
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

  let user = [...await userTable.read({
    filterByFormula: `{SMS Auth Request Token} = '${state}'`,
    maxRecords: 1
  }), null][0]

  if (!user) {
    console.log('\'state\' param in authorization link does not match any of our SMS authorization requests')
    return res.json({error: 'This authorization link does not match any of our SMS authorization requests!'})
  }
  
  const oauthRequest = {
    code,
    client_id: process.env.SLACK_CLIENT_ID,
    client_secret: process.env.SLACK_CLIENT_SECRET,
    redirect_uri: 'https://operator-bot-hackclub.herokuapp.com/api/slack/authuser'
  }

  console.log('Sending OAuth access request to slack: ', oauthRequest)
  
  let slackOauthData
  
  try {
    slackOauthData = await slack.oauth.v2.access(oauthRequest)
  } catch (err) {
    return res.json({
      error: 'Slack did not like this authorization request. They had this to say about it:\n\n' + err.message
    })
  }
  
  console.log('sent oauth access request code:', code, 'to slack and got back', slackOauthData)
  
  user = await userTable.update(user.id, {
    'Slack ID': slackOauthData.authed_user.id,
    'Slack Token': slackOauthData.access_token,
    'Slack Token Scopes': slackOauthData.response_metadata.scopes.join(', ')
  })
  
  console.log('Successfully updated user:', user)

  return res.json({message: 'Thanks for authorizing!!! Text Operator again to post in slack :)'})
}