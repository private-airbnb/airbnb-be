import {
  BadRequestException,
  ConflictException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MailService } from '../mail/mail.service';
import { DataSource, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role, UserRole } from './entities/role.entity';
import { User } from './entities/user.entity';
import { Verification } from '../auth/jwt/entities/verification.entity';
import { generateUUIDv4 } from '../common/utils/mail.utils';
import { SignInUserDTO } from './dto/sign-in-user.dto';
import { ParallelAsync } from '../common/utils/async.utils';
import UserRepository from './repositories/user.repository';
import RoleRepository from './repositories/role.repository';
import VerificationRepository from './repositories/verification.repository';
import { customThrowError } from 'src/common/utils/throw.utils';
import { PasswordHelper } from 'src/common/helpers/password.helper';
import { ForgotPasswordDTO } from './dto/forgot-password.dto';
import { TokenHelper } from 'src/common/helpers/token.helper';
import { CreateNewPasswordDTO } from './dto/create-new-password.dto';
import { AuthService } from 'src/auth/jwt/auth.service';
import {
  CreateUserWithSocialNetworkDto,
  IntegrateWithSocialNetworkDto,
} from './dto/create-user-with-social-network.dto';
import OAuthRepository from './repositories/oauth.repository';
import { Oauth } from './entities/oauth.entity';
import { pick } from 'lodash';
import { InfoUserDto, InfoUserWithCredentialDto } from './dto/info-user.dto';
@Injectable()
export class UsersService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly tokenHelper: TokenHelper,
    private readonly mailService: MailService,
    private readonly authService: AuthService,
    private readonly userRepository: UserRepository,
    private readonly roleRepository: RoleRepository,
    private readonly oauthRepository: OAuthRepository,
    private readonly passwordHelper: PasswordHelper,
    private readonly verificationRepository: VerificationRepository,
  ) {}

  async signUp(model: CreateUserDto): Promise<InfoUserDto> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const {
        firstName,
        lastName,
        email,
        password,
        isHost,
        isAdmin,
        adminSecretKey,
      } = model;

      if (isAdmin && adminSecretKey !== process.env.ADMIN_SECRET_KEY)
        customThrowError('Admin key does not match', HttpStatus.UNAUTHORIZED);

      const exists = await this.userRepository.findOne({
        where: { email },
        select: ['id'],
      });

      if (exists) {
        customThrowError(
          'This email has already been registered',
          HttpStatus.BAD_REQUEST,
        );
      }

      const user = await this.userRepository.save(
        this.userRepository.create({
          firstName,
          lastName,
          email,
          password: await this.passwordHelper.getCiphertext(password),
        }),
      );

      delete user.password;

      const parallelAsync = new ParallelAsync();

      parallelAsync.add(
        this.roleRepository.save({ user, role: UserRole.Guest }),
      );
      if (isHost) {
        parallelAsync.add(
          this.roleRepository.save({ user, role: UserRole.Host }),
        );
      }

      if (isAdmin) {
        parallelAsync.add(
          this.roleRepository.save({ user, role: UserRole.Admin }),
        );
      }

      const emailCode = generateUUIDv4();
      parallelAsync.add(
        this.verificationRepository.save(
          this.verificationRepository.create({ user, code: emailCode }),
        ),
      );

      await parallelAsync.done();
      await queryRunner.commitTransaction();

      this.mailService.sendVerifyEmail(emailCode, email);

      return new InfoUserDto(user);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      customThrowError(
        'Unable to create transactions',
        HttpStatus.INTERNAL_SERVER_ERROR,
        '',
        error,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async loginWithSocialNetwork(
    model: CreateUserWithSocialNetworkDto,
  ): Promise<InfoUserDto | InfoUserWithCredentialDto> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const { providerId, provider, firstName, lastName, email, avatar } =
        model;

      const alreadyLoginWithSocialNetwork = await this.userRepository.findOneBy(
        { email, oauth: { providerId } },
      );

      if (alreadyLoginWithSocialNetwork) {
        return await this.signInWithSocialNetwork(
          alreadyLoginWithSocialNetwork,
        );
      }

      const userExists = await this.userRepository.findOne({
        where: { email },
        select: ['id'],
      });

      if (userExists && !alreadyLoginWithSocialNetwork) {
        await this.integrateWithSocialNetwork(
          userExists,
          pick(model, ['provider', 'providerId']),
        );
        return await this.signInWithSocialNetwork(userExists);
      }

      const user = await this.userRepository.save(
        this.userRepository.create({
          firstName,
          lastName,
          avatar,
          email,
        }),
      );

      const parallelAsync = new ParallelAsync();

      parallelAsync.add(
        this.oauthRepository.save(
          this.oauthRepository.create({
            userId: user.id,
            providerId,
            provider,
          }),
        ),
      );

      parallelAsync.add(
        this.roleRepository.save({ user, role: UserRole.Guest }),
      );

      const emailCode = generateUUIDv4();
      parallelAsync.add(
        this.verificationRepository.save(
          this.verificationRepository.create({ user, code: emailCode }),
        ),
      );

      await parallelAsync.done();
      await queryRunner.commitTransaction();

      this.mailService.sendVerifyEmail(emailCode, email);

      return new InfoUserDto(user);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      customThrowError(
        'Unable to create transactions',
        HttpStatus.INTERNAL_SERVER_ERROR,
        '',
        error,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async signIn({
    email,
    password,
  }: SignInUserDTO): Promise<InfoUserWithCredentialDto> {
    const user = await this.userRepository.findOne({
      where: { email },
    });

    const isMatch =
      user && (await this.passwordHelper.isCompare(password, user.password));

    if (isMatch) {
      user.lastLogin = new Date();
      this.userRepository.save(user);
      const accessToken = this.authService.getAccessToken(user);

      return new InfoUserWithCredentialDto(user, accessToken);
    }

    customThrowError(`Invalid Credential`, HttpStatus.UNAUTHORIZED);
  }

  private async signInWithSocialNetwork(
    socialUser: User,
  ): Promise<InfoUserWithCredentialDto> {
    if (socialUser) {
      socialUser.lastLogin = new Date();
      this.userRepository.save(socialUser);

      const accessToken = this.authService.getAccessToken(socialUser);

      return new InfoUserWithCredentialDto(socialUser, accessToken);
    }

    customThrowError(`Invalid Credential`, HttpStatus.UNAUTHORIZED);
  }

  private async integrateWithSocialNetwork(
    user: User,
    model: IntegrateWithSocialNetworkDto,
  ): Promise<Oauth> {
    return this.oauthRepository.save(
      this.oauthRepository.create({
        userId: user.id,
        provider: model.provider,
        providerId: model.providerId,
      }),
    );
  }

  async forgotPassword(model: ForgotPasswordDTO): Promise<boolean> {
    const user = await this.userRepository.findOneBy({ email: model.email });

    if (!user) {
      customThrowError('Email not found!', HttpStatus.NOT_FOUND);
    }

    const token = this.tokenHelper.createToken(
      {
        id: user.id,
        email: user.email,
      },
      `1h`,
    );

    this.mailService.sendForgotPassword(token, model.email, user.fullName);

    return true;
  }

  async createNewPassword(model: CreateNewPasswordDTO): Promise<boolean> {
    if (model.password !== model.confirmedPassword) {
      customThrowError('Invalid Credential', HttpStatus.UNAUTHORIZED);
    }

    const infoUser = this.tokenHelper.verifyToken(model.token);

    if (infoUser.newUser) model.shouldVerify = true;

    const user = await this.userRepository.findOneBy({
      email: infoUser.email,
    });

    if (!user) {
      customThrowError(`Invalid Credential`, HttpStatus.UNAUTHORIZED);
    }

    this.updatePassword(model, user);

    return true;
  }

  private async updatePassword(model: CreateNewPasswordDTO, user: User) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const passwordHash = await this.passwordHelper.getCiphertext(
        model.password,
      );
      user.password = passwordHash;

      if (model.shouldVerify) user.verified = true;

      await queryRunner.manager.save(user);
      await queryRunner.commitTransaction();
      return true;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      customThrowError(
        'Transaction rollback',
        HttpStatus.INTERNAL_SERVER_ERROR,
        '',
        err,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async getInfoUser(id: number): Promise<InfoUserDto> {
    const user = await this.userRepository.findOneByOrFail({ id });
    return new InfoUserDto(user);
  }

  async findAll(): Promise<User[]> {
    return await this.userRepository.find();
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<boolean> {
    await this.userRepository.update(id, updateUserDto);
    return true;
  }

  // async remove(id: number) {
  //   return `This action removes a #${id} user`;
  // }
}
