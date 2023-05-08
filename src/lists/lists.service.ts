import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room } from '../rooms/entities/room.entity';
import { AppendListItemDto, CreateListDto } from './dto/create-list.dto';
import { List } from './entities/list.entity';

@Injectable()
export class ListsService {
  constructor(
    @InjectRepository(List)
    private readonly listRepository: Repository<List>,
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,
  ) {}

  async create(userId: number, createListDto: CreateListDto): Promise<List> {
    const list = {
      owner: { id: userId },
      name: createListDto.name,
    };
    const exist = await this.listRepository.findOneBy(list);
    if (exist)
      throw new BadRequestException('이미 존재하는 리스트 이름입니다.');
    return await this.listRepository.create(list);
  }

  async append(
    userId: number,
    appendListItemDto: AppendListItemDto,
  ): Promise<List> {
    const list = await this.listRepository.findOneByOrFail({ id: appendListItemDto.id });
    const room = await this.roomRepository.findOneByOrFail(
      {id: appendListItemDto.roomId},
    );
    if (list.owner.id != userId)
      throw new UnauthorizedException('접근할 수 없습니다.');
    list.rooms = [...list.rooms, room];
    return await this.listRepository.save(list);
  }

  async getListsByUserId(userId: number): Promise<List[]> {
    return await this.listRepository.findBy({ owner: { id: userId } });
  }

  async findOne(id: number): Promise<List> {
    return await this.listRepository.findOneByOrFail({id: id});
  }

  async delete(id: number) {
    await this.listRepository.findOneByOrFail({id: id});
    return await this.listRepository.delete(id);
  }
}
