import { MiddlewareConsumer, Module, NestModule, RequestMethod, ValidationPipe } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UsersModule } from "./users/users.module";
import { RoomsModule } from "./rooms/rooms.module";
import { ReservationsModule } from "./reservations/reservations.module";
import { ReviewsModule } from "./reviews/reviews.module";
import { ListsModule } from "./lists/lists.module";
import { AuthModule } from "./auth/auth.module";
import { CountriesModule } from "./countries/countries.module";
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from "@nestjs/core";
import { JwtAuthGuard } from "./common/guards/jwt-auth.guard";
import { RolesGuard } from "./common/guards/roles.guard";
import { MailModule } from "./mail/mail.module";
import { PhotosModule } from "./photos/photos.module";
import { DiscountsModule } from "./discounts/discounts.module";
import { LoggingInterceptor } from "./common/interceptors/logging.interceptor";
import { EntityNotFoundError } from "typeorm";
import { RequestMiddleware } from "./common/middlewares/request.middleware";
import { AppService } from "./app.service";
import { AppSettings } from "./app.settings";

const modules = [
  TypeOrmModule,
  // UsersModule,
  // RoomsModule,
  // ReservationsModule,
  // ReviewsModule,
  // ListsModule,
  // CountriesModule,
  // AuthModule,
  // MailModule,
  // PhotosModule,
  // DiscountsModule,
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
      path: "*",
      method: RequestMethod.ALL,
    });
  }
}
