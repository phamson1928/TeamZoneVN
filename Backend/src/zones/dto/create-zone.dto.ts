import { ContactMethodType } from '@prisma/client';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class ZoneContactDto {
  @ApiProperty({ enum: ContactMethodType, example: ContactMethodType.INGAME })
  @IsEnum(ContactMethodType)
  type: ContactMethodType = ContactMethodType.INGAME;

  @ApiProperty({ example: 'MyUsername#1234' })
  @IsString()
  @IsNotEmpty()
  value: string = '';
}

export class CreateZoneDto {
  @ApiProperty({ example: 'game-uuid-here' })
  @IsNotEmpty()
  @IsString()
  gameId: string = '';

  @ApiProperty({ example: 'Cần 2 bạn có mic, chơi buổi tối' })
  @IsString()
  description: string = '';

  @ApiProperty({ example: 'Sức mạnh đồng đội - Valorant' })
  @IsString()
  title: string = '';

  @ApiPropertyOptional({ type: [String], example: ['tag-uuid-1', 'tag-uuid-2'] })
  @IsOptional()
  @IsUUID(4, { each: true })
  tagIds?: string[];

  @ApiPropertyOptional({ type: [ZoneContactDto] })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ZoneContactDto)
  contacts?: ZoneContactDto[];

  @ApiProperty({ example: 2 })
  @IsNotEmpty()
  @IsInt()
  requiredPlayers: number = 1;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  autoApprove?: boolean = false;

  @ApiPropertyOptional({
    example: 'Discord: user#1234',
    description: 'Contact information for the zone',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  contactInfo?: string;
}
