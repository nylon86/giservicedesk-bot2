"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QnABot = void 0;
const AdaptiveCards = __importStar(require("adaptivecards"));
const ACData = __importStar(require("adaptivecards-templating"));
const botbuilder_1 = require("botbuilder");
const botbuilder_ai_1 = require("botbuilder-ai");
const BrowserCard = __importStar(require("../cards/card_payload_4_test.json"));
// import {Logger} from '../server';
/**
 * A simple bot that responds to utterances with answers from QnA Maker.
 * If an answer is not found for an utterance, the bot responds with help.
 */
const CONVERSATION_DATA_PROPERTY = 'conversationData';
const USER_PROFILE_PROPERTY = 'userProfile';
// const BrowserCard = require('../cards/card_payload_4.json');
class QnABot extends botbuilder_1.ActivityHandler {
    /**
     *
     * @param {any} conversationState
     * @param {any} userState
     * @param {any} dialog
     * @param {any} conversationReferences
     */
    constructor(conversationState, userState, dialog, conversationReferences) {
        super();
        if (!conversationState)
            throw new Error('[QnABot]: Missing parameter. conversationState is required');
        if (!userState)
            throw new Error('[QnABot]: Missing parameter. userState is required');
        if (!dialog)
            throw new Error('[QnABot]: Missing parameter. dialog is required');
        this.conversationState = conversationState;
        this.userState = userState;
        this.dialog = dialog;
        this.dialogState = conversationState.createProperty('DialogState');
        // this.conversationReferences1 = conversationReferences;
        this.conversationDataAccessor = conversationState.createProperty(CONVERSATION_DATA_PROPERTY);
        this.userProfileAccessor = userState.createProperty(USER_PROFILE_PROPERTY);
        // const dispatchRecognizer = new LuisRecognizer({
        //     applicationId: process.env.LuisAppId,
        //     endpointKey: process.env.LuisAPIKey,
        //     endpoint: `https://${process.env.LuisAPIHostName}.api.cognitive.microsoft.com`
        // }, {
        //     includeAllIntents: true,
        //     includeInstanceData: true
        // }, true);
        const qnaMaker = new botbuilder_ai_1.QnAMaker({
            endpointKey: process.env.QnAEndpointKey,
            host: process.env.QnAEndpointHostName,
            knowledgeBaseId: process.env.QnAKnowledgebaseId,
        });
        // this.dispatchRecognizer = dispatchRecognizer;
        this.qnaMaker = qnaMaker;
        // console.log(qnaMaker);
        this.onMessage((context, next) => __awaiter(this, void 0, void 0, function* () {
            // Logger.log({ level: 'info', message: context.activity.text });
            console.log('Running dialog with Message Activity.');
            // const userProfile = await this.userProfileAccessor.get(context, {});
            // const conversationData = await this.conversationDataAccessor.get(
            // context, {promptedForUserName: false},
            // );
            addConversationReference(context.activity);
            // Run the Dialog with the new message Activity.
            yield this.dialog.run(context, this.dialogState);
            // By calling next() you ensure that the next BotHandler is run.
            yield next();
        }));
        // If a new user is added to the conversation, send them a greeting message
        this.onMembersAdded((context, next) => __awaiter(this, void 0, void 0, function* () {
            const membersAdded = context.activity.membersAdded;
            for (const member of membersAdded) {
                if (member.id !== context.activity.recipient.id) {
                    yield context.sendActivity('Benvenuto nel servizio di assistenza del portale Zucchetti');
                }
            }
            // By calling next() you ensure that the next BotHandler is run.
            yield next();
        }));
        this.onTurn((turnContext, next) => __awaiter(this, void 0, void 0, function* () {
            if (turnContext.activity.type === botbuilder_1.ActivityTypes.Message) {
                const results = yield this.qnaMaker.getAnswers(turnContext);
                console.log('eccola!! -> ' + JSON.stringify(results));
                if (!results || results.length == 0) {
                    yield turnContext.sendActivity('Non lo so');
                }
                else if (this.checkIsCardAnswer(results)) {
                    yield turnContext.sendActivity({
                        // text: 'Hero Card',
                        attachments: [botbuilder_1.CardFactory.adaptiveCard(this.associaCard(results))],
                    });
                }
                else {
                    yield next();
                }
            }
            else {
                yield next();
            }
        }));
        this.onDialog((context, next) => __awaiter(this, void 0, void 0, function* () {
            // Save any state changes. The load happened during the execution of the Dialog.
            yield this.conversationState.saveChanges(context, false);
            yield this.userState.saveChanges(context, false);
            // By calling next() you ensure that the next BotHandler is run.
            yield next();
        }));
        function addConversationReference(activity) {
            const conversationReference = botbuilder_1.TurnContext.getConversationReference(activity);
            conversationReferences[conversationReference.conversation.id] = conversationReference;
        }
    }
    checkIsCardAnswer(results) {
        var _a;
        return ((_a = results[0].metadata[0]) === null || _a === void 0 ? void 0 : _a.value) == 'browser';
    }
    associaCard(results) {
        const template = new ACData.Template(BrowserCard);
        const context = {
            $root: JSON.parse(results[0].answer),
        };
        console.log('################# MODEL #####################');
        console.log(context);
        const cardPayload = template.expand(context);
        console.log('################# CARD PAYLOAD #####################');
        console.log(cardPayload.body[2].images);
        const adaptiveCard = new AdaptiveCards.AdaptiveCard();
        adaptiveCard.parse(cardPayload);
        return adaptiveCard;
    }
}
exports.QnABot = QnABot;
module.exports.QnABot = QnABot;
//# sourceMappingURL=QnABot.js.map