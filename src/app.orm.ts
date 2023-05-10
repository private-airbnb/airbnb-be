import { TypeOrmModule } from "@nestjs/typeorm";
import { AppSettings } from "./app.settings";
import { Verification } from "./auth/entities/varification.entity";
import { Role } from "./users/entities/role.entity";
import { User } from "./users/entities/user.entity";
import UserOrm from "./users/users.orm";
import { DataSource } from "typeorm";
import { Country } from "./countries/entities/country.entity";
import { List } from "./lists/entities/list.entity";
import { Discount } from "./discounts/entities/discount.entity";
import { Reservation } from "./reservations/entities/reservation.entity";
import { Review } from "./reviews/entities/review.entity";
import { Rating } from "./reviews/entities/rating.entity";
import { Photo } from "./photos/entries/photo.entity";
import { Conversation } from "./common/entities/conversation.entity";
import { Message } from "./common/entities/message.entity";
import { Payment } from "./common/entities/payment.entity";
import { CustomRule, Detail, DetailChoice, Rule, RuleChoice } from "./rooms/entities/rule.entity";
import { Room } from "./rooms/entities/room.entity";
import { AmenityGroup, AmenityItem } from "./rooms/entities/amenity.entity";

const appsettings = AppSettings.forRoot();

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

export default TypeOrmModule.forRootAsync({
  useFactory: () => ({
    type: appsettings.database.type,
    host: appsettings.database.host,
    port: appsettings.database.port,
    username: appsettings.database.username,
    password: appsettings.database.password,
    database: appsettings.database.database,
    schema: appsettings.database.schema,
    entities,
    synchronize: true,
    logging: true,
    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 30000,
    },
    cache: appsettings.redis.forOrmCache(),
    options: {
      encrypt: false, // for azure
      // trustServerCertificate: true, // change to true for local dev / self-signed certs
      enableArithAbort: true,
    },
  }),
});
