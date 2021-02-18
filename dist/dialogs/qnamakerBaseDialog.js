"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
exports.QnAMakerBaseDialog = void 0;
const botbuilder_ai_1 = require("botbuilder-ai");
// Default parameters
const DefaultThreshold = 0.3;
const DefaultTopN = 3;
const DefaultNoAnswer = 'Non ne ho idea';
// Card parameters
const DefaultCardTitle = 'Did you mean:';
const DefaultCardNoMatchText = 'None of the above.';
const DefaultCardNoMatchResponse = 'Thanks for the feedback.';
// / QnA Maker dialog.
const QNAMAKER_BASE_DIALOG = 'qnamaker-base-dailog';
/**
 * Componente che gestisce il dialogo con QNA
 */
class QnAMakerBaseDialog extends botbuilder_ai_1.QnAMakerDialog {
    /**
       * Core logic of QnA Maker dialog.
       * Costruttore con parametri della qna
       * @param {any} knowledgebaseId
       * @param {any} authkey
       * @param {any} host
       */
    constructor(knowledgebaseId, authkey, host) {
        const noAnswer = {};
        noAnswer.text = 'Mi dispiace ma non conosco la risposta a questa domanda';
        // var noAnswer = DefaultNoAnswer;
        const filters = [];
        super(knowledgebaseId, authkey, host, noAnswer, DefaultThreshold, DefaultCardTitle, DefaultCardNoMatchText, DefaultTopN, null, filters, QNAMAKER_BASE_DIALOG);
        this.id = QNAMAKER_BASE_DIALOG;
    }
}
exports.QnAMakerBaseDialog = QnAMakerBaseDialog;
module.exports.QnAMakerBaseDialog = QnAMakerBaseDialog;
module.exports.QNAMAKER_BASE_DIALOG = QNAMAKER_BASE_DIALOG;
module.exports.DefaultThreshold = DefaultThreshold;
module.exports.DefaultTopN = DefaultTopN;
module.exports.DefaultNoAnswer = DefaultNoAnswer;
module.exports.DefaultCardTitle = DefaultCardTitle;
module.exports.DefaultCardNoMatchText = DefaultCardNoMatchText;
module.exports.DefaultCardNoMatchResponse = DefaultCardNoMatchResponse;
//# sourceMappingURL=qnamakerBaseDialog.js.map