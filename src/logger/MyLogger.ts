import { Activity, TranscriptLogger } from 'botbuilder';
import { Logger } from '../server';

export class MyLogger implements TranscriptLogger {
    /**
     * Log an activity to the transcript.
     * @param activity Activity being logged.
     */
    public logActivity(activity: Activity): void | Promise<void> {
        if (!activity) { throw new Error('Activity is required.'); }

        // tslint:disable-next-line:no-console
        // console.log('Activity Log:', activity);
        if (activity.value && activity.value.queryResults) {
            for (const result of activity.value.queryResults) {
                console.log('RISULTATO QUERY:', result);

            }
        }
        // Logger.log({ level: 'info', message: activity });
    }
}
