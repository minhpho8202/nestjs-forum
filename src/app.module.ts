import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PostsModule } from './posts/posts.module';
import { CommunitiesModule } from './communities/communities.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { CaslModule } from './casl/casl.module';
import { CommentsModule } from './comments/comments.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { SavedPostsModule } from './saved-posts/saved-posts.module';
import { VotesModule } from './votes/votes.module';
import { AuthGoogleModule } from './auth-google/auth-google.module';
import { CacheModule } from '@nestjs/cache-manager';
import { MyLoggerModule } from './my-logger/my-logger.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { MyLoggerService } from './my-logger/my-logger.service';
import { MailerModule } from '@nestjs-modules/mailer';

@Module({
  imports: [AuthModule,
    UsersModule,
    PrismaModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PostsModule,
    CommunitiesModule,
    CloudinaryModule,
    CaslModule,
    CommentsModule,
    SubscriptionsModule,
    SavedPostsModule,
    VotesModule,
    AuthGoogleModule,
    CacheModule.register({
      isGlobal: true,
    }),
    MyLoggerModule,
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: configService.get('MAIL_HOST'),
          port: configService.get('MAIL_PORT'),
          secure: false,
          auth: {
            user: configService.get('MAIL_USER'),
            pass: configService.get('MAIL_PASS'),
          },
        },
        defaults: {
          from: `"No Reply" <${configService.get('MAIL_FROM')}>`,
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
