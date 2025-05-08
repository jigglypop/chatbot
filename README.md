# LangChain 챗봇 (FastAPI + React)

SSE(Server-Sent Events)를 활용한 스트리밍 응답 기능이 있는 LangChain 기반 챗봇 애플리케이션입니다.

## 프로젝트 구조

```
.
├── backend/              # FastAPI 백엔드
│   ├── main.py           # FastAPI 애플리케이션
│   ├── chat.py           # LangChain 챗봇 로직
│   └── requirements.txt  # 필요 패키지
└── frontend/             # React 프론트엔드
    ├── public/           # 정적 파일
    └── src/              # 소스 코드
        ├── components/   # 리액트 컴포넌트
        │   ├── ChatBot.js
        │   └── Message.js
        ├── App.js
        └── index.js
```

## 설치 및 실행

### 백엔드 설정

1. 필요 패키지 설치:

```bash
cd backend
pip install -r requirements.txt
```

2. 환경 변수 설정:
   - `.env` 파일을 만들고 OpenAI API 키 설정:

```
OPENAI_API_KEY=your_api_key_here
```

3. 백엔드 서버 실행:

```bash
uvicorn main:app --reload
```

### 프론트엔드 설정

1. 필요 패키지 설치:

```bash
cd frontend
npm install
```

2. 개발 서버 실행:

```bash
npm start
```

## 기능

- 실시간 스트리밍 응답 (SSE 사용)
- LangChain과 OpenAI 통합
- 메시지 기록 유지
- 반응형 UI

## 기술 스택

- **백엔드**: FastAPI, LangChain, SSE
- **프론트엔드**: React, CSS
- **API**: OpenAI Chat API
