import {
    CanActivate, ExecutionContext, Injectable, UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from 'src/common/decorators/public.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private jwtService: JwtService,
        private configService: ConfigService,
        private reflector: Reflector
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isPublic) {
            return true;
        }

        // Lấy request từ context
        const request = context.switchToHttp().getRequest();
        const token = this.extractToken(request);

        if (!token) {
            throw new UnauthorizedException('Token not provided');
        }

        try {
            // Xác minh token JWT
            const payload = await this.jwtService.verifyAsync(token, {
                secret: this.configService.get('ACCESS_TOKEN_SECRET'),
            });

            // Gắn payload vào request.user
            request['user'] = payload;
        } catch (err) {
            throw new UnauthorizedException('Invalid or expired token');
        }
        return true;
    }

    private extractToken(request: Request): string | undefined {
        const authHeader = request.headers.authorization;
        if (authHeader) {
            const [type, token] = authHeader.split(' ');
            if (type === 'Bearer' && token) {
                return token;
            }
        }
        console.log(request.cookies['at']);

        if (request.cookies && request.cookies['at']) {
            return request.cookies['at'];
        }

        return undefined;
    }
}
