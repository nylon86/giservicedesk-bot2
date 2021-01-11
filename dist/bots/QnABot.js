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
Object.defineProperty(exports, "__esModule", { value: true });
const botbuilder_1 = require("botbuilder");
const botbuilder_ai_1 = require("botbuilder-ai");
const server_1 = require("../server");
/**
 * A simple bot that responds to utterances with answers from QnA Maker.
 * If an answer is not found for an utterance, the bot responds with help.
 */
const CONVERSATION_DATA_PROPERTY = 'conversationData';
const USER_PROFILE_PROPERTY = 'userProfile';
class QnABot extends botbuilder_1.ActivityHandler {
    /**
     *
     * @param {ConversationState} conversationState
     * @param {UserState} userState
     * @param {Dialog} dialog
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
        this.conversationReferences1 = conversationReferences;
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
            knowledgeBaseId: process.env.QnAKnowledgebaseId
        });
        // this.dispatchRecognizer = dispatchRecognizer;
        this.qnaMaker = qnaMaker;
        this.onMessage((context, next) => __awaiter(this, void 0, void 0, function* () {
            // Logger.log({ level: 'info', message: context.activity.text });
            console.log('Running dialog with Message Activity.');
            const userProfile = yield this.userProfileAccessor.get(context, {});
            const conversationData = yield this.conversationDataAccessor.get(context, { promptedForUserName: false });
            // Logger.log({ level: 'info', message: conversationData });
            // Logger.log({ level: 'info', message: userProfile });
            addConversationReference(context.activity);
            // Run the Dialog with the new message Activity.
            yield this.dialog.run(context, this.dialogState);
            server_1.Logger.log({ level: 'info', message: context.activity.text });
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
            server_1.Logger.log({ level: 'info', message: 'INIZIO MESSAGGIO' });
            server_1.Logger.log({ level: 'info', message: turnContext.activity.text });
            server_1.Logger.log({ level: 'info', message: 'FINE MESSAGGIO' });
            yield next();
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
}
exports.QnABot = QnABot;
module.exports.QnABot = QnABot;
//# sourceMappingURL=QnABot.js.map