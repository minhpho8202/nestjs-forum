import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserRole } from '@prisma/client';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Injectable()
export class PostsService {
  constructor(private prismaService: PrismaService,
    private cloudinaryService: CloudinaryService,
  ) { }

  async create(createPostDto: CreatePostDto, userId: number, images: Express.Multer.File[], communityId: number) {
    try {
      const data = { ...createPostDto, userId, communityId };

      let images_url = '';

      if (images.length > 0) {
        if (images.length == 1) {
          console.log('Có 1 ảnh');
          const response = await this.cloudinaryService.uploadImage(images[0]);
          images_url = response.secure_url;
        } else {
          console.log('Có nhiều ảnh');
          const response = await this.cloudinaryService.uploadImages(images);
          images_url = response.toString();
        }
      }

      if (images_url) {
        data.imageUrl = images_url;
      }

      console.log(data);

      const post = await this.prismaService.post.create({ data: data });

      delete post.updatedAt;
      delete post.isDeleted;
      delete post.isActived;

      return post;
    } catch (error) {
      throw error;
    }
  }

  async findAll(page: number = 1, search?: string) {
    try {
      const take = 2;
      const skip = (page - 1) * take;

      let condition: any = {
        isActived: true,
        isDeleted: false,
      };

      if (search) {
        condition = {
          ...condition,
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { content: { contains: search, mode: 'insensitive' } }
          ]
        };
      }

      const [posts, totalPosts] = await this.prismaService.$transaction([
        this.prismaService.post.findMany({
          where: condition,
          select: {
            id: true,
            title: true,
            content: true,
            url: true,
            userId: true,
            imageUrl: true,
            createdAt: true,
            updatedAt: true,
            upvotes: true,
            downvotes: true,
            communityId: true,
            user: {
              select: {
                id: true,
                username: true,
                email: true,
                profilePicture: true,
                bio: true,
                role: true,
              },
            }
          },
          orderBy: [
            { createdAt: 'desc' },
            { updatedAt: 'desc' }
          ],
          skip,
          take
        }),

        this.prismaService.post.count({
          where: condition
        })
      ]);

      const totalPages = Math.ceil(totalPosts / take);

      return { posts, totalPages };
    } catch (error) {
      throw error;
    }
  }

  async findPostByCommunity(communityId: number, page: number = 1, search?: string) {
    try {
      const take = 2;
      const skip = (page - 1) * take;

      let condition: any = {
        isActived: true,
        isDeleted: false,
        communityId
      };

      if (search) {
        condition = {
          ...condition,
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { content: { contains: search, mode: 'insensitive' } }
          ]
        };
      }

      const [posts, totalPosts] = await this.prismaService.$transaction([
        this.prismaService.post.findMany({
          where: condition,
          select: {
            id: true,
            title: true,
            content: true,
            url: true,
            userId: true,
            imageUrl: true,
            createdAt: true,
            updatedAt: true,
            upvotes: true,
            downvotes: true,
            communityId: true,
            user: {
              select: {
                id: true,
                username: true,
                email: true,
                profilePicture: true,
                bio: true,
                role: true,
              },
            }
          },
          orderBy: [
            { createdAt: 'desc' },
            { updatedAt: 'desc' }
          ],
          skip,
          take
        }),

        this.prismaService.post.count({
          where: condition
        })
      ]);

      const totalPages = Math.ceil(totalPosts / take);

      return { posts, totalPages };
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: number) {
    try {
      const post = await this.prismaService.post.findFirst(
        {
          where: { id, isActived: true, isDeleted: false },
        }
      )

      if (!post) {
        throw new NotFoundException("Post not found");
      }

      delete post.isActived;
      delete post.isDeleted;

      return post;
    } catch (error) {
      throw error;
    }
  }

  async update(id: number, updatePostDto: UpdatePostDto, userId: number) {
    try {
      const post = await this.prismaService.post.findFirst({
        where: {
          id
        }
      })
      if (!post) {
        throw new NotFoundException("Post not found");
      }

      const updatedPost = await this.prismaService.post.update({
        where: { id },
        data: updatePostDto,
        select: {
          id: true,
          title: true,
          content: true,
          url: true,
          userId: true,
          imageUrl: true,
          createdAt: true,
          updatedAt: true,
          upvotes: true,
          downvotes: true,
          communityId: true,
        },
      })

      return updatedPost;
    } catch (error) {
      throw error;
    }
  }
}
