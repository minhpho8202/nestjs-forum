import { Module } from '@nestjs/common';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { CommonService } from 'src/common/services/common.service';

@Module({
  imports: [CloudinaryModule],
  controllers: [CommentsController],
  providers: [CommentsService, CommonService]
})
export class CommentsModule { }
