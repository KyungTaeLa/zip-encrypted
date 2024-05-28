import { mkdirSync } from 'fs';
import { readdir, rmdir, unlink } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';

export interface IAffixOptions {
  dir?: string;
  prefix?: string;
  suffix?: string;
  defaultName?: string;
}

export interface ITemping {
  clean(): void;
  mkdir(prefix?: string): string;
  path(rawAffixes?: string | IAffixOptions): string;
}
export class Temping implements ITemping {
  #dirsToDelete: string[] = [];

  async deleteDirectoryRecursively(dirPath: string): Promise<void> {
    // 디렉토리 내용을 읽음
    const entries = await readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dirPath, entry.name);

      if (entry.isDirectory()) {
        // 폴더면 재귀로 파일 나올 때 까지 삭제
        await this.deleteDirectoryRecursively(fullPath);
      } else {
        // 파일일 경우 삭제
        await unlink(fullPath);
      }
    }

    // 완료 후 디렉토리 자체를 삭제
    await rmdir(dirPath);
  }

  // delete target remove
  clean() {
    let target;
    while ((target = this.#dirsToDelete.shift()) !== undefined) {
      this.deleteDirectoryRecursively(target);
    }
  }

  // create directory AND save delete target
  mkdir(prefix?: string): string {
    const dirPath = this.path(prefix);

    mkdirSync(dirPath);

    this.#dirsToDelete.push(dirPath);

    return dirPath;
  }

  // generate random name
  path(rawAffixes?: string | IAffixOptions): string {
    return this.path(rawAffixes);
  }

  // generate random name (static method)
  static path(rawAffixes?: string | IAffixOptions): string {
    const now = new Date();

    // set affixes
    const affixes = parseAffixes(rawAffixes);

    const nameArr =
      affixes?.defaultName ??
      [
        affixes.prefix,
        String(now.getFullYear()),
        String(now.getMonth()),
        String(now.getDate()),
        '-',
        String(process.pid),
        '-',
        Math.random().toString(36).substr(2, 11),
        affixes.suffix,
      ].join('');

    return join(affixes.dir || tmpdir(), nameArr);

    // set affixes
    function parseAffixes(rawAffixes?: string | IAffixOptions) {
      let affixes: IAffixOptions = {};

      if (rawAffixes) {
        switch (typeof rawAffixes) {
          case 'string':
            affixes.prefix = rawAffixes;
            break;
          case 'object':
            affixes = rawAffixes;
            break;
          default:
            throw new Error('Unknown affix declaration: ' + rawAffixes);
        }
      }

      return affixes;
    }
  }
}
