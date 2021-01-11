import { StatePropertyAccessor, TurnContext } from 'botbuilder';
import { ComponentDialog, DialogState } from 'botbuilder-dialogs';
export declare class RootDialog extends ComponentDialog {
    /**
     * Root dialog for this bot.
     * @param {QnAMaker} qnaService A QnAMaker service object.
     */
    constructor(knowledgebaseId: string, authkey: string, host: string);
    /**
     * The run method handles the incoming activity (in the form of a TurnContext) and passes it through the dialog system.
     * If no dialog is active, it will start the default dialog.
     * @param {*} turnContext
     * @param {*} accessor
     */
    run(context: TurnContext, accessor: StatePropertyAccessor<DialogState>): Promise<void>;
    private startInitialDialog;
}
