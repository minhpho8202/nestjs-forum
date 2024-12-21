import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { CommunitiesService } from './communities.service';
import { CreateCommunityDto } from './dto/create-community.dto';
import { UpdateCommunityDto } from './dto/update-community.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { User } from 'src/common/decorators/user.decorator';
import { CommonService } from 'src/common/services/common.service';

@Controller('communities')
export class CommunitiesController {
  constructor(private readonly communitiesService: CommunitiesService,
    private readonly commonService: CommonService
  ) { }

  @Post()
  create(@Body() createCommunityDto: CreateCommunityDto, @User() user: any) {
    return this.communitiesService.create(createCommunityDto, user.sub);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.communitiesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateCommunityDto: UpdateCommunityDto, @User() user: any) {
    return this.communitiesService.update(id, updateCommunityDto, user.id);
  }

  @Patch(':id/delete')
  toggleDeleteStatus(@Param('id', ParseIntPipe) id: number) {
    return this.commonService.toggleStatus(id, 'community', 'isDeleted');
  }

  @Patch(':id/active')
  toggleActiveStatus(@Param('id', ParseIntPipe) id: number) {
    return this.commonService.toggleStatus(id, 'community', 'isActived');
  }
}
