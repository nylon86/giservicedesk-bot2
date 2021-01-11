import { ActivityHandler } from 'botbuilder';
import { QnAMaker } from 'botbuilder-ai';
export declare class QnABot extends ActivityHandler {
    conversationState: any;
    userState: any;
    dialog: any;
    dialogState: any;
    conversationReferences1: any;
    conversationDataAccessor: any;
    userProfileAccessor: any;
    qnaMaker: QnAMaker;
    /**
     *
     * @param {ConversationState} conversationState
     * @param {UserState} userState
     * @param {Dialog} dialog
     */
    constructor(conversationState: any, userState: any, dialog: any, conversationReferences: any);
}
