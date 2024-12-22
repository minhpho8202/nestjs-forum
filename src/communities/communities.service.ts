import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCommunityDto } from './dto/create-community.dto';
import { UpdateCommunityDto } from './dto/update-community.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CommunitiesService {
  constructor(private prismaService: PrismaService) { }

  async create(createCommunityDto: CreateCommunityDto, userId: number) {

    try {
      const data = { ...createCommunityDto, userId };

      console.log(data);

      const community = await this.prismaService.community.create(
        {
          data: data,
          select: {
            id: true,
            description: true,
            createdAt: true,
            userId: true
          }
        }
      );

      return community;
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: number) {
    try {
      const community = await this.prismaService.community.findFirst(
        {
          where: { id, isActived: true, isDeleted: false },
        }
      );
      if (!community) {
        throw new NotFoundException("Community not found");
      }

      delete community.isActived;
      delete community.updatedAt;
      delete community.isDeleted;

      return community;
    } catch (error) {
      throw error;
    }
  }

  async update(id: number, updateCommunityDto: UpdateCommunityDto, userId: number) {
    try {
      const community = await this.prismaService.community.findFirst(
        {
          where: { id },
        }
      );

      if (!community) {
        throw new NotFoundException("Community not found");
      }

      const updatedCommunity = await this.prismaService.community.update({
        where: { id },
        data: updateCommunityDto
      })

      delete updatedCommunity.isActived;
      delete updatedCommunity.updatedAt;
      delete updatedCommunity.isDeleted;

      return updatedCommunity;
    } catch (error) {
      throw error;
    }
  }
}
