import { Injectable, ConsoleLogger } from '@nestjs/common';
import * as fs from 'fs';
import { promises as fsPromises } from 'fs'
import * as path from 'path'

@Injectable()
export class MyLoggerService extends ConsoleLogger {
    async logToFile(entry) {
        const formattedEntry = `${Intl.DateTimeFormat('en-GB', {
            dateStyle: 'short',
            timeStyle: 'short',
            timeZone: 'UTC',
        }).format(new Date())}\t${entry}\n`;

        try {
            if (!fs.existsSync(path.join(__dirname, '..', '..', 'logs'))) {
                await fsPromises.mkdir(path.join(__dirname, '..', '..', 'logs'));
            }
            await fsPromises.appendFile(path.join(__dirname, '..', '..', 'logs', 'myLogFile.log'), formattedEntry);
        } catch (e) {
            if (e instanceof Error) console.error(e.message);
        }
    }

    log(message: any, context?: string) {
        const formattedMessage = typeof message === 'object' ? JSON.stringify(message) : message;
        const entry = `${context}\t${formattedMessage}`;
        this.logToFile(entry);
        super.log(formattedMessage, context);
    }

    error(message: any, stackOrContext?: string) {
        const formattedMessage = typeof message === 'object' ? JSON.stringify(message) : message;
        const entry = `${stackOrContext}\t${formattedMessage}`;
        this.logToFile(entry);
        super.error(formattedMessage, stackOrContext);
    }
}