// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

// index.js is used to setup and configure your bot

// Import required packages
// Import required bot services. See https://aka.ms/bot-services to learn more about the different parts of a bot.
import {BotFrameworkAdapter, ConversationState, MemoryStorage, TranscriptLoggerMiddleware, UserState} from 'botbuilder';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as restify from 'restify';
import * as winston from 'winston';
import {DebugFormat} from 'winston-format-debug';
import {QnABot} from './bots/QnABot';
import {RootDialog} from './dialogs/rootDialog';
import {MyLogger} from './logger/MyLogger';

// Note: Ensure you have a .env file and include QnAMakerKnowledgeBaseId, QnAMakerEndpointKey and QnAMakerHost.
const ENV_FILE = path.join(__dirname, '..', '.env');
dotenv.config({path: ENV_FILE});
export const Logger = winston.createLogger({
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
          winston.format.colorize({message: true}),
          new DebugFormat({
            colorizeMessage: false, // Already colored by `winston.format.colorize`.
          }),
      ),
    }),
  ],
});
// const localeTemplateManager: LocaleTemplateManager = new LocaleTemplateManager(localizedTemplates, botSettings.defaultLocale || 'it-it');

// Create HTTP server.
const server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, () => {
  console.log(`\n${server.name} listening to ${server.url}.`);
  console.log('\nGet Bot Framework Emulator: https://aka.ms/botframework-emulator');
  console.log('\nTo talk to your bot, open the emulator select "Open Bot"');
});
// configure middleware
const logstore = new MyLogger();
const logActivity = new TranscriptLoggerMiddleware(logstore);

// Create adapter.
// See https://aka.ms/about-bot-adapter to learn more about adapters.
const adapter = new BotFrameworkAdapter({
  appId: process.env.MicrosoftAppId,
  appPassword: process.env.MicrosoftAppPassword,
  openIdMetadata: process.env.BotOpenIdMetadata,
});

if (process.env.Logger=='True') {
  adapter.use(logActivity);
}


// Catch-all for errors.
const onTurnErrorHandler = async (context: any, error: any) => {
  // This check writes out errors to console log .vs. app insights.
  // NOTE: In production environment, you should consider logging this to Azure
  //       application insights.
  console.error(`\n [onTurnError] unhandled error: ${error}`);

  // Send a trace activity, which will be displayed in Bot Framework Emulator
  await context.sendTraceActivity(
      'OnTurnError Trace',
      `${error}`,
      'https://www.botframework.com/schemas/error',
      'TurnError',
  );

  // Send a message to the user
  await context.sendActivity('The bot encountered an error or bug.');
  await context.sendActivity('To continue to run this bot, please fix the bot source code.');
};
adapter.onTurnError = onTurnErrorHandler;
// Define the state store for your bot. See https://aka.ms/about-bot-state to learn more about using MemoryStorage.
// A bot requires a state storage system to persist the dialog and user state between messages.
const memoryStorage = new MemoryStorage();

// Create conversation and user state with in-memory storage provider.
const conversationState = new ConversationState(memoryStorage);
const userState = new UserState(memoryStorage);

let endpointHostName = process.env.QnAEndpointHostName;
if (!endpointHostName.startsWith('https://')) {
  endpointHostName = 'https://' + endpointHostName;
}

if (!endpointHostName.includes('/v5.0') && !endpointHostName.endsWith('/qnamaker')) {
  endpointHostName = endpointHostName + '/qnamaker';
}
const conversationReferences = {};

// Create the main dialog.
const dialog = new RootDialog(process.env.QnAKnowledgebaseId, process.env.QnAEndpointKey, endpointHostName);

// Create the bot's main handler.
const myBot = new QnABot(conversationState, userState, dialog, conversationReferences);

// Listen for incoming requests.
server.post('/api/messages', (req, res) => {
  adapter.processActivity(req, res, async (turnContext) => {
    // Route the message to the bot's main handler.
    await myBot.run(turnContext);
  });
});
// Listen for Upgrade requests for Streaming.
server.on('upgrade', (req, socket, head) => {
  // Create an adapter scoped to this WebSocket connection to allow storing session data.
  const streamingAdapter = new BotFrameworkAdapter({
    appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword,
  });
  // Set onTurnError for the BotFrameworkAdapter created for each connection.
  streamingAdapter.onTurnError = onTurnErrorHandler;

  streamingAdapter.useWebSocket(req, socket, head, async (context) => {
    // After connecting via WebSocket, run this logic for every request sent over
    // the WebSocket connection.
    await myBot.run(context);
  });
});

// Listen for incoming custom notifications and send proactive messages to users.
// server.post('/api/notify', async (req, res) => {
//   for (const prop in req.body) {
//     if (req.body[prop] != null) {
//       const msg = req.body[prop];
//       for (const conversationReference of Object.values(conversationReferences)) {
//         await adapter.continueConversation(conversationReference, async (turnContext) => {
//           // If you encounter permission-related errors when sending this message, see
//           // https://aka.ms/BotTrustServiceUrl
//           await turnContext.sendActivity(msg);
//         });
//       }
//     }
//   }
//   res.setHeader('Content-Type', 'text/html');
//   res.writeHead(200);
//   res.write('Proactive messages have been sent.');
//   res.end();
// });
