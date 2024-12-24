import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
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
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
