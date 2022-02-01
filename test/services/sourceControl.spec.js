import fs from 'fs';
import git from 'isomorphic-git';
import SourceControlService from '../../app/services/sourceControl';

jest.mock('fs');
jest.mock('isomorphic-git');

function hasSourceControlEnabledCheck(service, path, expectedReturn) {
  return expect(service.hasSourceControlEnabled(path)).resolves.toBe(expectedReturn);
}

describe('services', () => {
  /*
  beforeEach(() => {
    fs.readFileSync = jest.fn();
  });

  afterEach(() => {
    fs.readFileSync.mockClear();
  });
  */

  describe('sourceControl', () => {
    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    describe('hasSourceControlEnabled', () => {
      it('should return false for empty file paths', () => {
        const service = new SourceControlService();
        hasSourceControlEnabledCheck(service, null, false);
        hasSourceControlEnabledCheck(service, undefined, false);
        hasSourceControlEnabledCheck(service, '', false);
      });

      it('should return false for invalid file path', () => {
        fs.accessSync.mockImplementationOnce(() => {
          throw new Error();
        });
        const service = new SourceControlService();
        hasSourceControlEnabledCheck(service, '/Invalid/Path', false);
      });

      it('should return false for valid file path with no branches', async () => {
        fs.accessSync.mockImplementationOnce(() => {
          /* NOP */
        });
        git.listBranches.mockImplementationOnce(() => {
          return [];
        });
        const service = new SourceControlService();
        hasSourceControlEnabledCheck(service, '/Valid/Path', false);
      });

      it('should return true for valid file path with one branch', async () => {
        fs.accessSync.mockImplementationOnce(() => {
          /* NOP */
        });
        git.listBranches.mockImplementationOnce(() => {
          return ['main'];
        });
        const service = new SourceControlService();
        hasSourceControlEnabledCheck(service, '/Valid/Path', true);
      });
    });

    describe('getFileHistory', () => {
      it('should return null for empty project paths', () => {
        const service = new SourceControlService();
        expect(service.getFileHistory(null, 'test.txt')).resolves.toBeNull();
        return expect(service.getFileHistory(undefined, 'test.txt')).resolves.toBeNull();
      });

      it('should return null for empty file paths', () => {
        const service = new SourceControlService();
        expect(service.getFileHistory('/test/path', null)).resolves.toBeNull();
        return expect(service.getFileHistory('/test/path', undefined)).resolves.toBeNull();
      });

      it('should return an empty array for invalid file path', async () => {
        const service = new SourceControlService();
        // eslint-disable-next-line prettier/prettier
        return expect(service.getFileHistory('/Invalid/Path', 'DoesNotExist.txt')).resolves.toStrictEqual([]);
      });

      it('should format history objects', async () => {
        git.log.mockImplementationOnce(() => {
          return [
            {
              commit: {
                message: 'Test 2',
                committer: {
                  name: 'Test Person2',
                  email: 'test2@test.com',
                  timestamp: 1234567890,
                  timezoneOffset: 360
                }
              }
            },
            {
              commit: {
                message: 'Test',
                committer: {
                  name: 'Test Person',
                  email: 'test@test.com',
                  timestamp: 123456789,
                  timezoneOffset: 0
                }
              }
            }
          ];
        });
        const service = new SourceControlService();
        // eslint-disable-next-line prettier/prettier
        return expect(service.getFileHistory('/Root/Path', 'File.txt')).resolves.toStrictEqual([
          {
            message: 'Test 2',
            committer: 'Test Person2 (test2@test.com)',
            timestamp: new Date((1234567890 - 360 * 60) * 1000)
          },
          {
            message: 'Test',
            committer: 'Test Person (test@test.com)',
            timestamp: new Date(123456789000)
          }
        ]);
      });
    });
  });
});
