import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CredentialsService } from './credentials.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService, CredentialsService],
  exports: [AuthService, CredentialsService],
})
export class AuthModule {}
