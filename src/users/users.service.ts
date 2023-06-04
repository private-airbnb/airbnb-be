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
import { Verification } from '../auth/jwt/entities/varification.entity';
import { generateUUIDv4 } from '../common/utils/mail.utils';
import { SignInGoogleUserDTO, SignInUserDTO } from './dto/sign-in-user.dto';
import { ParallelAsync } from '../common/utils/async.utils';
import UserRepository from './repositories/user.repository';
import RoleRepository from './repositories/role.repository';
import VerificationRepository from './repositories/verification.repository';
import { customThrowError } from 'src/common/utils/throw.utils';
import { PasswordHelper } from 'src/common/helpers/password.helper';
import { ForgotPasswordDTO } from './dto/forgot-password.dto';
import { TokenHelper } from 'src/common/helpers/token.helper';
import { TOKEN_TYPE } from 'src/common/enums/tokenType.enum';
import { CreateNewPasswordDTO } from './dto/create-new-password.dto';
import { InfoUser, InfoUserWithCredential } from './dto/info-user.dto';
import { AuthService } from 'src/auth/jwt/auth.service';
import { CreateUserWithGoogleDto } from './dto/create-user-with-google.dto';
import OAuthRepository from './repositories/oauth.repository';

@Injectable()
export class UsersService {
  private expireToken = 1;
  private expireTokenCookie = 1;

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

  async signUp(model: CreateUserDto): Promise<User> {
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

      return user;
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

  async loginWithGoogle(
    model: CreateUserWithGoogleDto,
  ): Promise<InfoUser | InfoUserWithCredential> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const { providerId, provider, firstName, lastName, email, avatar } =
        model;

      const alreadySignUp = await this.oauthRepository.exist({
        where: { providerId },
      });

      if (alreadySignUp) {
        return await this.signInWithGoogle({ providerId, email });
      }

      const exists = await this.userRepository.exist({ where: { email } });

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

      return new InfoUser(user);
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
  }: SignInUserDTO): Promise<InfoUserWithCredential> {
    const user = await this.userRepository.findOne({
      where: { email },
    });

    const isMatch = await this.passwordHelper.isCompare(
      password,
      user.password,
    );

    if (user && isMatch) {
      user.lastLogin = new Date();
      this.userRepository.save(user);

      const accessToken = await this.tokenHelper.createToken(
        {
          userId: user.id,
          role: user.roles,
          type: TOKEN_TYPE.LOGIN_TOKEN,
        },
        `${this.expireToken}d`,
      );

      return new InfoUserWithCredential(user, accessToken);
    }

    customThrowError(`Invalid Credential`, HttpStatus.UNAUTHORIZED);
  }

  private async signInWithGoogle({
    providerId,
    email,
  }: SignInGoogleUserDTO): Promise<InfoUserWithCredential> {
    const googleUser = await this.userRepository.findOne({
      where: { email, oauth: { providerId } },
    });

    if (googleUser) {
      googleUser.lastLogin = new Date();
      this.userRepository.save(googleUser);

      const accessToken = await this.tokenHelper.createToken(
        {
          userId: googleUser.id,
          role: googleUser.roles,
          type: TOKEN_TYPE.LOGIN_TOKEN,
        },
        `${this.expireToken}d`,
      );

      return new InfoUserWithCredential(googleUser, accessToken);
    }

    customThrowError(`Invalid Credential`, HttpStatus.UNAUTHORIZED);
  }

  async forgotPassword(model: ForgotPasswordDTO): Promise<boolean> {
    const user = await this.userRepository.findOneBy({ email: model.email });

    if (!user) {
      customThrowError('Email not found!', HttpStatus.NOT_FOUND);
    }

    const expire = `${this.expireTokenCookie}h`;

    const token = this.tokenHelper.createToken(
      {
        id: user.id,
        email: user.email,
        type: TOKEN_TYPE.FORGOT_PASSWORD_TOKEN,
      },
      expire,
    );

    this.mailService.sendForgotPassword(token, model.email, user.fullName);

    return true;
  }

  async createNewPassword(model: CreateNewPasswordDTO): Promise<boolean> {
    if (model.password !== model.confirmedPassword) {
      customThrowError('Invalid Credential', HttpStatus.UNAUTHORIZED);
    }

    const infoUser = this.tokenHelper.verifyToken(
      model.token,
      TOKEN_TYPE.FORGOT_PASSWORD_TOKEN,
    );

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

  async findAll(): Promise<User[]> {
    return await this.userRepository.find();
  }

  async findOne(id: number): Promise<User> {
    return await this.userRepository.findOneByOrFail({ id });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<boolean> {
    await this.userRepository.update(id, updateUserDto);
    return true;
  }

  // async remove(id: number) {
  //   return `This action removes a #${id} user`;
  // }
}
