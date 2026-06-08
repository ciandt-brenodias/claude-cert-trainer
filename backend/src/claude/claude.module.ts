import { Module } from '@nestjs/common';
import { ClaudeService } from './claude.service';
import { ClaudeController } from './claude.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ClaudeController],
  providers: [ClaudeService],
})
export class ClaudeModule {}
