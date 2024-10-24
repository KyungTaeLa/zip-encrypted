import { readFileSync, readdirSync } from 'fs';
import * as https from 'https';
import { basename, extname, join } from 'path';

export async function fetchStream(url: string, config: any): Promise<any> {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: config.headers }, res => {
        if (res.statusCode !== 200) {
          reject(
            new Error(
              `Failed to download stream. erorr code is : ${res.statusCode}`,
            ),
          );
          return;
        }
        resolve({ data: res });
      })
      .on('error', e => {
        reject(e);
      });
  });
}

/**
 * @alias json 파일 객체화
 */
export const readJsonFilesFromDirectory = async (
  directory: string,
): Promise<any> => {
  try {
    // 폴더에 있는 파일 리스트
    const files = readdirSync(directory);
    const jsonData = {};

    for (const file of files) {
      // json 확장자 파일만 확인
      if (extname(file) === '.json') {
        const rawContent = readFileSync(join(directory, file), 'utf8');
        // json data parsing
        const jsonContent = JSON.parse(rawContent);
        // 파일명을 key로 하여 json data 객체에 추가
        jsonData[file] = jsonContent;
      }
    }

    return jsonData;
  } catch (error) {
    throw {
      success: false,
      error: `[JSON converting error] - ${error.message}`,
    };
  }
};
