// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { ActivityHandler, TurnContext } from 'botbuilder';
import { QnAMaker } from 'botbuilder-ai';
import { Logger } from '..';
/**
 * A simple bot that responds to utterances with answers from QnA Maker.
 * If an answer is not found for an utterance, the bot responds with help.
 */
const CONVERSATION_DATA_PROPERTY = 'conversationData';
const USER_PROFILE_PROPERTY = 'userProfile';

export class QnABot extends ActivityHandler {
    public conversationState: any;
    public userState: any;
    public dialog: any;
    public dialogState: any;
    public conversationReferences1: any;
    public conversationDataAccessor: any;
    public userProfileAccessor: any;
    // public dispatchRecognizer: LuisRecognizer;
    public qnaMaker: QnAMaker;
    /**
     *
     * @param {ConversationState} conversationState
     * @param {UserState} userState
     * @param {Dialog} dialog
     */
    constructor(conversationState: any, userState: any, dialog: any, conversationReferences: any) {
        super();
        if (!conversationState) throw new Error('[QnABot]: Missing parameter. conversationState is required');
        if (!userState) throw new Error('[QnABot]: Missing parameter. userState is required');
        if (!dialog) throw new Error('[QnABot]: Missing parameter. dialog is required');

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

        const qnaMaker = new QnAMaker({
            knowledgeBaseId: process.env.QnAKnowledgebaseId,
            endpointKey: process.env.QnAEndpointKey,
            host: process.env.QnAEndpointHostName
        });

        // this.dispatchRecognizer = dispatchRecognizer;
        this.qnaMaker = qnaMaker;

        this.onMessage(async (context, next) => {
            // Logger.log({ level: 'info', message: context.activity.text });
            console.log('Running dialog with Message Activity.');
            const userProfile = await this.userProfileAccessor.get(context, {});
            const conversationData = await this.conversationDataAccessor.get(
                context, { promptedForUserName: false }
            );
            // Logger.log({ level: 'info', message: conversationData });
            // Logger.log({ level: 'info', message: userProfile });
            addConversationReference(context.activity);
            // Run the Dialog with the new message Activity.
            await this.dialog.run(context, this.dialogState);
            Logger.log({ level: 'info', message: context.activity.text });
            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });
        // If a new user is added to the conversation, send them a greeting message
        this.onMembersAdded(async (context, next) => {
            const membersAdded = context.activity.membersAdded;
            for (const member of membersAdded) {
                if (member.id !== context.activity.recipient.id) {
                    await context.sendActivity('Benvenuto nel servizio di assistenza del portale Zucchetti');
                }
            }

            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });
        this.onTurn(async (turnContext, next) => {
            Logger.log({ level: 'info', message: 'INIZIO MESSAGGIO' });
            Logger.log({ level: 'info', message: turnContext.activity.text });
            Logger.log({ level: 'info', message: 'FINE MESSAGGIO' });
            await next();
        });

        this.onDialog(async (context, next) => {
            // Save any state changes. The load happened during the execution of the Dialog.
            await this.conversationState.saveChanges(context, false);
            await this.userState.saveChanges(context, false);

            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });

        function addConversationReference(activity): void {
            const conversationReference = TurnContext.getConversationReference(activity);
            conversationReferences[conversationReference.conversation.id] = conversationReference;
        }
    }
}

module.exports.QnABot = QnABot;
