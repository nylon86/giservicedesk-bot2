import { QnAMakerDialog } from 'botbuilder-ai';
export declare class QnAMakerBaseDialog extends QnAMakerDialog {
    /**
     * Core logic of QnA Maker dialog.
     * @param {QnAMaker} qnaService A QnAMaker service object.
     */
    constructor(knowledgebaseId: any, authkey: any, host: any);
}
