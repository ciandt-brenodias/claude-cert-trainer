import { Test } from '@nestjs/testing';
import * as fs from 'fs';
import * as path from 'path';
import { CredentialsService } from './credentials.service';

jest.mock('fs');

const mockFs = fs as jest.Mocked<typeof fs>;

describe('CredentialsService', () => {
  let service: CredentialsService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [CredentialsService],
    }).compile();
    service = module.get(CredentialsService);
  });

  it('loads credentials from file when it exists', () => {
    const existing = { uuid: 'existing-uuid', name: 'TestUser' };
    mockFs.existsSync.mockReturnValue(true);
    mockFs.readFileSync.mockReturnValue(JSON.stringify(existing));

    const result = service.load();

    expect(result).toEqual(existing);
    expect(mockFs.writeFileSync).not.toHaveBeenCalled();
  });

  it('generates and persists credentials when file does not exist', () => {
    mockFs.existsSync.mockReturnValue(false);

    const result = service.load();

    expect(result.uuid).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
    expect(result.name).toBeTruthy();
    expect(mockFs.writeFileSync).toHaveBeenCalledWith(
      expect.any(String),
      expect.stringContaining(result.uuid),
    );
  });

  it('uses CURRENT_USER env var as name when generating', () => {
    mockFs.existsSync.mockReturnValue(false);
    process.env.CURRENT_USER = 'EnvUser';

    const result = service.load();

    expect(result.name).toBe('EnvUser');
    delete process.env.CURRENT_USER;
  });

  it('returns cached credentials on subsequent calls', () => {
    const existing = { uuid: 'cached-uuid', name: 'CachedUser' };
    mockFs.existsSync.mockReturnValue(true);
    mockFs.readFileSync.mockReturnValue(JSON.stringify(existing));

    service.load();
    service.load();

    expect(mockFs.existsSync).toHaveBeenCalledTimes(1);
  });
});
