# Cookie と Session 認証の仕組み

## 📚 この資料で学ぶこと
- HTTP のステートレス性と認証の必要性
- Cookie の仕組みと属性
- Session 認証の流れ
- Cookie/Session のセキュリティ対策
- Spring Boot での実装例

> ⏰ 想定時間：1時間

---

## 1. HTTP のステートレス性

### 1.1 ステートレスとは

```
HTTP はステートレス（状態を持たない）プロトコル

リクエスト① GET /mypage  →  サーバー：「あなたは誰？」
リクエスト② GET /mypage  →  サーバー：「あなたは誰？」（①を覚えていない）

↓ ログインしても、次のリクエストでは誰か分からない

解決策：リクエストごとに「自分が誰か」を伝える仕組みが必要
→ Cookie と Session
```

### 1.2 認証の流れ（概要）

```
┌──────────┐                        ┌──────────┐
│ ブラウザ   │                        │ サーバー   │
│          │  ① ログイン（ID/PW）      │          │
│          │ ─────────────────────→  │          │
│          │                        │ ID/PW検証  │
│          │  ② Set-Cookie: sid=xxx  │ Session作成│
│          │ ←─────────────────────  │          │
│          │                        │          │
│ Cookie   │  ③ Cookie: sid=xxx     │          │
│ を自動    │ ─────────────────────→  │ Sessionで │
│ 送信      │                        │ ユーザー   │
│          │  ④ あなたのデータです     │ 特定       │
│          │ ←─────────────────────  │          │
└──────────┘                        └──────────┘
```

---

## 2. Cookie の仕組み

### 2.1 Cookie とは

**Cookie**は、サーバーがブラウザに保存を依頼する小さなデータです。

```
Cookie の特徴：
├── サーバーが Set-Cookie ヘッダーで設定
├── ブラウザが Cookie ヘッダーで自動送信
├── ドメインごとに保存
├── サイズ上限：約4KB / 個
├── 個数上限：ドメインあたり約50個
└── 有効期限を設定可能
```

### 2.2 Cookie の送受信

```http
# サーバー → ブラウザ（Cookie の設定）
HTTP/1.1 200 OK
Set-Cookie: sessionId=abc123; Path=/; HttpOnly; Secure; SameSite=Lax
Set-Cookie: theme=dark; Path=/; Max-Age=2592000

# ブラウザ → サーバー（Cookie の自動送信）
GET /mypage HTTP/1.1
Host: example.com
Cookie: sessionId=abc123; theme=dark
```

### 2.3 Cookie の重要な属性

| 属性 | 説明 | 設定例 |
|------|------|--------|
| **Domain** | Cookie を送信するドメイン | `Domain=example.com` |
| **Path** | Cookie を送信するパス | `Path=/` |
| **Expires** | 有効期限（日時指定） | `Expires=Thu, 01 Jan 2026 00:00:00 GMT` |
| **Max-Age** | 有効期間（秒数） | `Max-Age=86400`（1日） |
| **HttpOnly** | JavaScriptからアクセス不可 | `HttpOnly` |
| **Secure** | HTTPS通信でのみ送信 | `Secure` |
| **SameSite** | クロスサイトリクエスト制御 | `SameSite=Lax` |

### 2.4 セキュリティ属性の詳細

```
HttpOnly：
├── JavaScriptの document.cookie でアクセスできなくなる
├── XSS攻撃でCookieが盗まれるのを防ぐ
└── 認証用Cookieには必ず設定する

Secure：
├── HTTPS通信でのみCookieを送信
├── 中間者攻撃によるCookie盗聴を防ぐ
└── 本番環境では必ず設定する

SameSite：
├── Strict：同一サイトからのリクエストのみCookieを送信
│   └── 外部リンクからの遷移でもCookieが送られない（厳しすぎる場合も）
├── Lax（デフォルト）：GETリクエストは許可、POST等は制限
│   └── 通常はこれで十分
└── None：すべてのリクエストでCookieを送信
    └── Secure属性が必須。サードパーティCookie用
```

---

## 3. Session 認証の仕組み

### 3.1 Session とは

```
Session = サーバー側でユーザーの状態を管理する仕組み

┌──────────────────────────────────────────────┐
│ サーバーのセッションストア                         │
│                                              │
│  セッションID    →    セッションデータ             │
│  ─────────────────────────────────           │
│  abc123         →  { userId: 1,              │
│                      name: "田中",            │
│                      role: "admin",           │
│                      loginAt: "2025-..." }    │
│                                              │
│  def456         →  { userId: 2,              │
│                      name: "佐藤",            │
│                      role: "user",            │
│                      loginAt: "2025-..." }    │
└──────────────────────────────────────────────┘
```

### 3.2 Session 認証の流れ

```
1. ログイン
┌──────────┐                           ┌──────────┐
│ ブラウザ   │  POST /login              │ サーバー   │
│          │  { user: "tanaka",        │          │
│          │    pass: "secret" }        │          │
│          │ ──────────────────────→    │          │
│          │                           │ ① 認証    │
│          │                           │ ② Session │
│          │                           │   作成     │
│          │  Set-Cookie:              │ ③ ID生成  │
│          │    JSESSIONID=abc123      │          │
│          │ ←──────────────────────   │          │
└──────────┘                           └──────────┘

2. 認証済みリクエスト
┌──────────┐                           ┌──────────┐
│ ブラウザ   │  GET /mypage              │ サーバー   │
│          │  Cookie: JSESSIONID=abc123│          │
│          │ ──────────────────────→    │          │
│          │                           │ ④ Session │
│          │                           │   検索     │
│          │                           │ ⑤ ユーザー │
│          │  200 OK                   │   特定     │
│          │  { name: "田中太郎" }      │          │
│          │ ←──────────────────────   │          │
└──────────┘                           └──────────┘

3. ログアウト
┌──────────┐                           ┌──────────┐
│ ブラウザ   │  POST /logout             │ サーバー   │
│          │  Cookie: JSESSIONID=abc123│          │
│          │ ──────────────────────→    │          │
│          │                           │ ⑥ Session │
│          │  Set-Cookie:              │   破棄     │
│          │    JSESSIONID=; Max-Age=0 │          │
│          │ ←──────────────────────   │          │
└──────────┘                           └──────────┘
```

### 3.3 セッションの保存場所

```
保存場所の選択肢：

1. メモリ（デフォルト）
   ├── 利点：高速、実装が簡単
   ├── 欠点：サーバー再起動で消える
   └── 用途：開発環境

2. データベース
   ├── 利点：永続化される
   ├── 欠点：アクセスのたびにDBクエリが発生
   └── 用途：小〜中規模アプリ

3. Redis（インメモリDB）
   ├── 利点：高速、永続化可能、TTL設定
   ├── 欠点：別途Redisサーバーが必要
   └── 用途：大規模アプリ（推奨）

4. 複数サーバーの場合
   ┌────────┐
   │ ブラウザ  │
   └───┬────┘
       │
   ┌───┴────┐
   │ LB     │  ← ロードバランサー
   ├────────┤
   │        │
  ┌┴──┐  ┌─┴─┐
  │S1  │  │S2  │  ← サーバーが複数
  └─┬──┘  └─┬──┘
    │       │
  ┌─┴───────┴──┐
  │   Redis     │  ← セッションを共有
  └────────────┘
```

---

## 4. Spring Boot での実装例

### 4.1 基本的なSession認証

```java
@RestController
public class AuthController {

    @Autowired
    private UserService userService;

    // ログイン
    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody LoginRequest request,
            HttpSession session) {

        // ユーザー認証
        User user = userService.authenticate(
            request.getUsername(), 
            request.getPassword()
        );

        if (user == null) {
            return ResponseEntity.status(401)
                .body(Map.of("error", "ユーザー名またはパスワードが正しくありません"));
        }

        // セッションにユーザー情報を保存
        session.setAttribute("userId", user.getId());
        session.setAttribute("userName", user.getName());
        session.setAttribute("role", user.getRole());

        return ResponseEntity.ok(Map.of(
            "message", "ログイン成功",
            "user", user.getName()
        ));
    }

    // ログアウト
    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpSession session) {
        session.invalidate();  // セッションを破棄
        return ResponseEntity.ok(Map.of("message", "ログアウトしました"));
    }

    // ログイン状態の確認
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(HttpSession session) {
        Long userId = (Long) session.getAttribute("userId");

        if (userId == null) {
            return ResponseEntity.status(401)
                .body(Map.of("error", "ログインが必要です"));
        }

        return ResponseEntity.ok(Map.of(
            "userId", userId,
            "userName", session.getAttribute("userName"),
            "role", session.getAttribute("role")
        ));
    }
}
```

### 4.2 認証チェック用フィルター

```java
@Component
public class AuthFilter implements Filter {

    // 認証不要なパス
    private static final Set<String> PUBLIC_PATHS = Set.of(
        "/login", "/logout", "/public", "/health"
    );

    @Override
    public void doFilter(ServletRequest request, ServletResponse response,
                         FilterChain chain) throws IOException, ServletException {

        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;

        String path = httpRequest.getRequestURI();

        // 公開パスはスキップ
        if (PUBLIC_PATHS.contains(path)) {
            chain.doFilter(request, response);
            return;
        }

        // セッションの確認
        HttpSession session = httpRequest.getSession(false);
        if (session == null || session.getAttribute("userId") == null) {
            httpResponse.setStatus(401);
            httpResponse.setContentType("application/json");
            httpResponse.getWriter().write("{\"error\":\"認証が必要です\"}");
            return;
        }

        chain.doFilter(request, response);
    }
}
```

### 4.3 セッション設定

```yaml
# application.yml
server:
  servlet:
    session:
      timeout: 30m           # セッションタイムアウト（30分）
      cookie:
        name: JSESSIONID     # Cookie名
        http-only: true       # JavaScriptからアクセス不可
        secure: true          # HTTPS のみ
        same-site: lax        # SameSite属性
        max-age: -1           # ブラウザを閉じたら削除（セッションCookie）
```

---

## 5. フロントエンドからの利用

### 5.1 ログイン処理

```javascript
// ログイン
async function login(username, password) {
    const response = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',  // ← Cookie を送受信するために必要
        body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
    }

    return await response.json();
}

// 認証済みAPIの呼び出し
async function fetchMyData() {
    const response = await fetch('/me', {
        credentials: 'include',  // ← Cookie を送信
    });

    if (response.status === 401) {
        // 未認証 → ログイン画面へ
        window.location.href = '/login.html';
        return;
    }

    return await response.json();
}

// ログアウト
async function logout() {
    await fetch('/logout', {
        method: 'POST',
        credentials: 'include',
    });
    window.location.href = '/login.html';
}
```

> ⚠️ **`credentials: 'include'`** を設定しないと、ブラウザはCookieを送信しません（特にクロスオリジンの場合）

---

## 6. Session 認証の利点と課題

### 6.1 利点と課題

```
✅ 利点：
├── シンプルで理解しやすい
├── サーバー側でセッションを無効化できる（即座にログアウト）
├── セッションデータはサーバーに保存（クライアントに漏れない）
├── ブラウザが Cookie を自動管理
└── HttpOnly Cookie で XSS に強い

❌ 課題：
├── サーバーにセッション情報を保持する必要がある（メモリ消費）
├── 複数サーバーでのセッション共有が必要（スケーラビリティ）
├── CSRF 攻撃のリスク（Cookie の自動送信が仇になる）
├── モバイルアプリとの相性が悪い（Cookie非対応の場合）
└── マイクロサービスにはやや不向き
```

### 6.2 Session vs JWT の使い分け

| 比較項目 | Session 認証 | JWT 認証 |
|---------|-------------|---------|
| 状態 | ステートフル（サーバーに保持） | ステートレス（トークンに含む） |
| スケーラビリティ | 共有ストレージが必要 | サーバー間で共有不要 |
| 無効化 | 即座に可能 | 困難（有効期限まで有効） |
| データ量 | Cookie は小さい | トークンが大きくなりがち |
| CSRF | 対策が必要 | リスクが低い |
| モバイル | Cookie 依存 | ヘッダーで送信可能 |
| 適用場面 | 従来型Webアプリ | SPA、API、マイクロサービス |

---

## 📝 確認問題

1. HTTP がステートレスであることの意味と、認証にどう影響するか説明してください
2. Cookie の `HttpOnly` と `Secure` 属性の役割をそれぞれ説明してください
3. Session 認証のログインからログアウトまでの流れを図示してください
4. 複数サーバー構成で Session を使う場合の課題と解決策は何ですか？
5. Session 認証と JWT 認証はそれぞれどのような場面に適していますか？

---

## 📖 参考資料
- [MDN - HTTP Cookie](https://developer.mozilla.org/ja/docs/Web/HTTP/Cookies)
- [OWASP - Session Management](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)
- [Spring Session](https://spring.io/projects/spring-session)
