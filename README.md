# zip-encrypted

zip-encrypted is a Node.js library based on Linux commands that supports creating and extracting zip files with passwords.

# Installation

```
npm install zip-encrypted
```

# Usage

## makeZip

1. Convert JSON data to JSON files and compress those files into a zip file.

```ts
const { success, dirPath, zipPath } = await makeZip({
  data: [
    {
      jsonData: {
        test1: 'testData1',
        test2: 'testData2',
      },
      jsonName: 'jsonTestName1.json',
    },
    {
      jsonData: {
        test1: 'testData3',
        test2: 'testData4',
      },
      jsonName: 'jsonTestName2.json',
    },
  ],
  zipPassword: '123',
  dirPath: 'C:\\Users\\user\\Desktop\\info\\sam_test_zip',
});
```

2. Compress specified file paths into a zip file.

```ts
const { success, dirPath, zipPath } = await makeZip({
  filesPath: [
    'C:\\Users\\user\\Desktop\\info\\test_zip\\first.json',
    'C:\\Users\\user\\Desktop\\info\\test_zip\\second.json',
  ],
  zipPassword: '123',
  dirPath: 'C:\\Users\\user\\Desktop\\info\\sam_test_zip',
});
```

### Option Description

- Common Request:

  - dirPath
    - type: string
    - Description: Path where the zip file will be created
    - Required: Yes
  - zipPassword
    - type: string
    - Description: Password for creating the zip file (if needed)
    - Required: No

- For compressing JSON data:
  - data
  - Description: JSON data to be compressed into a zip file
    - type:

```
{
  jsonData: { [key: string]: any };
  jsonName: string;
}
```

- For compressing already existing files:

  - filesPath
    - type: string[]
    - Description: Paths of the files to be compressed

- Common Return:
  - success
    - type: boolean
    - Description: Success status
  - error
    - type: string
    - Description: Error message (if any)
  - zipPath
    - type: string
    - Description: Path of the zip file
  - dirPath
    - type: string
    - Description: Folder of the zip file

---

## unZip

1. Download and extract a zip file uploaded on the web.

```ts
const { success, error, jsonData } = await unZip({
  url: 'https://www.example-zip.com',
  dirPath: 'C:\\Users\\user\\Desktop\\info\\test_zip',
  zipPassword: '123',
  returnJsonYn: true,
});
```

2. Extract an already downloaded zip file.

```ts
const { success, error, jsonData } = await unZip({
  zipPath: 'C:\\Users\\user\\Desktop\\info\\test_zip\\a.zip',
  dirPath: 'C:\\Users\\user\\Desktop\\info\\test_zip',
  zipPassword: '123',
  returnJsonYn: true,
});
```

### Option Description

- Common Request:

  - dirPath
    - type: string
    - Description: Folder path for unzipping the file
    - Required: Yes
  - zipPassword
    - type: string
    - Description: Password for the zip file (if needed)
    - Required: No
  - returnJsonYn
    - type: boolean
    - Description: Whether to return JSON data if the extracted file is a JSON file
    - Required: No

- For downloading and extracting a zip file uploaded on the web:

  - url
    - type: string
    - Description: URL where the zip file is uploaded

- For extracting an already downloaded zip file:

  - zipPath
    - type: string
    - Description: Path of the zip file

- Common Return:
  - success
    - type: boolean
    - Description: Success status
  - error
    - type: string
    - Description: Error message (if any)
  - jsonData
    - type: json
    - Description: Data of the JSON file contained in the zip file (if returnJsonYn is true)

# Keywords

zip
zip encrypt
zip-encrypt
zip encrypted
zip-encrypted
unzip
unzip encrypt
unzip-encrypt
unzip encrypted
unzip-encrypted
Installation
bash
