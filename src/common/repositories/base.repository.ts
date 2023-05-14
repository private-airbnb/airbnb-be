import { CoreEntity } from '../entities/core.entity';
import { Type } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';

type Constructor<I extends CoreEntity> = new (...args: any[]) => I;

export interface IBaseRepository<TEntity extends CoreEntity>
  extends Repository<TEntity> {
  getByIdAsync(id: number): Promise<TEntity>;
  getAllColumns<TEntity>(): (keyof TEntity)[];
}

/**
 * Create a mixin so that other repositories mix into
 * @param entity The base entity
 * @returns A type of entity
 */
export function makeBaseRepository<TEntity extends CoreEntity>(
  entity: Constructor<TEntity>,
): Type<IBaseRepository<TEntity>> {
  class BaseRepository
    extends Repository<TEntity>
    implements IBaseRepository<TEntity>
  {
    constructor(@InjectRepository(entity) repository: Repository<TEntity>) {
      super(repository.target, repository.manager, repository.queryRunner);
    }

    public getByIdAsync(id: number) {
      const options: FindOptionsWhere<TEntity> = {};
      return this.findOne({ where: { ...options, id: id } });
    }

    public getAllColumns<TEntity>(): (keyof TEntity)[] {
      return this.metadata.columns.map(
        (col) => col.propertyName,
      ) as (keyof TEntity)[];
    }
  }

  return BaseRepository;
}
