import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import type { Credentials } from '@cert-trainer/shared';

const ADJECTIVES = [
  'brave', 'calm', 'clever', 'eager', 'fast', 'gentle', 'happy', 'kind',
  'lively', 'noble', 'proud', 'quiet', 'sharp', 'swift', 'wise', 'witty',
];

const NOUNS = [
  'architect', 'builder', 'coder', 'developer', 'engineer', 'hacker',
  'maker', 'ranger', 'scholar', 'seeker', 'thinker', 'wizard',
];

@Injectable()
export class CredentialsService {
  private readonly logger = new Logger(CredentialsService.name);
  private readonly credentialsPath: string;
  private credentials: Credentials | null = null;

  constructor() {
    // Resolved from backend/src/auth/ → go 4 levels up to project root
    this.credentialsPath = path.resolve(__dirname, '../../../../.credentials.json');
  }

  load(): Credentials {
    if (this.credentials) return this.credentials;

    if (fs.existsSync(this.credentialsPath)) {
      const raw = fs.readFileSync(this.credentialsPath, 'utf-8');
      this.credentials = JSON.parse(raw) as Credentials;
      this.logger.log(`Credentials loaded: ${this.credentials.name} (${this.credentials.uuid})`);
      return this.credentials;
    }

    this.credentials = this.generate();
    fs.writeFileSync(this.credentialsPath, JSON.stringify(this.credentials, null, 2));
    this.logger.log(`Credentials created: ${this.credentials.name} (${this.credentials.uuid})`);
    return this.credentials;
  }

  private generate(): Credentials {
    const name =
      process.env.CURRENT_USER ??
      `${this.randomItem(ADJECTIVES)}-${this.randomItem(NOUNS)}`;

    return { uuid: uuidv4(), name };
  }

  private randomItem<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
  }
}
