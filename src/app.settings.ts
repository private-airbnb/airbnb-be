import { Injectable, Logger } from '@nestjs/common';
import { join } from 'path';
import * as dotenv from 'dotenv';
import { ClassConstructor, Exclude, plainToClass } from 'class-transformer';
import { IsNotEmpty, validateSync } from 'class-validator';
import { ClientProviderOptions, Transport } from '@nestjs/microservices';

export type ProductionMode = 'development' | 'staging' | 'production';

@Injectable()
export class AppSettings {
    private static current: AppSettings;

    redis: Redis = new Redis();
    database: Database = new Database();
    elasticsearch: Elasticsearch = new Elasticsearch();
    s3: S3 = new S3();
    jwt: Jwt = new Jwt();
    smtp: Smtp = new Smtp();
    rabbit: RabbitMQ = new RabbitMQ();

    cwd = '';
    production: ProductionMode = 'development';
    name = env('APP_NAME', 'Riki Exchange API');
    port = env('APP_PORT', 8080);
    version = env('APP_VERSION', '1.0.1');
    enabledAES: boolean = env('AES', 'false') == 'true';
    enabledAPI: boolean = env('ENABLED_API', 'false') == 'true';
    enabledMicroservices: boolean = env('ENABLED_MICROSERVICES', 'false') == 'true';
    enablesElasticsearch: boolean = env('ENABLED_ELASTICSEARCH', 'false') == 'true';
    podName = env('POD_NAME');
    podIP = env('POD_IP');
    domain = env('DOMAIN');
    templatePath = '';
    maxFileSize = env('MAX_FILE_SIZE', 10485760);
    enabledCron: boolean = env('ENABLED_CRON', 'true') == 'true';

    static forRoot() {
        const production = env('NODE_ENV');
        const path = join(process.cwd(), production ? '.env.production' : '.env.local');
        dotenv.config({
            path: path
        });
        if (!AppSettings.current) {
            Logger.log(`Reading file env at path ${path}`);
            AppSettings.current = new AppSettings();
            AppSettings.current.production = (production == 'production' || production == 'prod') ? 'production' :
                (production == 'staging' || production == 'stage') ? 'staging' : 'development';
            AppSettings.current.templatePath = production ? join(process.cwd(), 'templates') : "./templates";
            AppSettings.validate(Database, AppSettings.current.database);
            AppSettings.validate(Redis, AppSettings.current.redis);
            AppSettings.validate(Redis, AppSettings.current.rabbit);
            // AppSettings.validate(S3, AppSettings.current.s3);
            // AppSettings.validate(Jwt, AppSettings.current.jwt)
            // AppSettings.validate(Smtp, AppSettings.current.smtp)
        }

        return AppSettings.current;
    }

    static validate<T>(cls: ClassConstructor<T>, value: any) {
        const validatedConfig = plainToClass(cls, value, {
            enableImplicitConversion: true,
        });

        const errors = validateSync(<Record<string, unknown>>validatedConfig, {
            skipMissingProperties: false,
        });

        if (errors.length > 0) {
            throw new Error(errors.toString());
        }
    }
}

export class Database {
    type: 'postgres' = env('DATABASE_TYPE', 'postgres');

    @IsNotEmpty({ message: 'Required DB_HOST in env (14.7.30.1)' })
    host = env('DB_HOST');

    @Exclude()
    @IsNotEmpty({ message: 'Required DB_PORT in env (1433 or 3433 or 5432)' })
    port = parseInt(env('DB_PORT'));

    @Exclude()
    @IsNotEmpty({ message: 'Required DB_USER' })
    username = env('DB_USER');

    @Exclude()
    @IsNotEmpty({ message: 'Required DB_PASSWORD in env' })
    password = env('DB_PASSWORD');

    @Exclude()
    @IsNotEmpty({ message: 'Required DB_NAME in env' })
    database = env('DB_NAME');

    schema = env('DB_SCHEMA');

    pool = {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000,
    };
    options = {
        encrypt: false, // for azure
        trustServerCertificate: true, // change to true for local dev / self-signed certs
        enableArithAbort: true,
    };
}

export class Elasticsearch {
    @IsNotEmpty()
    nodes: string[] = (env('ELASTICSEARCH_NODES') || '').split(';').filter((url: string) => url.trim().length !== 0);

    username = env('ELASTICSEARCH_USERNAME', 'elastic');

    @Exclude()
    @IsNotEmpty()
    password = env('ELASTICSEARCH_PASSWORD', 'admin');
}
export class RabbitMQ {
    @Exclude()
    @IsNotEmpty({ message: 'Required RABBIT_HOSTS (split by ;) in env' })
    hosts: string[] = (env('RABBIT_HOSTS') || '').split(';').filter((url: string) => url.trim().length !== 0);

    /**
     * Build a RabbitMQ transport config object
     * @param queueName Name of listening queue
     * @param urls Connection URLs
     * @returns ClientProviderOptions
     */
    getRqmTransportConfig(
        queueName: string
    ): ClientProviderOptions {
        return {
            name: queueName,
            transport: Transport.RMQ,
            options: {
                urls: this.hosts,
                queue: queueName,
                queueOptions: {
                    durable: false
                }
            }
        };
    }

}

export class Redis {
    @IsNotEmpty({ message: 'required REDIS_HOST in env' })
    host = env('REDIS_HOST', 'localhost');

    @Exclude()
    @IsNotEmpty({ message: 'required REDIS_PORT in env' })
    port = env('REDIS_PORT', '6379');

    @Exclude()
    auth = env('REDIS_AUTH', null);

    @IsNotEmpty({ message: 'required REDIS_ORM_ENABLED in env' })
    enabled = env('REDIS_ORM_ENABLED', 'false') == 'true';

    ttl = env('REDIS_TTL', 12);

    forOrmCache(): any {
        const hosts = this.host.split(',').map((h: string) => {
            return { host: h, port: this.port, password: this.auth };
        });
        return hosts.length < 2
            ? this.ormSingleOptions()
            : this.ormClusterOptions(hosts);
    }

    private ormSingleOptions() {
        return {
            type: 'ioredis',
            duration: 60000,
            options: {
                host: this.host,
                port: this.port,
                password: this.auth,
            },
        };
    }

    private ormClusterOptions(
        nodes: [{ host: string; port: number; password: string }],
    ) {
        return {
            type: 'ioredis/cluster',
            options: {
                startupNodes: nodes,
                options: {
                    scaleReads: 'all',
                    clusterRetryStrategy: function (times) {
                        return null;
                    },
                    redisOptions: {
                        maxRetriesPerRequest: 5,
                        password: nodes[0].password
                    },
                }
            }
        };
    }
}

export class S3 {
    @IsNotEmpty({ message: 'required AWS_S3_ID in env' })
    AWS_S3_ID = env('AWS_S3_ID', 'localhost');

    @Exclude()
    @IsNotEmpty({ message: 'required AWS_S3_SECRET in env' })
    AWS_S3_SECRET = env(
        'AWS_S3_SECRET',
        '9LjsJTLl0PBLy5bQegblWv+NEbbo9aVu0C7hOu18'
    );

    @Exclude()
    @IsNotEmpty({ message: 'required AWS_S3_BUCKET_NAME in env' })
    AWS_S3_BUCKET_NAME = env('pea-system', 'AKIAXFCSNHW5N3XEKPDU');
}


export class Smtp {
    @IsNotEmpty({ message: 'required SMTP_HOST in env' })
    host = env('SMTP_HOST');

    @Exclude()
    @IsNotEmpty({ message: 'required SMTP_PORT in env' })
    port = env('SMTP_PORT');

    @Exclude()
    @IsNotEmpty({ message: 'required SMTP_USERNAME in env' })
    username = env('SMTP_USERNAME');

    @Exclude()
    @IsNotEmpty({ message: 'required SMTP_PASSWORD in env' })
    password = env('SMTP_PASSWORD');

    @Exclude()
    templatePath = join(process.cwd(), 'templates');
}


export class Jwt {
    @Exclude()
    @IsNotEmpty({ message: 'required JWT_SECRET in env' })
    secret = env('JWT_SECRET');
    expiresIn = '30d';
}

export function env(key: string, defaultValue = null) {
    return process.env[key] ? process.env[key] : defaultValue;
}