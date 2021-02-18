import { StatePropertyAccessor, TurnContext } from 'botbuilder';
import { ComponentDialog, DialogState } from 'botbuilder-dialogs';
/**
 * Componente
 */
export declare class RootDialog extends ComponentDialog {
    /**
       * Root dialog for this bot.
       * @param {string} knowledgebaseId A QnAMaker service object.
       * @param {string} authkey A QnAMaker service object.
       * @param {string} host A QnAMaker service object.
       */
    constructor(knowledgebaseId: string, authkey: string, host: string);
    /**
       * The run method handles the incoming activity (in the form of a TurnContext)
       * and passes it through the dialog system.
       * If no dialog is active, it will start the default dialog.
       * @param {*} context
       * @param {*} accessor
       */
    run(context: TurnContext, accessor: StatePropertyAccessor<DialogState>): Promise<void>;
    private startInitialDialog;
}
