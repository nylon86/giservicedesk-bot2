"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MyLogger = void 0;
// import {Logger} from '../server';
class MyLogger {
    /**
       * Log an activity to the transcript.
       * @param {Activity} activity  being logged.
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