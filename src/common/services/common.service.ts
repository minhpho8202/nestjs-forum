import { Global, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CommonService {
    constructor(private readonly prismaService: PrismaService) { }

    async toggleStatus<T>(id: number, modelName: string, field: 'isActived' | 'isDeleted'): Promise<T> {
        try {
            const entity = await this.prismaService[modelName].findFirst({
                where: { id },
            });

            if (!entity) {
                throw new NotFoundException(`${modelName} not found`);
            }

            const updatedEntity = await this.prismaService[modelName].update({
                where: { id },
                data: { [field]: !entity[field] },
                select: { [field]: true },
            });

            return updatedEntity;
        } catch (error) {
            throw error;
        }
    }
}