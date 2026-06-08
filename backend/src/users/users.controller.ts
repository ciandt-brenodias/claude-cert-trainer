import { Controller, Get } from '@nestjs/common';
import { UsersService } from './users.service';
import { CredentialsService } from '../auth/credentials.service';

@Controller('users/me')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly credentials: CredentialsService,
  ) {}

  @Get('domain-progress')
  getDomainProgress() {
    const { uuid } = this.credentials.load();
    return this.usersService.getDomainProgress(uuid);
  }

  @Get('stats')
  getStats() {
    const { uuid } = this.credentials.load();
    return this.usersService.getStats(uuid);
  }

  @Get('badges')
  getBadges() {
    const { uuid } = this.credentials.load();
    return this.usersService.getBadges(uuid);
  }

  @Get('sessions')
  getSessions() {
    const { uuid } = this.credentials.load();
    return this.usersService.getSessions(uuid);
  }

  @Get('wrong-answers')
  getWrongAnswers() {
    const { uuid } = this.credentials.load();
    return this.usersService.getWrongAnswers(uuid);
  }
}
