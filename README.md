# C 포인터 쉽게 배우기 – 5단계 온라인 강의

**→ 🖥 [블로그에서 바로 보기 (클릭)](https://joygram.github.io/c_pointer_lect/)**

초등학생도 이해할 수 있도록 **주소**와 **포인터** 개념을 비유와 실습으로 배우는 웹 강의입니다.

## 어떻게 보나요?

1. **로컬에서 보기**: `index.html` 파일을 브라우저로 열어서 보세요.
2. **실습**: 각 단계의 실습 코드창에서 수정·포맷·복사한 뒤, [Programiz 온라인 C 컴파일러](https://www.programiz.com/c-programming/online-compiler/)에 붙여 넣어 실행하세요.

## 강의 구성 (5단계)

| 단계 | 제목 | 내용 |
|------|------|------|
| 1 | 주소가 뭐예요? | 우편함 비유로 주소·값 개념 이해 |
| 2 | 변수와 주소 | 변수와 `&` 연산자, `%p`로 주소 출력 |
| 3 | 포인터 변수 | `int *p`, `*p`의 의미, 주소 저장과 역참조 |
| 4 | 포인터로 값 바꾸기 | `*p = 값`으로 가리킨 곳의 값 변경 |
| 5 | 포인터 활용하기 | 배열과 포인터, 함수에 주소 넘기기 |

## 파일 구조

- `index.html` – 강의 목차 및 1~5단계 링크
- `stage1.html` ~ `stage5.html` – 각 단계 설명, 실습 코드창, 예제 코드
- `practice-editor.js` – 실습 코드 에디터(포맷·복사·오토 포맷)
- `.github/workflows/deploy-pages.yml` – GitHub Pages 배포 파이프라인

## GitHub Pages 블로그 배포

`main` 브랜치에 푸시하면 GitHub Actions가 `gh-pages` 브랜치를 자동으로 갱신합니다.

### 페이지가 안 뜰 때 (404)

1. 저장소 **Settings** → **Pages** 이동
2. **Build and deployment** → **Source**: **Deploy from a branch**
3. **Branch**: `gh-pages`, **Folder**: **/ (root)** → **Save**
4. 1~2분 후 `https://<USERNAME>.github.io/c_pointer_lect/` 에서 접속 가능

- `main`에 푸시할 때마다 워크플로가 `gh-pages`를 갱신합니다.
- 수동 실행: **Actions** 탭 → **Deploy to GitHub Pages** → **Run workflow**

## 로컬 실행

- `index.html`을 브라우저로 열거나, `npx serve .` / `python -m http.server 8080` 후 접속
