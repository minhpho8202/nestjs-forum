import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { CaslModule } from 'src/casl/casl.module';
import { CommonService } from 'src/common/services/common.service';

@Module({
  imports: [CloudinaryModule, CaslModule],
  controllers: [PostsController],
  providers: [PostsService, CommonService],
})
export class PostsModule { }
