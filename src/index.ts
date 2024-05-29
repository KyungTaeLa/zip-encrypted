import { SpawnOptionsWithoutStdio, spawn } from 'child_process';
import {
  IMakeZipFiles,
  IMakeZipJsonData,
  IMakeZipOutput,
} from './interface/make-zip.interface';
import { writeFile } from 'fs/promises';
import { createWriteStream, existsSync, mkdirSync, unlinkSync } from 'fs';
import { basename, dirname, join } from 'path';
import {
  IUnZipAndReturnDataOutput,
  IUnZipToFilePathInput,
  IUnZipToFileStreamInput,
} from './interface/un-zip-and-return-data.dto';
import { fetchStream, readJsonFilesFromDirectory } from './common';
import { Temping } from './temping';

/**
 * @alias json Data compression function
 * @alias json data 압축 함수
 */
function makeZip(input: IMakeZipJsonData): Promise<IMakeZipOutput>;
/**
 * @alias Specified file compression function
 * @alias 지정한 파일 압축 함수
 */
function makeZip(input: IMakeZipFiles): Promise<IMakeZipOutput>;

/**
 * @alias 압축 파일 만들기 함수
 * @description 오버로드된 유형에 따라 json 데이터나 파일을 압축하는 기능입니다.
 * @alias make zip function
 * @description This is a function that compresses json data or files depending on the overloaded type.
 */
async function makeZip(
  input: IMakeZipJsonData | IMakeZipFiles,
): Promise<IMakeZipOutput> {
  const temp = new Temping();
  const fileList = [];
  try {
    // 지정한 경로가 존재하지 않는 경우 폴더 생성
    // Create folder if the specified path does not exist
    if (!existsSync(input.dirPath)) {
      mkdirSync(input.dirPath, { recursive: true });
    }

    // 압축 파일 경로 생성
    // Create zip file path
    const zipPath = temp
      .path({ dir: input.dirPath, suffix: 'zip' })
      .replace(/\\/g, '/');

    let options: SpawnOptionsWithoutStdio;
    if ('data' in input) {
      // JSON 데이터를 파일로 저장
      // save JSON data as file
      for (const one of input.data) {
        const jsonPath = temp
          .path({ dir: input.dirPath, defaultName: one.jsonName })
          .replace(/\\/g, '/');
        fileList.push(one.jsonName);
        await writeFile(jsonPath, JSON.stringify(one.jsonData));
      }

      // spawn 옵션에 json 파일 경로 지정
      // specify json file path in spawn option
      options = {
        cwd: input.dirPath,
      };
    } else {
      // arguments로 들어온 압축 대상 파일 경로 기록
      // record the compression target file path entered as arguments
      fileList.push(
        input.filesPath.map(one => basename(one).replace(/\\/g, '/')),
      );

      // spawn 옵션에 압축 대상 파일 경로 지정
      // specify the path to the compressed file in the spawn option
      options = {
        cwd: dirname(input.filesPath[0]),
      };
    }

    return await new Promise(async (resolve, reject) => {
      const args = [];
      // arguments로 비밀번호가 입력 되었을 경우 zip 파일에 비밀번호 생성
      // If a password is entered as arguments, a password is created in the zip file.
      if (input.zipPassword) {
        args.push('-P');
        args.push(input.zipPassword);
      }
      // 압축 대상 파일에 폴더 경로 제거
      // Remove folder path from compressed target file
      args.push('-r');
      // zip 파일 경로 지정
      // Specify zip file path
      args.push(zipPath);
      // 압축 대상 파일 지정
      // Specify the file to be compressed
      args.push(fileList.join(' '));

      // 압축
      // make the zip
      const zip = spawn('zip', args, options);

      // 에러 발생 시
      // When an error occurs
      zip.on('error', error => {
        reject(error);
      });

      zip.on('close', async code => {
        // code 0 이면 성공
        // If code is 0, success
        if (code === 0) {
          resolve({
            // 성공여부
            // Success or not
            success: true,
            // 압축 파일 폴더 경로
            // zip file folder path
            dirPath: input.dirPath.replace(/\\/g, '/'),
            // 압축 파일 경로
            // zip file path
            zipPath,
          });
        } else {
          reject(new Error(`zip failed with code: ${code}`));
        }
      });
    });
  } catch (e) {
    throw {
      success: false,
      error: `[Error creating zip file] - ${e.message}`,
    };
  } finally {
    // json data를 압축한 경우 임시로 만든 json 파일 삭제
    // If json data is compressed, delete the temporarily created json file
    if ('data' in input) {
      for (const deleteList of fileList) {
        unlinkSync(join(input.dirPath, deleteList));
      }
    }
  }
}

/**
 * @alais 압축 파일 다운로드 후 압축 해제 하는 함수
 * @alais Function to uncompress a compressed file after downloading it
 */
function unZip(
  input: IUnZipToFilePathInput,
): Promise<IUnZipAndReturnDataOutput>;

/**
 * @alias 지정된 경로에 있는 압축파일을 해제 하는 함수
 * @alias Function to unpack the compressed file in the specified path.
 */
function unZip(
  input: IUnZipToFileStreamInput,
): Promise<IUnZipAndReturnDataOutput>;

/**
 * @alias 압축 해제 후 json 파일 데이터 및 파일 반환
 * @description
 * 1. 웹에 올라가 있는 압축파일 stream 형태로 다운로드 or 로컬 경로에 있는 압축 파일 경로 받음
 * 2. 압축파일 임시 폴더에 다운로드
 * 3. 암호가 있는 압축파일 임시 폴더에 해제
 * 4. 해제된 파일 중 json 파일들만 각 파일명을 키로 하는 json 데이터로 변환하여 한 객체로 합친 뒤 반환
 * ex) 압축 해제 후 data1.json, data2.json 파일이 있으면
 * @returns { success : true , jsonData : { data1 : { ...json 내용 }, data2: { ...json 내용 }  } }
 *
 * @alias Return json file data and file after decompression
 * @description
 * 1. Download compressed file stream from the web or receive compressed file path from local path.
 * 2. Download compressed file to temporary folder
 * 3. Release the compressed file with password to a temporary folder.
 * 4. Among the released files, only the json files are converted to json data with each file name as the key, combined into one object, and returned.
 * ex) If there are data1.json and data2.json files after decompression,
 * @returns { success : true , jsonData : { data1 : { ...json content }, data2: { ...json content } } }
 */
async function unZip(
  input: IUnZipToFilePathInput | IUnZipToFileStreamInput,
): Promise<IUnZipAndReturnDataOutput> {
  const temp = new Temping();
  try {
    let dirPath: string;
    let zipPath: string;
    // 웹상에 올라가있는 압축파일일 경우
    // If it is a compressed file posted on the web
    if ('url' in input) {
      // 임시 폴더 생성
      // Create temporary folder
      dirPath = input.dirPath;

      // zip 파일 경로 지정
      // Specify zip file path
      zipPath = temp.path({ dir: dirPath, suffix: '.zip' }).replace(/\\/g, '/');

      // stream 형태로 zip 파일 다운로드
      // Download zip file in stream format
      const response = await fetchStream(input.url, {
        responseType: 'stream',
      });

      // zip 파일 stream으로 읽기
      // read to zip file stream
      const fileWriterStream = createWriteStream(zipPath);
      response.input.pipe(fileWriterStream);

      await new Promise((resolve, reject) => {
        fileWriterStream.on('finish', resolve);
        fileWriterStream.on('error', reject);
      });
    } else {
      zipPath = input.zipPath.replace(/\\/g, '/');
      dirPath = basename(zipPath);
    }

    return await new Promise(async (resolve, reject) => {
      const args = [];

      // arguments에 비밀번호가 있는 경우 비밀번호로 압축파일 해제
      // If there is a password in arguments, unzip the compressed file with the password.
      if (input.zipPassword) {
        args.push('-P');
        args.push(input.zipPassword);
      }
      args.push('-d');
      args.push(dirPath);
      args.push(zipPath);

      const unzip = spawn('unzip', args);
      unzip.on('error', error => {
        reject(error);
      });

      unzip.on('close', async code => {
        if (code === 0) {
          if (input.returnJsonYn === true) {
            // 압축 해제한 파일들 있는 임시 폴더에 있는 json 파일들 한 객체에 추가
            // Add json files in the temporary folder containing the unzipped files to one object
            const jsonData = await this.readJsonFilesFromDirectory(dirPath);

            // json data 같이 반환
            // return with json data
            resolve({ success: true, jsonData });
          } else {
            // json data 미반환
            // json data not returned
            resolve({ success: true });
          }
        } else {
          reject(new Error(`Unzip failed with code: ${code}`));
        }
      });
    });
  } catch (error) {
    throw {
      success: false,
      error: `[Error unzip] - ${error.message}`,
    };
  }
}

export { makeZip, unZip };
