import { QnAMakerDialog } from 'botbuilder-ai';
/**
 * Componente che gestisce il dialogo con QNA
 */
export declare class QnAMakerBaseDialog extends QnAMakerDialog {
    /**
       * Core logic of QnA Maker dialog.
       * Costruttore con parametri della qna
       * @param {any} knowledgebaseId
       * @param {any} authkey
       * @param {any} host
       */
    constructor(knowledgebaseId: any, authkey: any, host: any);
}
