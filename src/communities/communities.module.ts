import { Module } from '@nestjs/common';
import { CommunitiesService } from './communities.service';
import { CommunitiesController } from './communities.controller';
import { CommonService } from 'src/common/services/common.service';

@Module({
  controllers: [CommunitiesController],
  providers: [CommunitiesService, CommonService],
})
export class CommunitiesModule { }
