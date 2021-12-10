## 프리온보딩 백엔드 과정 5번째 과제: 휴먼스케이프

[휴먼스케이프](https://humanscape.io/kr/index.html)에서 제공해주신 API 설계 과제입니다. 헤로쿠를 이용해 배포했으며, 주소는 [https://pocky-humanscape-subject.herokuapp.com/](https://pocky-humanscape-subject.herokuapp.com/)입니다.

## 과제에 대한 안내

과제는 임상실험 데이터를 수집하고 조회하는 API 를 제작하는 것입니다.

1. 필수 요구 사항

- 임상정보를 수집하는 batch task 를 제작합니다.
  - 참고: [공공데이터의 질병관리청\_임상연구 과제정보 데이터셋](https://www.data.go.kr/data/3074271/fileData.do#/API%20%EB%AA%A9%EB%A1%9D/GETuddi%3Acfc19dda-6f75-4c57-86a8-bb9c8b103887)
- 수집한 임상정보에 대한 API 를 제작합니다.
  - 특정 임상정보 읽기(키 값은 자유)
- 수집한 임상정보 리스트 API 를 제작합니다.
  - 최근 일주일내에 업데이트(변경사항이 있는) 된 임상정보 리스트를 조회합니다.
  - pagination 기능이 필요합니다.

2. 개발 요구 사항

- ORM 사용 필수, 데이터베이스는 SQLite로 구현해야 합니다.
- secret key, api key 등을 레포지토리에 올리지 않도록 유의합니다.
- 가산점
  - 배포하여 웹에서 사용 할 수 있도록 제공합니다.
  - 임상정보 검색 API 를 제작합니다.

## 데이터베이스 ERD

![데이터베이스 ERD](https://user-images.githubusercontent.com/47234375/141955873-ab5f5be5-b6de-4a34-9da7-bbd1d9b11781.png)

## 개발 환경

- 언어: TypeScript
- 데이터베이스: SQLite3
- 사용 도구: NestJs, typeorm, passport, passport-local, passport-jwt, bcrypt, class-validator, date-fns, xml2json-light, @nestjs/schedule, @nestjs/axios
- 임상 정보 수집을 위해 [식품의약품안전처\_의약품 임상시험 정보](https://www.data.go.kr/data/15056835/openapi.do) API 를 사용했습니다.

## API 문서

포스트맨으로 작성한 [API 문서](https://documenter.getpostman.com/view/18317278/UVR4NVro)에서 상세한 내용을 확인하실 수 있습니다.

## 실행 방법

1. `git clone` 으로 프로젝트를 가져온 후, `npm install` 으로 필요한 패키지를 설치합니다.
2. [식품의약품안전처\_의약품 임상시험 정보](https://www.data.go.kr/data/15056835/openapi.do)에 접속해 공공 데이터 사이트에 로그인을 한 후, 활용신청을 클릭해 일반 인증키를 발급받습니다.
3. 루트 디렉토리에 .env 파일을 생성하고, `SERVICE_URL`은 사이트에 제시하는 요청 주소를, `SERVICE_KEY`에는 일반 인증키를 입력합니다.
4. 개발 환경일 때는`npm run dev`으로, 배포 환경일 때는 `npm run build`으로 빌드한 후 `npm run start:prod`으로 실행합니다.
5. POST `localhost:3000/clinical`을 실행해 임상 시험 정보를 in memory 데이터베이스에 저장하신 후에 조회 기능을 테스트하실 수 있습니다.

## 수행한 작업

### 임상 정보 목록 조회

#### 조회에 필요한 데이터를 입력하기

조회하기 위해선 URI 에 쿼리로 데이터를 입력하셔야 합니다.

```typescript
export class QueryDto {
  @IsString()
  @IsOptional()
  page?: string;

  @IsString()
  @IsOptional()
  GOODS_NAME?: string;

  @IsString()
  @IsOptional()
  APPROVAL_TIME?: string;

  @IsString()
  @IsOptional()
  LAB_NAME?: string;

  @IsString()
  @IsOptional()
  APPLY_ENTP_NAME?: string;

  @IsString()
  @IsOptional()
  CLINIC_EXAM_TITLE?: string;

  @IsString()
  @IsOptional()
  step?: string;
}
```

- page: 몇 페이지인지를 명시합니다. pagination 에 사용하며 필수 값입니다.
- GOODS_NAME: 임상 시험에 사용한 제품 이름입니다. 선택 사항으로, 검색에 사용합니다.
- APPROVAL_TIME: 승인 시간으로 "YYYY-MM-DD" 형식으로 입력해 해당 날짜의 임상 정보를 조회합니다. 선택 사항으로, 만약 이 값을 입력하지 않으면 최근 일주일 사이의 임상 정보를 조회합니다.
- LAB_NAME: 임상 시험을 실시한 기관의 이름입니다. 선택 사항으로, 검색에 사용합니다.
- APPLY_ENTP_NAME: 임상 시험의 신청자입니다. 선택 사항으로, 검색에 사용합니다.
- CLINIC_EXAM_TITLE: 임상 시험의 제목입니다. 선택 사항으로, 검색에 사용합니다.
- step: 임상 시험의 단계입니다. [의약품안전나라 임상시험정보검색](https://nedrug.mfds.go.kr/searchClinic)의 임상시험단계 항목의 값을 문자열로 입력합니다. 선택 사항으로, 검색에 사용합니다.

#### 데이터베이스에 접근해 필요한 임상 정보를 조회합니다.

[clinical.repository.ts](https://github.com/chinsanchung/preonboarding-humanscape/blob/master/src/clinical/clinical.repository.ts)에 임상 정보를 조회하는 코드를 작성했습니다. 레포지토리를 따로 만든 이유는 복잡한 데이터베이스 쿼리로 인해 코드가 길어질 경우 따로 파일을 만들어서 관리하기로 팀원과 협의해서입니다.

---

```typescript
const limit = 10;
const offset = query.page ? (Number(query.page) - 1) * limit : 0;
const conditions = [
  'GOODS_NAME',
  'LAB_NAME',
  'APPLY_ENTP_NAME',
  'CLINIC_EXAM_TITLE',
];
const whereOption = {};
conditions.forEach((el) => {
  if (query[el]) {
    Object.assign(whereOption, { [`${el}`]: Like(`%${query[el]}%`) });
  }
});

if (query.step) {
  Object.assign(whereOption, {
    step: { name: Like(`%${query.step}%`) },
  });
}
```

- 우선 한 번에 출력할 개수, skip 같이 pagination 에 필요한 코드를 작성하고, URI 쿼리에서 검색과 관련된 내용을 `whereOption`에 추가합니다.
- 검색 조건은 모두 선택 사항이기에 해당 조건이 존재하는지를 반복문을 이용해 확인합니다.
- 또한, 임상 시험의 단계도 검색 조건으로서 `whereOption`에 추가합니다.

```typescript
if (query.APPROVAL_TIME) {
  const UTCZeroApprovalTime = subHours(new Date(query.APPROVAL_TIME), 9);
  const datePeriod = [
    UTCZeroApprovalTime.toISOString(),
    add(UTCZeroApprovalTime, {
      hours: 23,
      minutes: 59,
      seconds: 59,
    }).toISOString(),
  ];

  Object.assign(whereOption, {
    APPROVAL_TIME: Between(datePeriod[0], datePeriod[1]),
  });
} else {
  Object.assign(whereOption, {
    APPROVAL_TIME: MoreThanOrEqual(
      subDays(
        set(new Date(), {
          hours: 0,
          minutes: 0,
          seconds: 0,
          milliseconds: 0,
        }),
        6,
      ).toISOString(),
    ),
  });
}
```

- 승인 시간을 처리합니다. 시간을 제어하기 위해 [moment-timezone](https://www.npmjs.com/package/moment-timezone) 대신 [date-fns](https://www.npmjs.com/package/date-fns)를 사용했습니다.
  - 이유 1: momentjs 는 날짜를 계산하려면 인스턴스를 만들어야하는데, 즉 불필요한 함수까지 전부 가져와 애플리케이션을 빌드했을 때 용량이 커집니다. 반면 date-fns 는 필요한 함수만을 따로 가져와 사용할 수 있어 빌드했을 떄의 용량을 줄일 수 있습니다.
  - 이유 2: momentjs 에서 인스턴스를 생성하여 계산하는 과정에서 date-fns 보다 많은 시간을 소요합니다.
  - 위의 글은 [momentjs vs date-fns](https://medium.com/@k2u4yt/momentjs-vs-date-fns-6bddc7bfa21e)을 참고했습니다.
- 승인 시간이 존재하면 그 날짜 하루를 조건으로 정합니다. SQLite3 에서는 한국과 달리 9시간 이전으로 앞당긴 UTC+0 시간대를 사용합니다. 그에 따라 9시간을 빼 UTC+0 시간대로 만들고, 거기에 23시 59분 59초를 더해 조건을 만들었습니다.
- 승인 시간이 존재하지 않을 경우 오늘 날짜를 0시 0분 0초로 지정해 불러온 후 6일을 빼서 6일 전 ~ 오늘까지 7일의 임상 정보를 조회하도록 설정했습니다.
  - 이번에 UTC+0 시간대로 만들지 않은 이유는 date-fns 의 `set` 함수로 변환한 값이 UTC+0 시간대로 변환하기 때문입니다.

### 임상 정보 상세 조회

```typescript
async function findOneClinical(id: number): Promise<Clinical> {
  const result = await this.clinicalRepository.findOne(id);
  if (!result) {
    throw new NotFoundException('유효한 임상 번호가 아닙니다.');
  }
  return result;
}
```

URI 의 파라미터로부터 얻은 아이디로 임상 정보를 조회합니다.

## 리펙토링

### 임상 정보를 저장할 때의 승인 시간 설정

[clinical.service.ts](https://github.com/chinsanchung/preonboarding-humanscape/blob/master/src/clinical/clinical.service.ts)에서의 리펙토링입니다.

API 에서 제공하는 승인 시간은 "2012-02-28 00:00:00"으로 시, 분, 초를 모두 0으로 하고 있습니다. 하지만 기존의 코드에서는 저장할 당시의 모든 시간을 저장하고, UTC+0 시간대로 변환하지 않으며, date-fns 가 아닌 moment-timezone 을 사용하고 있었습니다.

```typescript
// 기존의 코드
function convertKstToUtc(time): string {
  const KSTApprovalTime = new Date(time).getTime();
  const modifiedApprovalTime = moment(KSTApprovalTime).format(
    'YYYY-MM-DD HH:mm:ss',
  );

  return modifiedApprovalTime;
}
clinical.APPROVAL_TIME = this.convertKstToUtc(clinical.APPROVAL_TIME);
```

```typescript
// 수정한 코드
clinical.APPROVAL_TIME = set(new Date(clinical.APPROVAL_TIME), {
  hours: 0,
  minutes: 0,
  seconds: 0,
  milliseconds: 0,
});
```

- 빌드할 용량을 줄이고 시간을 절약하기 위해 moment-timezone 을 제거하고 date-fns 의 `set` 함수를 사용했습니다.
  - `set` 함수로 시, 분, 초를 설정할 수 있는데, UTC+0 시간대에 시, 분, 초를 모두 0으로 설정하여 저장하도록 수정했습니다.

### 임상 정보 목록을 조회할 때의 승인 시간 설정

[clinical.repository.ts](https://github.com/chinsanchung/preonboarding-humanscape/blob/master/src/clinical/clinical.repository.ts)에서의 리펙토링입니다.

승인 시간의 시, 분, 초를 0으로 설정하면서, 조회할 때의 시간 설정도 변경할 필요가 있었습니다.

1. 승인 시간을 지정한 경우

```typescript
// 기존의 코드
Object.assign(whereOption, {
  APPROVAL_TIME: Between(
    subDays(subHours(new Date(query.APPROVAL_TIME), 9), 1).toISOString(),
    subDays(addHours(new Date(query.APPROVAL_TIME), 15), 1).toISOString(),
  ),
});
```

```typescript
// 수정한 코드
const UTCZeroApprovalTime = subHours(new Date(query.APPROVAL_TIME), 9);
const datePeriod = [
  UTCZeroApprovalTime.toISOString(),
  add(UTCZeroApprovalTime, {
    hours: 23,
    minutes: 59,
    seconds: 59,
  }).toISOString(),
];

Object.assign(whereOption, {
  APPROVAL_TIME: Between(datePeriod[0], datePeriod[1]),
});
```

- `new Date(query.APPROVAL_TIME)`을 두 번 선언해 중복이 발생하는 것을 막기 위해 `UTCZeroApprovalTime` 변수를 만들었습니다.
- 시간 조건을 0시 0분 0초 ~ 23시 59분 59초로 설정했습니다. 위의 코드를 그대로 사용하면 이틀을 조회하기 떄문입니다.

2. 승인 시간을 지정하지 않은 경우

```typescript
subDays(
  set(new Date(), {
    hours: 0,
    minutes: 0,
    seconds: 0,
    milliseconds: 0,
  }),
  6,
).toISOString();
```

date-fns 의 `set` 함수로 변환한 값이 UTC+0 시간대로 변환하기에 수정하지 않았습니다.

### 로컬 환경에서의 테스트를 위해 createAllDataForInitialSetting 메소드 작성

[clinical.controller.ts](https://github.com/chinsanchung/preonboarding-humanscape/blob/master/src/clinical/clinical.controller.ts), [clinical.service.ts](https://github.com/chinsanchung/preonboarding-humanscape/blob/master/src/clinical/clinical.service.ts)에서의 리펙토링입니다.

기존에는 서버를 실행하면 `@nest/schedule`을 이용해 10초 간격으로 데이터를 저장했습니다. 하지만 초기 데이터를 저장하는데 오랜 시간이 걸려 테스트를 수행할 준비가 됐는지 확인이 어려운 점, 그리고 직접 결과를 확인하는 것이 더 좋다고 생각해서 위의 기능을 제거하고 컨트롤러와 서비스에 `createAllDataForInitialSetting`메소드를 제작했습니다.

POST `localhost:3000/clinical`으로 임상 시험 정보를 불러온 후 in memory 데이터베이스에 저장합니다.

### process.env.SERVICE_URL 추가 및 env 파일의 데이터 검증

[clinical.repository.ts](https://github.com/chinsanchung/preonboarding-humanscape/blob/master/src/clinical/clinical.repository.ts)에서의 리펙토링입니다.

2021년 12월 10일, 테스트를 위해 애플리케이션을 실행했는데 공공 데이터 API의 요청 URL이 달라져서 에러가 발생했습니다. 요청 URL이 바뀌는 점을 감안하여, .env에 `SERVICE_URL`을 직접 입력해서 앞으로 URL이 바뀌더라도 대응할 수 있도록 했습니다.

또한, .env 파일에 `SERVICE_URL`, `SERVICE_KEY`가 존재하는지를 [Joi](https://www.npmjs.com/package/joi)를 이용해 처음에 검증하는 과정을 거치도록 했습니다.

### 헤로쿠의 서버 정지 대응하기

[clinical.service.ts](https://github.com/chinsanchung/preonboarding-humanscape/blob/master/src/clinical/clinical.service.ts)에서의 리펙토링입니다.

헤로쿠는 30분동안 요청이 없으면 서버를 정지 상태로 만들기 떄문에 매주 batch task 를 하기 어렵습니다. 그것을 해결하기 위해 우선 23시 50분에 헤로쿠 URL을 요청해 서버를 꺠우고, 24시에 batch task 를 실행하도록 했습니다.

또한, 헤로쿠는 UTC+0 시간대를 사용하기 떄문에, `@nest/schedule`의 시간을 UTC+0 시간대로 설정했습니다.

```typescript
export class ClinicalService {
  // 월 ~ 금요일 0시 0분 0초(한국 시간대)에 배치 작업 수행
  @Cron('0 0 15 * * 1-6')
  async batchData(): Promise<void> {
    // api에서 데이터를 가져온다 totalCount를 읽는다
    const apiTotalCount = await this.getApiTotalCount();
    // db clinical 테이블 전체 데이터갯수를 가져온다
    const dbTotalCount = await this.clinicalRepository.count();

    // api에서 가져온 totalCount가 clinical 테이블 전체 데이터 갯수보다 많은 경우 현재 테이블 로우 에서 끝까지 db에 넣는다
    if (apiTotalCount > dbTotalCount) {
      const start = dbTotalCount % CLINICAL_CONSTANT.NUM_OF_ROWS;
      let pageNo = Math.floor(dbTotalCount / CLINICAL_CONSTANT.NUM_OF_ROWS) + 1;

      let data = await this.getAPIData(pageNo, start);
      // API에서 빈 페이지를 가져오면 while 종료
      while (data) {
        pageNo++;
        data = await this.getAPIData(pageNo);
      }
    }
  }

  @Cron('0 50 14 * * 1-6')
  async awakeHerkuServer(): Promise<void> {
    return this.httpService
      .get('https://preonboarding-cardoc-api.herokuapp.com/')
      .toPromise()
      .then(() => {
        return;
      });
  }
}
```

## 폴더 구조

```bash
+---.github
|       PULL_REQUEST_TEMPLATE.md
|
+---src
|   |   app.controller.spec.ts
|   |   app.controller.ts
|   |   app.module.ts
|   |   app.service.ts
|   |   main.ts
|   |
|   +---clinical
|   |   |   clinical.constants.ts
|   |   |   clinical.controller.spec.ts
|   |   |   clinical.controller.ts
|   |   |   clinical.module.ts
|   |   |   clinical.repository.ts
|   |   |   clinical.service.spec.ts
|   |   |   clinical.service.ts
|   |   |
|   |   +---dto
|   |   |       Query.dto.ts
|   |   |
|   |   \---entities
|   |           clinical.entity.ts
|   |
|   +---core
|   |   \---entities
|   |           core.entity.ts
|   |
|   \---step
|       |   step.controller.ts
|       |   step.module.ts
|       |   step.service.ts
|       |
|       +---dto
|       |       create-step.dto.ts
|       |       update-step.dto.ts
|       |
|       \---entities
|               step.entity.ts
|- .eslintrc.js
|- .gitignore
|- .prettierrc
|- nest-cli.json
|- package-lock.json
|- package.json
|- Procfile
|- README.md
|- tsconfig.build.json
|- tsconfig.json
```
