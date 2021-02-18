import { Activity, TranscriptLogger } from 'botbuilder';
export declare class MyLogger implements TranscriptLogger {
    /**
       * Log an activity to the transcript.
       * @param {Activity} activity  being logged.
       */
    logActivity(activity: Activity): void | Promise<void>;
}
