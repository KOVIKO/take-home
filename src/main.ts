import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  /** Config for Swagger front-end */
  const config = new DocumentBuilder()
    .setTitle('Satellite Monitor')
    .setDescription('Monitors the altitude of the Funnel satellite')
    .setVersion('1.0')
    .build();

  /** Swagger front-end */
  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('', app, document);

  await app.listen(3000);
}

bootstrap();
