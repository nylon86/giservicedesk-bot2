"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
// index.js is used to setup and configure your bot
// Import required packages
// Import required bot services. See https://aka.ms/bot-services to learn more about the different parts of a bot.
const botbuilder_1 = require("botbuilder");
const dotenv = __importStar(require("dotenv"));
const path = __importStar(require("path"));
const restify = __importStar(require("restify"));
const winston = __importStar(require("winston"));
const winston_format_debug_1 = require("winston-format-debug");
const QnABot_1 = require("./bots/QnABot");
const rootDialog_1 = require("./dialogs/rootDialog");
const MyLogger_1 = require("./logger/MyLogger");
// Note: Ensure you have a .env file and include QnAMakerKnowledgeBaseId, QnAMakerEndpointKey and QnAMakerHost.
const ENV_FILE = path.join(__dirname, '..', '.env');
dotenv.config({ path: ENV_FILE });
exports.Logger = winston.createLogger({
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(winston.format.colorize({ message: true }), new winston_format_debug_1.DebugFormat({
                colorizeMessage: false // Already colored by `winston.format.colorize`.
            }))
        })
    ]
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
const logstore = new MyLogger_1.MyLogger();
const logActivity = new botbuilder_1.TranscriptLoggerMiddleware(logstore);
// Create adapter.
// See https://aka.ms/about-bot-adapter to learn more about adapters.
const adapter = new botbuilder_1.BotFrameworkAdapter({
    appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword,
    openIdMetadata: process.env.BotOpenIdMetadata
}).use(logActivity);
// Catch-all for errors.
const onTurnErrorHandler = (context, error) => __awaiter(void 0, void 0, void 0, function* () {
    // This check writes out errors to console log .vs. app insights.
    // NOTE: In production environment, you should consider logging this to Azure
    //       application insights.
    console.error(`\n [onTurnError] unhandled error: ${error}`);
    // Send a trace activity, which will be displayed in Bot Framework Emulator
    yield context.sendTraceActivity('OnTurnError Trace', `${error}`, 'https://www.botframework.com/schemas/error', 'TurnError');
    // Send a message to the user
    yield context.sendActivity('The bot encountered an error or bug.');
    yield context.sendActivity('To continue to run this bot, please fix the bot source code.');
});
adapter.onTurnError = onTurnErrorHandler;
// Define the state store for your bot. See https://aka.ms/about-bot-state to learn more about using MemoryStorage.
// A bot requires a state storage system to persist the dialog and user state between messages.
const memoryStorage = new botbuilder_1.MemoryStorage();
// Create conversation and user state with in-memory storage provider.
const conversationState = new botbuilder_1.ConversationState(memoryStorage);
const userState = new botbuilder_1.UserState(memoryStorage);
let endpointHostName = process.env.QnAEndpointHostName;
if (!endpointHostName.startsWith('https://')) {
    endpointHostName = 'https://' + endpointHostName;
}
if (!endpointHostName.includes('/v5.0') && !endpointHostName.endsWith('/qnamaker')) {
    endpointHostName = endpointHostName + '/qnamaker';
}
const conversationReferences = {};
// Create the main dialog.
const dialog = new rootDialog_1.RootDialog(process.env.QnAKnowledgebaseId, process.env.QnAAuthKey, endpointHostName);
// Create the bot's main handler.
const myBot = new QnABot_1.QnABot(conversationState, userState, dialog, conversationReferences);
// Listen for incoming requests.
server.post('/api/messages', (req, res) => {
    adapter.processActivity(req, res, (turnContext) => __awaiter(void 0, void 0, void 0, function* () {
        // Route the message to the bot's main handler.
        yield myBot.run(turnContext);
    }));
});
// Listen for Upgrade requests for Streaming.
server.on('upgrade', (req, socket, head) => {
    // Create an adapter scoped to this WebSocket connection to allow storing session data.
    const streamingAdapter = new botbuilder_1.BotFrameworkAdapter({
        appId: process.env.MicrosoftAppId,
        appPassword: process.env.MicrosoftAppPassword
    });
    // Set onTurnError for the BotFrameworkAdapter created for each connection.
    streamingAdapter.onTurnError = onTurnErrorHandler;
    streamingAdapter.useWebSocket(req, socket, head, (context) => __awaiter(void 0, void 0, void 0, function* () {
        // After connecting via WebSocket, run this logic for every request sent over
        // the WebSocket connection.
        yield myBot.run(context);
    }));
});
// Listen for incoming notifications and send proactive messages to users.
server.get('/api/notify', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    for (const conversationReference of Object.values(conversationReferences)) {
        yield adapter.continueConversation(conversationReference, (turnContext) => __awaiter(void 0, void 0, void 0, function* () {
            // If you encounter permission-related errors when sending this message, see
            // https://aka.ms/BotTrustServiceUrl
            yield turnContext.sendActivity('CiaoCiao');
        }));
    }
    res.setHeader('Content-Type', 'text/html');
    res.writeHead(200);
    res.write('<html><body><h1>Proactive messages have been sent.</h1></body></html>');
    res.end();
}));
// Listen for incoming custom notifications and send proactive messages to users.
server.post('/api/notify', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    for (const prop in req.body) {
        if (req.body[prop] != null) {
            const msg = req.body[prop];
            for (const conversationReference of Object.values(conversationReferences)) {
                yield adapter.continueConversation(conversationReference, (turnContext) => __awaiter(void 0, void 0, void 0, function* () {
                    // If you encounter permission-related errors when sending this message, see
                    // https://aka.ms/BotTrustServiceUrl
                    yield turnContext.sendActivity(msg);
                }));
            }
        }
    }
    res.setHeader('Content-Type', 'text/html');
    res.writeHead(200);
    res.write('Proactive messages have been sent.');
    res.end();
}));
//# sourceMappingURL=server.js.map