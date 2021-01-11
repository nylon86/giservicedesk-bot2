// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { StatePropertyAccessor, TurnContext } from 'botbuilder';
import {
    ComponentDialog,
    DialogSet,
    DialogState,
    DialogTurnStatus,
    WaterfallDialog
} from 'botbuilder-dialogs';

import {
    QnAMakerBaseDialog
} from './qnamakerBaseDialog';

const INITIAL_DIALOG = 'initial-dialog';
const ROOT_DIALOG = 'root-dialog';
const QNAMAKER_BASE_DIALOG = 'qnamaker-base-dailog';

export class RootDialog extends ComponentDialog {
    /**
     * Root dialog for this bot.
     * @param {QnAMaker} qnaService A QnAMaker service object.
     */
    constructor(knowledgebaseId: string, authkey: string, host: string) {
        super(ROOT_DIALOG);
        // Initial waterfall dialog.
        this.addDialog(new WaterfallDialog(INITIAL_DIALOG, [
            this.startInitialDialog.bind(this)
        ]));
        this.addDialog(new QnAMakerBaseDialog(knowledgebaseId, authkey, host));
        this.initialDialogId = INITIAL_DIALOG;

    }

    /**
     * The run method handles the incoming activity (in the form of a TurnContext) and passes it through the dialog system.
     * If no dialog is active, it will start the default dialog.
     * @param {*} turnContext
     * @param {*} accessor
     */
    public async run(context: TurnContext, accessor: StatePropertyAccessor<DialogState>) {
        const dialogSet = new DialogSet(accessor);
        dialogSet.add(this);

        const dialogContext = await dialogSet.createContext(context);
        const results = await dialogContext.continueDialog();
        if (results.status === DialogTurnStatus.empty) {
            await dialogContext.beginDialog(this.id);
        }
    }

    // This is the first step of the WaterfallDialog.
    // It kicks off the dialog with the QnA Maker with provided options.
    private async startInitialDialog(step: { beginDialog: (arg0: string) => any; }) {

        return await step.beginDialog(QNAMAKER_BASE_DIALOG);
    }
}

module.exports.RootDialog = RootDialog;
