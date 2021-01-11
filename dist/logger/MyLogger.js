"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class MyLogger {
    /**
     * Log an activity to the transcript.
     * @param activity Activity being logged.
     */
    logActivity(activity) {
        if (!activity) {
            throw new Error('Activity is required.');
        }
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
exports.MyLogger = MyLogger;
//# sourceMappingURL=MyLogger.js.map