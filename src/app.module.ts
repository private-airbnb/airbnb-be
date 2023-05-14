import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
  ValidationPipe,
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { RoomsModule } from './rooms/rooms.module';
import { ReservationsModule } from './reservations/reservations.module';
import { ReviewsModule } from './reviews/reviews.module';
import { ListsModule } from './lists/lists.module';
import { AuthModule } from './auth/auth.module';
import { CountriesModule } from './countries/countries.module';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { MailModule } from './mail/mail.module';
import { PhotosModule } from './photos/photos.module';
import { DiscountsModule } from './discounts/discounts.module';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { EntityNotFoundError } from 'typeorm';
import { RequestMiddleware } from './common/middlewares/request.middleware';
import { AppService } from './app.service';
import { AppSettings, env } from './app.settings';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Verification } from './auth/entities/varification.entity';
import { Role } from './users/entities/role.entity';
import { User } from './users/entities/user.entity';
import { Country } from './countries/entities/country.entity';
import { List } from './lists/entities/list.entity';
import { Discount } from './discounts/entities/discount.entity';
import { Reservation } from './reservations/entities/reservation.entity';
import { Review } from './reviews/entities/review.entity';
import { Rating } from './reviews/entities/rating.entity';
import { Photo } from './photos/entries/photo.entity';
import { Conversation } from './common/entities/conversation.entity';
import { Message } from './common/entities/message.entity';
import { Payment } from './common/entities/payment.entity';
import {
  CustomRule,
  Detail,
  DetailChoice,
  Rule,
  RuleChoice,
} from './rooms/entities/rule.entity';
import { Room } from './rooms/entities/room.entity';
import { AmenityGroup, AmenityItem } from './rooms/entities/amenity.entity';

const appsettings = AppSettings.forRoot();

const envFilePath = '.env';

const entities = [
  Country,
  List,
  Discount,
  Reservation,
  Verification,
  Review,
  Rating,
  Photo,
  User,
  Role,
  Conversation,
  Message,
  Payment,
  AmenityGroup,
  AmenityItem,
  Room,
  Rule,
  RuleChoice,
  CustomRule,
  Detail,
  DetailChoice,
];

const modules = [
  ConfigModule.forRoot({
    envFilePath,
    isGlobal: true,
  }),
  TypeOrmModule.forRootAsync({
    imports: [ConfigModule],
    useFactory: (configService: ConfigService) => ({
      type: appsettings.database.type,
      host: configService.get<string>('DB_HOST') || appsettings.database.host,
      port: +configService.get<string>('DB_PORT') || appsettings.database.port,
      username:
        configService.get<string>('DB_USER') || appsettings.database.username,
      password:
        configService.get<string>('DB_PASSWORD') ||
        appsettings.database.password,
      database:
        configService.get<string>('DB_NAME') || appsettings.database.database,
      schema:
        configService.get<string>('DB_SCHEMA') || appsettings.database.schema,
      entities,
      synchronize: env('SYNCHRONIZE', true),
      logging: false,
      subscribers: [],
    }),
    inject: [ConfigService],
  }),
  UsersModule,
  RoomsModule,
  ReservationsModule,
  ReviewsModule,
  ListsModule,
  CountriesModule,
  AuthModule,
  MailModule,
  PhotosModule,
  DiscountsModule,
];
@Module({
  imports: modules,
  providers: [
    AppService,
    {
      provide: AppSettings,
      useValue: AppSettings.forRoot(),
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    },
    {
      provide: APP_FILTER,
      useClass: EntityNotFoundError,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestMiddleware).forRoutes({
      path: '*',
      method: RequestMethod.ALL,
    });
  }
}
