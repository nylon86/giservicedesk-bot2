import * as AdaptiveCards from 'adaptivecards';
import * as ACData from 'adaptivecards-templating';
import {ActivityHandler, ActivityTypes, CardFactory, TurnContext} from 'botbuilder';
import {QnAMaker, QnAMakerResult} from 'botbuilder-ai';
import * as BrowserCard from '../cards/card_payload_4_test.json';
// import {Logger} from '../server';
/**
 * A simple bot that responds to utterances with answers from QnA Maker.
 * If an answer is not found for an utterance, the bot responds with help.
 */
const CONVERSATION_DATA_PROPERTY = 'conversationData';
const USER_PROFILE_PROPERTY = 'userProfile';
// const BrowserCard = require('../cards/card_payload_4.json');

export class QnABot extends ActivityHandler {
    public conversationState: any;
    public userState: any;
    public dialog: any;
    public dialogState: any;
    // public conversationReferences1: any;
    public conversationDataAccessor: any;
    public userProfileAccessor: any;
    // public dispatchRecognizer: LuisRecognizer;
    public qnaMaker: QnAMaker;
    /**
     *
     * @param {any} conversationState
     * @param {any} userState
     * @param {any} dialog
     * @param {any} conversationReferences
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

      const qnaMaker = new QnAMaker({
        endpointKey: process.env.QnAEndpointKey,
        host: process.env.QnAEndpointHostName,
        knowledgeBaseId: process.env.QnAKnowledgebaseId,
      });

      // this.dispatchRecognizer = dispatchRecognizer;
      this.qnaMaker = qnaMaker;
      // console.log(qnaMaker);
      this.onMessage(async (context, next) => {
        // Logger.log({ level: 'info', message: context.activity.text });
        console.log('Running dialog with Message Activity.');
        // const userProfile = await this.userProfileAccessor.get(context, {});
        // const conversationData = await this.conversationDataAccessor.get(
        // context, {promptedForUserName: false},
        // );
        addConversationReference(context.activity);
        // Run the Dialog with the new message Activity.
        await this.dialog.run(context, this.dialogState);

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
        if (turnContext.activity.type === ActivityTypes.Message) {
          const results = await this.qnaMaker.getAnswers(turnContext);
          console.log('eccola!! -> ' + JSON.stringify(results));
          if (!results || results.length == 0) {
            await turnContext.sendActivity('Non lo so');
          } else if (this.checkIsCardAnswer(results)) {
            await turnContext.sendActivity({
              // text: 'Hero Card',
              attachments: [CardFactory.adaptiveCard(this.associaCard(results))],
            });
          } else {
            await next();
          }
        } else {
          await next();
        }
      });

      this.onDialog(async (context, next) => {
        // Save any state changes. The load happened during the execution of the Dialog.
        await this.conversationState.saveChanges(context, false);
        await this.userState.saveChanges(context, false);
        // By calling next() you ensure that the next BotHandler is run.
        await next();
      });

      function addConversationReference(activity: any): void {
        const conversationReference = TurnContext.getConversationReference(activity);
        conversationReferences[conversationReference.conversation.id] = conversationReference;
      }
    }

    private checkIsCardAnswer(results: QnAMakerResult[]) :boolean {
      return results[0].metadata[0]?.value == 'browser';
    }
    private associaCard(results: QnAMakerResult[]): AdaptiveCards.AdaptiveCard {
      const templatePayload = BrowserCard;
      const template = new ACData.Template(templatePayload);
      // Expand the template with your `$root` data object.
      // This binds it to the data and produces the final Adaptive Card payload
      const cardPayload = template.expand({
        $root: {
          name: results[0].answer,
        },
      });

      // OPTIONAL: Render the card (requires that the adaptivecards library be loaded)
      const adaptiveCard = new AdaptiveCards.AdaptiveCard();
      adaptiveCard.parse(cardPayload);
      return adaptiveCard;
    }
}

module.exports.QnABot = QnABot;
