import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { CaslModule } from 'src/casl/casl.module';
import { CommonService } from 'src/common/services/common.service';

@Module({
  imports: [CloudinaryModule, CaslModule],
  controllers: [UsersController],
  providers: [UsersService, CommonService],
})
export class UsersModule { }
