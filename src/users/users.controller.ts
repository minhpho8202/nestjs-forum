import { Controller, Get, UseGuards, Put, Body, Delete, ParseIntPipe, Query, UseInterceptors, UploadedFile, DefaultValuePipe, Patch } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { UpdateUserDTO } from './dto/update-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Action } from 'src/casl/action.enum';
import { PoliciesGuard } from 'src/casl/policies.guard';
import { CheckPolicies } from 'src/casl/ability.decorator';
import { User } from 'src/common/decorators/user.decorator';
import { CommonService } from 'src/common/services/common.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService,
    private readonly commonService: CommonService
  ) { }

  @ApiBearerAuth()
  @Get('profile')
  getProfile(@User() user: any) {
    return this.usersService.findOne(user.id);
  }

  @Get()
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability) => ability.can(Action.Manage, 'all'))
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('search') search?: string) {
    return this.usersService.findAll(page, search);
  }

  @Get('following-comunnities')
  getFollowingCommunities(@User() user: any) {
    return this.usersService.getFollowingCommunities(user.id);
  }

  @Patch()
  @UseInterceptors(FileInterceptor('image'))
  async update(@UploadedFile() image: Express.Multer.File, @User() user: any, @Body() updateUserDTO: UpdateUserDTO) {
    console.log(updateUserDTO);
    return this.usersService.update(user.id, updateUserDTO, image);
  }

  @Patch('active')
  toggleActiveStatus(@User() user: any) {
    return this.commonService.toggleStatus(user.id, 'user', 'isActived');
  }

  @Patch('delete')
  toggleDeleteStatus(@User() user: any) {
    return this.commonService.toggleStatus(user.id, 'user', 'isDeleted');
  }

}
