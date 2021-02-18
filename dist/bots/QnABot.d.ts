import { ActivityHandler } from 'botbuilder';
import { QnAMaker } from 'botbuilder-ai';
export declare class QnABot extends ActivityHandler {
    conversationState: any;
    userState: any;
    dialog: any;
    dialogState: any;
    conversationDataAccessor: any;
    userProfileAccessor: any;
    qnaMaker: QnAMaker;
    /**
     *
     * @param {any} conversationState
     * @param {any} userState
     * @param {any} dialog
     * @param {any} conversationReferences
     */
    constructor(conversationState: any, userState: any, dialog: any, conversationReferences: any);
    private checkIsCardAnswer;
    private associaCard;
}
