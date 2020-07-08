const _ = require('lodash')
const { SlackWebClient: WebClient } = require('@slack/web-api')

const slack = new SlackWebClient(process.env.SLACK_BOT_TOKEN)
const botSpamId = 'C0P5NE354'

const generateTokenRequestURL = (userId) => {
  const scopes = ['chat:write', 'files:write']
  //https://slack.com/oauth/v2/authorize?scope=incoming-webhook,commands&client_id=3336676.569200954261
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