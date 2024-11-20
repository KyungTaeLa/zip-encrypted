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
        let jsonContent = JSON.parse(rawContent);

        // emp에서 온 결과 데이터 중에 2중 json parsing 해야 하는 경우가 있다..
        if (typeof jsonContent === 'string') {
          try {
            jsonContent = jsonContent.replace(/\n/gi, '\\n');
            jsonContent = jsonContent.replace(/\r/gi, '\\r');
            jsonContent = jsonContent.replace(/\\/gi, '\\\\');
            jsonContent = JSON.parse(jsonContent);
          } catch (error) {
            throw {
              success: false,
              error: `[JSON parsing error] - ${error.message}`,
            };
          }
        }
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
