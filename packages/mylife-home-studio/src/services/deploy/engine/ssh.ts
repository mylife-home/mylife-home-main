import { Client, ConnectConfig, ExecOptions, SFTPWrapper } from 'ssh2';

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
    const createSftpCall = (name ) => async (...args) => {
      const sftp = await this.getSftp();

      return await new Promise((resolve, reject) => {
        sftp[name](...args, (err, result) => {
          if(err) {
            return reject(err);
          }

          resolve(result);
        });
      });
    };

    this.sftp = {
      readdir    : createSftpCall('readdir'),
      mkdir      : createSftpCall('mkdir'),
      rmdir      : createSftpCall('rmdir'),
      unlink     : createSftpCall('unlink'),
      rename     : createSftpCall('rename'),

      writeFile  : async (...args) => await this._stfpWriteFile(...args),
      readFile   : async (...args) => await this._sftpReadFile(...args),
    };

    this._sftpOpen  = createSftpCall('open');
    this._sftpClose = createSftpCall('close');
    this._sftpFStat = createSftpCall('fstat');
    this._sftpRead  = createSftpCall('read');
    this._sftpWrite = createSftpCall('write');
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

  async _stfpWriteFile(path, buffer, attrs) {
    const handle = await this._sftpOpen(path, 'w', attrs);
    try {
      await this._sftpWrite(handle, buffer, 0, buffer.length, 0);
    } finally {
      await this._sftpClose(handle);
    }
  }

  async _sftpReadFile(path) {
    const handle = await this._sftpOpen(path, 'r');
    try {
      const { size } = await this._sftpFStat(handle);
      const buffer = Buffer.allocUnsafe(size);
      await this._sftpRead(handle, buffer, 0, buffer.length, 0);
      return buffer;
    } finally {
      await this._sftpClose(handle);
    }
  }
}