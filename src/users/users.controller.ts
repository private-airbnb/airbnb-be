import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Request,
  HttpCode,
  Patch,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from './entities/role.entity';
import { DeepPartial } from 'typeorm';
import { SignInUserDTO } from './dto/sign-in-user.dto';
import { ForgotPasswordDTO } from './dto/forgot-password.dto';
import { CreateNewPasswordDTO } from './dto/create-new-password.dto';
import { InfoUserDto, InfoUserWithCredentialDto } from './dto/info-user.dto';
import { UserPipe } from 'src/common/decorators/user-pipe.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async getInfoUser(@UserPipe() user): Promise<InfoUserDto> {
    return this.usersService.getInfoUser(user.userId);
  }

  @Public()
  @Post('sign-up')
  async signUp(@Body() createUserDto: CreateUserDto): Promise<InfoUserDto> {
    return await this.usersService.signUp(createUserDto);
  }

  @Public()
  @Post('sign-in')
  async signIn(
    @Body() loginUser: SignInUserDTO,
  ): Promise<InfoUserWithCredentialDto> {
    return await this.usersService.signIn(loginUser);
  }

  @Public()
  @Post('forgot-password')
  async forgotPassword(
    @Body() forgotPassword: ForgotPasswordDTO,
  ): Promise<boolean> {
    return this.usersService.forgotPassword(forgotPassword);
  }

  @Public()
  @Post('create-new-password')
  async createNewPassword(
    @Body() model: CreateNewPasswordDTO,
  ): Promise<boolean> {
    return this.usersService.createNewPassword(model);
  }

  @Roles(UserRole.Admin)
  @Get()
  async findAll(): Promise<User[]> {
    return await this.usersService.findAll();
  }

  // @Get('profile')
  // getProfile(@Request() { user }: { user: User }) {
  //   return user;
  // }

  // @Public()
  // @Get(':id')
  // async getOtherProfile(@Param('id') id: string): Promise<DeepPartial<User>> {
  //   const user = await this.usersService.findOne(+id);
  //   const { lastLogin, verified, roles, ...result } = user;
  //   return result;
  // }

  // @Patch(':id')
  // update(
  //   @Request() { user }: { user: User },
  //   @Param('id') id: string,
  //   @Body() updateUserDto: UpdateUserDto,
  // ): Promise<boolean> {
  //   if (user.id !== +id)
  //     throw new UnauthorizedException('자신의 프로필만 변결할 수 있습니다');
  //   return this.usersService.update(+id, updateUserDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.usersService.remove(+id);
  // }
}
