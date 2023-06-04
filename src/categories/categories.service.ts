import { CreateCategoryDto } from './dto/create-category.dto';
import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { customThrowError } from 'src/common/utils/throw.utils';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async findAll(): Promise<Category[]> {
    return await this.categoryRepository.find();
  }

  async findOne(id: number): Promise<Category> {
    return await this.categoryRepository.findOneByOrFail({ id: id });
  }

  async create(
    userId: number,
    createCategoryDto: CreateCategoryDto,
  ): Promise<Category> {
    const category = {
      owner: { id: userId },
      name: createCategoryDto.name,
    };
    const exist = await this.categoryRepository.findOneBy(category);
    if (exist) {
      customThrowError(
        'This is the category name that already exists.',
        HttpStatus.BAD_REQUEST,
      );
    }
    return await this.categoryRepository.create(category);
  }

  async delete(id: number) {
    await this.categoryRepository.findOneByOrFail({ id: id });
    return await this.categoryRepository.delete(id);
  }
}
