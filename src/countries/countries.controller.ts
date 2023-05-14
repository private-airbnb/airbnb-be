import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { CountriesService } from './countries.service';
import { CreateCountryDto } from './dto/create-country.dto';

@Controller('countries')
export class CountriesController {
  constructor(private readonly countriesService: CountriesService) {}

  @Public()
  @Post()
  async create(@Body() createCountryDto: CreateCountryDto): Promise<any> {
    return await this.countriesService.create(createCountryDto);
  }

  @Get()
  findAll() {
    return this.countriesService.findAll();
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.countriesService.remove(+id);
  }
}
