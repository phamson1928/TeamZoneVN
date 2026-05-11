import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UseGuards
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService } from './files.service';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { Public, JwtAuthGuard, RolesGuard, Roles } from '../common/index.js';

@ApiTags('Files')
@Controller('files')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FilesController {
  constructor(private readonly filesService: FilesService) { }

  @Post('upload/game-icon')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Upload game icon' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadGameIcon(@UploadedFile() file: Express.Multer.File) {
    return this.filesService.uploadFile(file, 'game-assets', 'icons');
  }

  @Post('upload/game-banner')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Upload game banner' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadGameBanner(@UploadedFile() file: Express.Multer.File) {
    return this.filesService.uploadFile(file, 'game-assets', 'banners');
  }

  @Post('upload/avatar')
  @ApiOperation({ summary: 'Upload user avatar' })
  @Roles('USER')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(@UploadedFile() file: Express.Multer.File) {
    return this.filesService.uploadFile(file, 'game-assets', 'avatars');
  }
}
