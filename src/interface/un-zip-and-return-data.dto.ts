import { ICommon } from './common.interface';
export class IUnZipCommon {
  /**
   * @alias 압축파일 비밀번호
   * @description 미입력시 비밀번호 없이 생성
   */
  zipPassword?: string;

  /**
   * @alias json data 반환 여부
   */
  returnJsonYn?: boolean;

  /**
   * @alias 압축 해제 파일 폴더 경로
   */
  dirPath: string;
}

export class IUnZipToFilePathInput extends IUnZipCommon {
  /**
   * @alias 압축 파일 경로
   */
  url: string;
}

export class IUnZipToFileStreamInput extends IUnZipCommon {
  /**
   * @alias 압축 파일 경로
   */
  zipPath: any;
}

export class IUnZipAndReturnDataOutput extends ICommon {
  /**
   * @alias 압축파일 json 데이터 반환
   */
  jsonData?: any;
}
