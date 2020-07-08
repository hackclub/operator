const _ = require('lodash')
const { SlackWebClient } = require('@slack/web-api')

const slack = new SlackWebClient(process.env.SLACK_BOT_TOKEN)
const botSpamId = 'C0P5NE354'

const generateTokenRequestURL = (userId) => {
  return 'https://slack.com/oauth/v2/authorize?scope=chat:write&client_id=2210535565.1220598825398&redirect_uri=https://operator-bot-hackclub.herokuapp.com/api/slack/authuser.js'
}


export default async (req, res) => {
  console.log('Request Body:', req.body)

  return res.json({ok: true})
}      