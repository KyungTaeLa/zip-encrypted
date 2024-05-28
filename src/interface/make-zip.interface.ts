// { type, data, zipPassword, s3UploadInfo }

import { ICommon } from './common.interface';

class IZipDataType {
  jsonData: { [key: string]: any };
  jsonName: string;
}

class IMakeZipCommon {
  /**
   * @alias 압축 파일 생성 폴더
   */
  dirPath: string;

  /**
   * @alias 압축파일 비밀번호
   * @description 미입력시 비밀번호 없이 생성
   */
  zipPassword?: string;
}

export class IMakeZipJsonData extends IMakeZipCommon {
  /**
   * @alias 압축 파일 생성용 json data
   */
  data: IZipDataType[];
}

export class IMakeZipFiles extends IMakeZipCommon {
  /**
   * @alias 압축 파일 생성할 파일 경로들
   */
  filesPath: string[];
}

export class IMakeZipOutput extends ICommon {
  /**
   * @alias 압축파일 경로
   */
  zipPath?: string;

  /**
   * @alias 압축파일 폴더
   */
  dirPath?: string;
}
