import fs from 'fs';
import * as git from 'isomorphic-git';
import http from 'isomorphic-git/http/node';

export class Git {
  private readonly baseArguments: {
    fs: any;
    http: any;
    headers: any;
    onAuth: any;
  };

  constructor (githubToken: string) {
    this.baseArguments = {
      fs, http,
      headers: {
        'User-Agent': `git/isogit-${git.version()}`,
      },
      onAuth: () => ({
        username: 'unused-with-token',
        password: githubToken,
      })
    }
  }

  async clone({ dir, url } : { dir: string; url: string; }) {
    await git.clone({
      ... this.baseArguments,
      dir,
      url,
    });
  }
}