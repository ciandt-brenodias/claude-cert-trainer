import { Controller, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import type { UserProfile } from '@cert-trainer/shared';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('me')
  getProfile(): Promise<UserProfile> {
    return this.authService.getProfile();
  }
}
