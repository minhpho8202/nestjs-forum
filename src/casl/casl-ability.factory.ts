import {
    AbilityBuilder,
    ExtractSubjectType,
    PureAbility,
} from '@casl/ability';
import { Injectable } from '@nestjs/common';
import { User, Post, Comment, Community, Subscription, Vote, SavedPost, UserNotification, UserRole } from '@prisma/client';
import { createPrismaAbility, PrismaQuery, Subjects } from '@casl/prisma';
import { Action } from './action.enum';

export type AppSubjects = 'all' | Subjects<{
    User: User;
    Post: Post;
    Comment: Comment;
    Community: Community;
    Subscription: Subscription;
    Vote: Vote;
    SavedPost: SavedPost;
    UserNotification: UserNotification;
}>;

export type AppAbility = PureAbility<[string, AppSubjects], PrismaQuery>;

@Injectable()
export class CaslAbilityFactory {
    createForUser(user: User) {
        const { can, cannot, build } = new AbilityBuilder<AppAbility>(createPrismaAbility);
        // console.log(user);

        if (user.role === UserRole.USER) {
            // console.log("role is user", user.id);
            can(Action.Read, 'User', { id: user.id });
            can(Action.Update, 'User', { id: user.id });
            can(Action.Delete, 'User', { id: user.id });
            can(Action.Update, 'Post', { userId: user.id });
            can(Action.Delete, 'Post', { userId: user.id });
            can(Action.Update, 'Community', { userId: user.id });
            can(Action.Delete, 'Community', { userId: user.id });
            can(Action.Update, 'Comment', { userId: user.id });
            can(Action.Delete, 'Comment', { userId: user.id });
            can(Action.Update, 'Vote', { userId: user.id });
            can(Action.Delete, 'Vote', { userId: user.id });
            can(Action.Update, 'Subscription', { userId: user.id });
            can(Action.Delete, 'Subscription', { userId: user.id });
            can(Action.Update, 'SavedPost', { userId: user.id });
            can(Action.Delete, 'SavedPost', { userId: user.id });
        }

        if (user.role === UserRole.ADMIN) {
            // console.log("role is admin", user.id);
            can(Action.Manage, 'all');
        }

        return build({
            detectSubjectType: item => item.constructor as ExtractSubjectType<Subjects<any>>,
        });
    }
}