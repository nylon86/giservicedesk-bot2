import { ComponentDialog } from 'botbuilder-dialogs';
export declare class RootDialog extends ComponentDialog {
    /**
     * Root dialog for this bot.
     * @param {QnAMaker} qnaService A QnAMaker service object.
     */
    constructor(knowledgebaseId: any, authkey: any, host: any);
    /**
     * The run method handles the incoming activity (in the form of a TurnContext) and passes it through the dialog system.
     * If no dialog is active, it will start the default dialog.
     * @param {*} turnContext
     * @param {*} accessor
     */
    run(context: any, accessor: any): Promise<void>;
    startInitialDialog(step: any): Promise<any>;
}
