# 휴먼스케이프-subject

원티드x위코드 백엔드 프리온보딩 5번째 과제입니다.

## 제출 기업 정보

- 기업명 : 휴먼스케이프([홈페이지](https://humanscape.io/kr/index.html))

## 과제 : 임상실험 데이터 수집 API 구현

### **[필수 포함 사항]**

- [READ.ME](http://READ.ME) 작성
  - 프로젝트 빌드, 자세한 실행 방법 명시
  - 구현 방법과 이유에 대한 간략한 설명
  - 완료된 시스템이 배포된 서버의 주소
  - 해당 과제를 진행하면서 회고 내용 블로그 포스팅
- Swagger나 Postman을 이용하여 API 테스트 가능하도록 구현

### 확인 사항

- **ORM 사용 필수**
- **데이터베이스는 SQLite로 구현**
- **secret key, api key 등을 레포지토리에 올리지 않도록 유의**
  - README.md 에 관련 설명 명시 필요

### 도전 과제: 스스로에게도 도움이 되는 내용 + 추가 가산점

- 배포하여 웹에서 사용 할 수 있도록 제공
- 임상정보 검색 API 제공

### 과제 안내

다음 사항들을 충족하는 서비스를 구현해주세요.

- 임상정보를 수집하는 batch task
  - 참고: [https://www.data.go.kr/data/3074271/fileData.do#/API 목록/GETuddi%3Acfc19dda-6f75-4c57-86a8-bb9c8b103887](https://www.data.go.kr/data/3074271/fileData.do#/API%20%EB%AA%A9%EB%A1%9D/GETuddi%3Acfc19dda-6f75-4c57-86a8-bb9c8b103887)
- 수집한 임상정보에 대한 API
  - 특정 임상정보 읽기(키 값은 자유)
- 수집한 임상정보 리스트 API
  - 최근 일주일내에 업데이트(변경사항이 있는) 된 임상정보 리스트
    - pagination 기능
- **Test 구현시 가산점이 있습니다.**

## 조원

| 이름 | 외부링크 | 담당 기능 |

| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |

| 이현준(조장) | [깃허브](https://github.com/lhj0621)/[블로그](https://supiz.tistory.com/) | 총괄, 유닛 테스트, 헤로쿠 배포 |

| 김태련 | [깃허브](https://github.com/nojamcode)/[블로그](https://velog.io/@code-link) | 유닛테스트 |

| 신영학 | [깃허브](https://github.com/yhshin0)/[블로그](https://nbkw.tistory.com/) | 유닛 테스트 |

| 임유라 | [깃허브](https://github.com/BangleCoding)/[블로그](https://banglecoding.github.io/) | 유닛 테스트 , README 작성 |

| 이기범 | [깃허브](https://github.com/gibson-lee93)/[블로그](https://mysterious-laborer-518.notion.site/Gibson-s-Notion-2dd7f598fba64f1c9806cded5b4b83a0) | 유닛 테스트|

| 정진산 | [깃허브](https://github.com/chinsanchung)/[블로그](https://chinsanchung.github.io/) | 유닛 테스트 |

## 개발 환경

- 언어: TypeScript

- 프레임워크: NestJs

- 데이터베이스: SQLite3

- 라이브러리: typeorm, date-fns, class-validator, class-transformer, moment

- 사용 API : [식품의약품안전처\_의약품 임상시험 정보](https://www.data.go.kr/data/15056835/openapi.do)

## ERD

![휴먼스케이프 ERD](https://user-images.githubusercontent.com/47234375/141955873-ab5f5be5-b6de-4a34-9da7-bbd1d9b11781.png)

- clinical 테이블은 임상정보에 대한 데이터를 테이블입니다.
  - APPLY_ENTP_NAME: 신청자
  - APPROVAL_TIME: 승인일
  - LAB_NAME: 실시기관명
  - GOODS_NAME: 제품명
  - CLINIC_EXAM_TITLE: 시험제목
- step 테이블 : 임상 실험 단계 데이터 테이블입니다.
  - name : 임상실험 단계 이름

## 구현 기능

### 초기 데이터 일괄 저장

- [식품의약품안전처\_의약품 임상시험 정보](https://www.data.go.kr/data/15056835/openapi.do)에서 가져온 임상정보 데이터를 데이터베이스에 입력합니다.
- API의 response 값은 XML 형태로 반환되므로 이를 json으로 바꿔주기 위해 xml2json 패키지를 사용했습니다.
- ** API의 승인 시간은 한국기준시각으로 적용되어 있다고 판단해 moment.js 라이브러리를 통해 UTC로 변환했습니다. **

### 스케줄러 (배치 파일 실행) 기능

<!-- TODO -->

### 전체 리스트 조회 및 검색 기능

- 스케줄러 기능을 통해 저장된 임상정보 데이터를 조회합니다.
- 상품명, 연구기관 명, 승인 시간, 임상단계 정보 검색이 가능합니다.
- **승인 시간의 경우 date-fns 라이브러리를 이용하여 시간을 UTC로 변환하여 검색합니다. **

## API 문서

API 테스트를 위한 방법을 [POSTMAN document](<!--TODO: 휴먼스케이프  API URL 업로드 -->)에서 확인하실 수 있습니다.

## 배포

<!-- TODO -->

Heroku를 이용해 배포를 진행했으며, 사이트의 주소는 [<!-- TODO : 사이트 주소 업로드-->]() 입니다.

## 설치 및 실행 방법

### 공통

1. [공공데이터포털](https://www.data.go.kr/) 에서 서비스 키를 발급받습니다.
2. 프로젝트 최상위 폴더에 `.env` 파일을 만들고 발급받은 서비스 키를 `SERVICE_KEY`로 저장합니다.

3. `npm install`으로 패키지를 설치합니다.

4. 실행

- 개발일 경우: `npm run start`으로 `localhost:3000`에서 테스트하실 수 있습니다.

- 배포일 경우: `npm run build`으로 애플리케이션을 빌드합니다. 그리고 `npm run start:prod`으로 실행합니다.

## 테스트

<!-- TODO: jest  스크린샷 첨부-->

## 폴더 구조

<!-- TODO: 폴더 구조 스크린샷 첨부 -->

```bash

```
