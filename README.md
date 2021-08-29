## 로또 투어 API 백엔드 / Crawler
&nbsp;

#### 폴더 구조

* /back (백엔드 API)  
* /crawler (크롤러)

&nbsp;
#### API 백엔드 명령어 

nodemon 테스트 
```
npm run dev
```

상점 데이터 크롤링
```
npm run insertStore
```

상점 데이터 크롤링 후 폐점된 상점 삭제
```
npm run deleteClosedStore
```

당첨 판매점 데이터 크롤링 
```
npm run insertStoreWinning
```


API 서비스 실행 (Production) 

```
./start-server.sh start
```

API 서비스 재실행 (Production)

```
./start-server.sh reload
```

&nbsp;
#### Crawler(크롤러) 명령어

크론 서비스 실행 (Production)

```
./start-server.sh start
```

크론 서비스 재실행

```
./start-server.sh reload
```
