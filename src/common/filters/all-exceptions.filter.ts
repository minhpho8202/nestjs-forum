import { Catch, ArgumentsHost, HttpStatus, HttpException } from "@nestjs/common";
import { BaseExceptionFilter } from "@nestjs/core";
import { Request, Response } from 'express'
import { PrismaClientValidationError } from "@prisma/client/runtime/library";
import { MyLoggerService } from "src/my-logger/my-logger.service";

type MyResponseObj = {
    status: number,
    message: string,
    error?: string,
    path?: string,
    timestamp?: string,
};

@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {
    private readonly logger = new MyLoggerService(AllExceptionsFilter.name);

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        const myResponseObj: MyResponseObj = {
            status: 500,
            message: 'Internal Server Error',
        };

        if (exception instanceof HttpException) {
            myResponseObj.status = exception.getStatus();
            const exceptionResponse = exception.getResponse();

            if (typeof exceptionResponse === 'string') {
                myResponseObj.message = exceptionResponse;
            } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
                const { message, error } = exceptionResponse as Record<string, any>;
                myResponseObj.message = message || myResponseObj.message;
                myResponseObj.error = error;
            }
        } else if (exception instanceof PrismaClientValidationError) {
            myResponseObj.status = 422;
            myResponseObj.message = 'Validation Error';
            myResponseObj.error = exception.message.replaceAll(/\n/g, ' ');
        }

        response
            .status(myResponseObj.status)
            .json(myResponseObj);

        this.logger.error(
            `${myResponseObj.message} - Path: ${request.url}`,
            AllExceptionsFilter.name
        );

        super.catch(exception, host);
    }
}