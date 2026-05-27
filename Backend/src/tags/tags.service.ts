import { Inject, Injectable } from '@nestjs/common';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { PrismaService } from 'src/prisma';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class TagsService {
  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cache: Cache,
  ) {}

  async getAllTags() {
    const tags = await this.prisma.zoneTag.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    });
    return tags;
  }

  async createTag(createTagDto: CreateTagDto) {
    const newTag = await this.prisma.zoneTag.create({
      data: { ...createTagDto },
    });
    await this.cache.del('tags');
    return newTag;
  }

  async updateTag(id: string, updateTagDto: UpdateTagDto) {
    const updatedTag = await this.prisma.zoneTag.update({
      where: { id },
      data: { ...updateTagDto },
    });
    await this.cache.del('tags');
    return updatedTag;
  }

  async deleteTag(id: string) {
    await this.prisma.zoneTag.delete({
      where: { id },
    });
    await this.cache.del('tags');
    return { message: 'Tag deleted successfully' };
  }
}
