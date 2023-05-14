import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AppSettings } from './app.settings';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn'], //['log', 'error', 'warn', 'debug', 'verbose']
  });

  const appsettings = AppSettings.forRoot();
  const reflector = new Reflector();

  // Config swagger
  const swaggerOptions = new DocumentBuilder()
    .setTitle('Nestbnb Backend')
    .setDescription('This is Nestbnb Backend API')
    .setVersion('1.0')
    .addTag('Airbnb')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerOptions, {
    include: [AppModule],
    deepScanRoutes: true,
    operationIdFactory: (key: string, method: string) => method,
  });

  SwaggerModule.setup('swagger', app, document);

  app.enableCors();
  app.useGlobalGuards(new JwtAuthGuard(reflector));
  app.useGlobalInterceptors(new ResponseInterceptor());

  app.use((req, res, next) => {
    if (isDisableKeepAlive) {
      res.set('Connection', 'close');
    }
    next();
  });

  const sysLogger = new Logger('System');
  let isDisableKeepAlive = false;

  await app.listen(+appsettings.port, () => {
    // Send Ready Event for Zero Downtime Deployment
    if (process.send) process.send('ready');
    sysLogger.log('Server is running!');
  });

  process.on('SIGINT', () => {
    // Disable KeepAlive to disconnect the client from the old app.
    isDisableKeepAlive = true;
    // Do not receive a new request, and exit process after responding to old requests
    app.close().then(() => {
      sysLogger.error('Server closed');
      process.exit(0);
    });
  });
}
bootstrap();
