import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';
import { SortDirection } from '../enums/sortDirection.enum';

export class PaginationRequest<T> {
  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  skip: number;

  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  take: number;

  @ApiPropertyOptional({ name: 'orderBy', type: 'string' })
  @IsOptional()
  orderBy?: keyof T;

  @ApiPropertyOptional({ enum: SortDirection })
  @IsOptional()
  orderDirection?: SortDirection;

  @ApiPropertyOptional()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional()
  @Transform(({ value }) => value === 'true')
  @IsOptional()
  isGettingDeleted?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  filters?: Partial<T>;
}
