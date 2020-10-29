import { Client, ConnectConfig, ExecOptions, SFTPWrapper } from 'ssh2';
import { InputAttributes, FileEntry, Stats } from 'ssh2-streams';

export { ConnectConfig };

interface ExecResult {
  stdout: string;
  stderr: string;
  code: number;
  signal: string;
}

export class SSHClient {
  private readonly conn = new Client();
  public readonly sftp = new SFTP(this.conn);

  async connect(options: ConnectConfig) {
    return await new Promise<void>((resolve, reject) => {

      const removeListeners = () => {
        this.conn.removeListener('error', onError);
        this.conn.removeListener('ready', onReady);
      };

      const onError = (err: Error) => {
        removeListeners();
        reject(err);
      };

      const onReady = () => {
        removeListeners();
        resolve();
      };

      this.conn.once('error', onError);
      this.conn.once('ready', onReady);

      this.conn.connect(options);
    });
  }

  end() {
    this.conn.end();
  }

  async exec(command: string, env?: { [key: string]: string; }) {
    const ret = await this.execImpl(command, { env });
    if (ret.stderr) {
      throw new Error(`Command has error output : '${ret.stderr}'`);
    }

    if (ret.signal) {
      throw new Error(`Command received signal ${ret.signal}`);
    }

    if (ret.code) {
      throw new Error(`Command returned error code ${ret.code}`);
    }

    return ret.stdout;
  }

  private async execImpl(command: string, options: ExecOptions = {}) {
    return await new Promise<ExecResult>((resolve, reject) => {
      this.conn.exec(command, options, (err, stream) => {
        if(err) {
          return reject(err);
        }

        let stdout = Buffer.alloc(0);
        let stderr = Buffer.alloc(0);

        const ret: ExecResult = {
          stdout: null,
          stderr: null,
          code: null,
          signal: null
        };

        stream.on('exit', (code, signal) => {
          ret.code   = code;
          ret.signal = signal;
        });

        stream.on('close', () => {
          ret.stdout = stdout.toString();
          ret.stderr = stderr.toString();

          resolve(ret);
        });

        stream.on('data', (data: Buffer) => {
          stdout = Buffer.concat([ stdout, data ]);
        });

        stream.stderr.on('data', (data: Buffer) => {
          stderr = Buffer.concat([ stderr, data ]);
        });

      });
    });
  }
}

export class SFTP {
  private sftpImpl: SFTPWrapper;

  constructor(private readonly conn: Client) {
  }

  async readdir(location: string) {
    return await this.sftpCall<FileEntry[]>('readdir', location);
  }

  async mkdir(path: string, attributes?: InputAttributes) {
    return await this.sftpCall('mkdir', path, attributes);
  }

  async rmdir(path: string) {
    return await this.sftpCall('rmdir', path);
  }

  async unlink(path: string) {
    return await this.sftpCall('unlink', path);
  }

  async rename(srcPath: string, destPath: string) {
    return await this.sftpCall('rename', srcPath, destPath);
  }

  private async open(filename: string, mode: string, attributes?: InputAttributes) {
    return await this.sftpCall<Buffer>('open', filename, mode, attributes);
  }

  private async close(handle: Buffer) {
    return await this.sftpCall('close', handle);
  }

  private async fstat(handle: Buffer) {
    return await this.sftpCall<Stats>('fstat', handle);
  }

  private async read(handle: Buffer, buffer: Buffer, offset: number, length: number, position: number) {
    return await this.sftpCall('read', handle, buffer, offset, length, position);
  }

  private async write(handle: Buffer, buffer: Buffer, offset: number, length: number, position: number) {
    return await this.sftpCall('write', handle, buffer, offset, length, position);
  }

  async writeFile(path: string, buffer: Buffer, attrs?: InputAttributes) {
    const handle = await this.open(path, 'w', attrs);
    try {
      await this.write(handle, buffer, 0, buffer.length, 0);
    } finally {
      await this.close(handle);
    }
  }

  async readFile(path: string) {
    const handle = await this.open(path, 'r');
    try {
      const { size } = await this.fstat(handle);
      const buffer = Buffer.allocUnsafe(size);
      await this.read(handle, buffer, 0, buffer.length, 0);
      return buffer;
    } finally {
      await this.close(handle);
    }
  }

  private async sftpCall<TResult=void>(name: keyof SFTPWrapper, ...args: any[]) {
    const sftp = await this.getSftp();

    return await new Promise<TResult>((resolve, reject) => {
      ((sftp[name]) as Function)(...args,  (err: Error, res: TResult) => {
        if (err) {
          reject(err);
        } else {
          resolve(res);
        }
      });
    });
  }

  private async getSftp() {
    if (this.sftpImpl) {
      return this.sftpImpl;
    }

    return await new Promise<SFTPWrapper>((resolve, reject) => {
      this.conn.sftp((err, sftp) => {
        if (err) {
          return reject(err);
        }

        this.sftpImpl = sftp;
        resolve(sftp);
      });
    });
  }
}
