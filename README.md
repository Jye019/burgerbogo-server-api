# burgerbogo-api-server

## 개발 환경

### Node 13.11.0

### Express

### Sequelize

Sequelize-Auto 를 사용해 모델 자동 생성

모델 사용 방법

```javascript
import models from "./models";
// models/index.js 임포트
/* -----------생략----------- */
app.get("/users", async (req, res, next) => {
  const userModel = models.users; // models 객체에서 users 모델 가져옴
  try {
    const users = await userModel.findAll();
    res.json(users);
  } catch (err) {
    next(err);
  }
});
/* -----------생략----------- */
```

### Babel

### ESLint

## AWS RDS MySQL DB 생성

### 생성 방식

표준 생성

### 엔진 옵션

MySQL Community, 8.0.20

### 템플릿

프리티어

### 설정

1. 인스턴스 식별자 : nsm-burgerbogo
2. 마스터 사용자 이름 : admin
3. 마스터 암호 : shTmfah1!

### 인스턴스 클래스

버스터블 클래스, db.t2.micro (1 vCPUs/1 GiB RAM/Not EBS Optimized)

### 스토리지

1. 범용(SSD), 20GiB
2. 스토리지 자동 조정 활성화
3. 최대 스토리지 임계값: 1000GiB

### 데이터베이스 인증 옵션

암호 인증

### 월별 추정 요금

Amazon RDS 프리 티어는 12개월 동안 사용할 수 있습니다. 매월 프리 티어를 통해 아래 나열된 Amazon RDS 리소스를 무료로 사용할 수 있습니다.

    단일 AZ db.t2.micro 인스턴스에서 Amazon RDS의 750시간.
    20GB의 범용 스토리지(SSD).
    20GB의 자동 백업 스토리지 및 사용자가 시작한 모든 DB 스냅샷.

<a href="http://aws.amazon.com/rds/free">AWS 무료 티어에 대해 자세히 알아보십시오.</a> 무료 사용이 만료되었거나 애플리케이션에서 프리 티어 사용량을 초과한 경우 <a href="http://aws.amazon.com/rds/pricing">Amazon RDS 요금 페이지</a>에서 설명한 대로, 표준 종량 서비스 요금이 적용됩니다.
