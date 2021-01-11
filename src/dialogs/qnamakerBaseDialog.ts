// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { Activity } from 'botbuilder';
import { QnAMakerDialog } from 'botbuilder-ai';

// Default parameters
const DefaultThreshold = 0.3;
const DefaultTopN = 3;
const DefaultNoAnswer = 'Non ne ho idea';

// Card parameters
const DefaultCardTitle = 'Did you mean:';
const DefaultCardNoMatchText = 'None of the above.';
const DefaultCardNoMatchResponse = 'Thanks for the feedback.';

/// QnA Maker dialog.
const QNAMAKER_BASE_DIALOG = 'qnamaker-base-dailog';

export class QnAMakerBaseDialog extends QnAMakerDialog {
    /**
     * Core logic of QnA Maker dialog.
     * @param {QnAMaker} qnaService A QnAMaker service object.
     */

    constructor(knowledgebaseId: any, authkey: any, host: any) {
        const noAnswer: Partial<Activity> = {};
        noAnswer.text = 'Mi dispiace ma non conosco la risposta a questa domanda';
        // var noAnswer = DefaultNoAnswer;
        const filters: any = [];
        super(knowledgebaseId, authkey, host, noAnswer as Activity, DefaultThreshold, DefaultCardTitle, DefaultCardNoMatchText,
            DefaultTopN, null, filters, QNAMAKER_BASE_DIALOG);
        this.id = QNAMAKER_BASE_DIALOG;
    }

}

module.exports.QnAMakerBaseDialog = QnAMakerBaseDialog;
module.exports.QNAMAKER_BASE_DIALOG = QNAMAKER_BASE_DIALOG;
module.exports.DefaultThreshold = DefaultThreshold;
module.exports.DefaultTopN = DefaultTopN;
module.exports.DefaultNoAnswer = DefaultNoAnswer;
module.exports.DefaultCardTitle = DefaultCardTitle;
module.exports.DefaultCardNoMatchText = DefaultCardNoMatchText;
module.exports.DefaultCardNoMatchResponse = DefaultCardNoMatchResponse;
