# JWT 認証の実装

## 📚 この資料で学ぶこと
- JWT（JSON Web Token）の構造と仕組み
- JWT 認証の流れ
- アクセストークンとリフレッシュトークン
- Spring Boot での JWT 認証実装
- セキュリティ上の注意点

> ⏰ 想定時間：1時間

---

## 1. JWT とは

### 1.1 JWT の概要

**JWT（JSON Web Token）**は、当事者間で情報を安全にやり取りするための**コンパクトなトークン形式**です。

```
Session認証との違い：

Session認証：
  サーバーが状態を持つ（ステートフル）
  ┌───────┐  Cookie: sid=abc  ┌───────┐  sid=abc → User1
  │ブラウザ │ ──────────────→  │サーバー │  sid=def → User2
  └───────┘                  └───┬───┘  sid=ghi → User3
                                 │
                          セッションストア

JWT認証：
  トークンに情報が含まれる（ステートレス）
  ┌───────┐  Authorization:     ┌───────┐
  │ブラウザ │  Bearer eyJhbG...  │サーバー │  ← 状態を持たない
  │       │ ──────────────────→ │       │  トークンを検証する
  └───────┘                     └───────┘    だけでOK
```

### 1.2 JWT の構造

```
JWT = Header.Payload.Signature

eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.
eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6Iu田中太郎IiwiaWF0IjoxNTE2MjM5MDIyfQ.
SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c

┌─────────────────────────────────────┐
│ Header（ヘッダー）                     │
│ eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9 │
│                                     │
│ Base64デコード →                      │
│ {                                   │
│   "alg": "HS256",  ← 署名アルゴリズム │
│   "typ": "JWT"     ← トークン種類     │
│ }                                   │
├─────────────────────────────────────┤
│ Payload（ペイロード）                  │
│ eyJzdWIiOiIxMjM...                  │
│                                     │
│ Base64デコード →                      │
│ {                                   │
│   "sub": "1234567890", ← ユーザーID  │
│   "name": "田中太郎",   ← ユーザー名  │
│   "role": "admin",      ← 権限情報   │
│   "iat": 1516239022,    ← 発行日時   │
│   "exp": 1516242622     ← 有効期限   │
│ }                                   │
├─────────────────────────────────────┤
│ Signature（署名）                     │
│ SflKxwRJSMeKKF2Q...                │
│                                     │
│ HMACSHA256(                         │
│   base64(header) + "." +            │
│   base64(payload),                  │
│   secret                            │
│ )                                   │
│ → 改ざん検知に使用                      │
└─────────────────────────────────────┘
```

### 1.3 主要なクレーム（Payload のフィールド）

| クレーム | 正式名 | 説明 |
|---------|--------|------|
| `sub` | Subject | ユーザー識別子 |
| `iat` | Issued At | トークン発行日時 |
| `exp` | Expiration | 有効期限 |
| `iss` | Issuer | 発行者 |
| `aud` | Audience | 対象者（受信者） |
| `nbf` | Not Before | 有効開始日時 |
| `jti` | JWT ID | トークンの一意識別子 |

> ⚠️ **Payload は Base64エンコードされているだけで暗号化されていない**。パスワードなどの機密情報は入れてはいけません。

---

## 2. JWT 認証の流れ

### 2.1 基本フロー

```
┌──────────┐                              ┌──────────┐
│ クライアント│                              │ サーバー   │
│          │  ① POST /auth/login           │          │
│          │  { username, password }        │          │
│          │ ───────────────────────────→   │          │
│          │                              │ 認証処理   │
│          │  ② 200 OK                     │ JWT生成   │
│          │  { accessToken: "eyJ...",     │          │
│          │    refreshToken: "eyJ..." }   │          │
│          │ ←───────────────────────────  │          │
│          │                              │          │
│ トークンを │  ③ GET /api/users             │          │
│ 保存      │  Authorization: Bearer eyJ... │          │
│          │ ───────────────────────────→   │          │
│          │                              │ JWT検証   │
│          │  ④ 200 OK                     │ ユーザー   │
│          │  [ユーザーデータ]               │ 特定       │
│          │ ←───────────────────────────  │          │
└──────────┘                              └──────────┘
```

### 2.2 アクセストークンとリフレッシュトークン

```
なぜ2種類のトークンが必要か？

アクセストークン：
├── 用途：API認証
├── 有効期限：短い（15分〜1時間）
├── 保存場所：メモリ（推奨）
└── 漏洩リスクを最小限にする

リフレッシュトークン：
├── 用途：アクセストークンの再発行
├── 有効期限：長い（7日〜30日）
├── 保存場所：HttpOnly Cookie（推奨）
└── アクセストークン期限切れ時に使用

トークンリフレッシュの流れ：
┌──────────┐                              ┌──────────┐
│ クライアント│                              │ サーバー   │
│          │  ① API呼出（アクセストークン）     │          │
│          │ ───────────────────────────→   │          │
│          │  ② 401 Unauthorized            │ 期限切れ  │
│          │ ←───────────────────────────   │          │
│          │                              │          │
│          │  ③ POST /auth/refresh          │          │
│          │  Cookie: refreshToken=eyJ...  │          │
│          │ ───────────────────────────→   │          │
│          │                              │ 検証OK   │
│          │  ④ 新しいアクセストークン         │ 再発行   │
│          │ ←───────────────────────────   │          │
│          │                              │          │
│          │  ⑤ API再呼出（新トークン）       │          │
│          │ ───────────────────────────→   │          │
│          │  ⑥ 200 OK                     │          │
│          │ ←───────────────────────────   │          │
└──────────┘                              └──────────┘
```

---

## 3. Spring Boot での実装

### 3.1 依存関係の追加

```xml
<!-- pom.xml -->
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-security</artifactId>
    </dependency>
    <!-- JWT ライブラリ -->
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-api</artifactId>
        <version>0.12.5</version>
    </dependency>
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-impl</artifactId>
        <version>0.12.5</version>
        <scope>runtime</scope>
    </dependency>
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-jackson</artifactId>
        <version>0.12.5</version>
        <scope>runtime</scope>
    </dependency>
</dependencies>
```

### 3.2 JWT ユーティリティクラス

```java
@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secretKey;

    @Value("${jwt.access-token-expiration}")
    private long accessTokenExpiration;  // ミリ秒

    @Value("${jwt.refresh-token-expiration}")
    private long refreshTokenExpiration;

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secretKey.getBytes(StandardCharsets.UTF_8));
    }

    // アクセストークン生成
    public String generateAccessToken(User user) {
        return Jwts.builder()
                .subject(user.getId().toString())
                .claim("name", user.getName())
                .claim("role", user.getRole())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + accessTokenExpiration))
                .signWith(getSigningKey())
                .compact();
    }

    // リフレッシュトークン生成
    public String generateRefreshToken(User user) {
        return Jwts.builder()
                .subject(user.getId().toString())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + refreshTokenExpiration))
                .signWith(getSigningKey())
                .compact();
    }

    // トークンの検証とクレーム取得
    public Claims validateToken(String token) {
        try {
            return Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (ExpiredJwtException e) {
            throw new AuthException("トークンの有効期限が切れています");
        } catch (JwtException e) {
            throw new AuthException("無効なトークンです");
        }
    }

    // ユーザーIDの取得
    public Long getUserId(String token) {
        Claims claims = validateToken(token);
        return Long.parseLong(claims.getSubject());
    }
}
```

### 3.3 認証コントローラー

```java
@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    // ログイン
    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody LoginRequest request,
            HttpServletResponse response) {

        User user = userService.authenticate(
            request.getUsername(), 
            request.getPassword()
        );

        if (user == null) {
            return ResponseEntity.status(401)
                .body(Map.of("error", "認証に失敗しました"));
        }

        // トークン生成
        String accessToken = jwtUtil.generateAccessToken(user);
        String refreshToken = jwtUtil.generateRefreshToken(user);

        // リフレッシュトークンを HttpOnly Cookie に設定
        ResponseCookie cookie = ResponseCookie.from("refreshToken", refreshToken)
                .httpOnly(true)
                .secure(true)
                .sameSite("Lax")
                .path("/auth/refresh")
                .maxAge(Duration.ofDays(7))
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        // アクセストークンはレスポンスボディで返す
        return ResponseEntity.ok(Map.of(
            "accessToken", accessToken,
            "user", Map.of(
                "id", user.getId(),
                "name", user.getName(),
                "role", user.getRole()
            )
        ));
    }

    // トークンリフレッシュ
    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(
            @CookieValue(name = "refreshToken", required = false) String refreshToken) {

        if (refreshToken == null) {
            return ResponseEntity.status(401)
                .body(Map.of("error", "リフレッシュトークンがありません"));
        }

        try {
            Long userId = jwtUtil.getUserId(refreshToken);
            User user = userService.findById(userId);

            String newAccessToken = jwtUtil.generateAccessToken(user);
            return ResponseEntity.ok(Map.of("accessToken", newAccessToken));
        } catch (AuthException e) {
            return ResponseEntity.status(401)
                .body(Map.of("error", e.getMessage()));
        }
    }

    // ログアウト
    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletResponse response) {
        // リフレッシュトークンの Cookie を削除
        ResponseCookie cookie = ResponseCookie.from("refreshToken", "")
                .httpOnly(true)
                .secure(true)
                .sameSite("Lax")
                .path("/auth/refresh")
                .maxAge(0)  // 即座に削除
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        return ResponseEntity.ok(Map.of("message", "ログアウトしました"));
    }
}
```

### 3.4 JWT 認証フィルター

```java
@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        // Bearer トークンの確認
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);

            try {
                Claims claims = jwtUtil.validateToken(token);

                // Spring Security の認証情報を設定
                UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                        claims.getSubject(),
                        null,
                        List.of(new SimpleGrantedAuthority("ROLE_" + claims.get("role")))
                    );

                SecurityContextHolder.getContext().setAuthentication(authentication);
            } catch (AuthException e) {
                // トークンが無効な場合は認証情報を設定しない
                // → Spring Security が 401 を返す
            }
        }

        filterChain.doFilter(request, response);
    }

    // 認証不要なパスをスキップ
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        return path.startsWith("/auth/") || path.startsWith("/public/");
    }
}
```

### 3.5 Security 設定

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthFilter jwtAuthFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())  // JWT を使うため CSRF 無効化
            .sessionManagement(session -> 
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/auth/**", "/public/**").permitAll()
                .requestMatchers("/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
```

### 3.6 設定ファイル

```yaml
# application.yml
jwt:
  secret: your-256-bit-secret-key-here-at-least-32-characters-long
  access-token-expiration: 900000     # 15分（ミリ秒）
  refresh-token-expiration: 604800000  # 7日（ミリ秒）
```

---

## 4. フロントエンドでの利用

### 4.1 トークン管理

```javascript
// トークンの管理クラス
class AuthService {
    #accessToken = null;

    // ログイン
    async login(username, password) {
        const response = await fetch('/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',  // Cookie（リフレッシュトークン）を受け取る
            body: JSON.stringify({ username, password }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error);
        }

        const data = await response.json();
        this.#accessToken = data.accessToken;  // メモリに保存
        return data.user;
    }

    // 認証付きリクエスト
    async authFetch(url, options = {}) {
        // アクセストークンをヘッダーに付与
        let response = await fetch(url, {
            ...options,
            headers: {
                ...options.headers,
                'Authorization': `Bearer ${this.#accessToken}`,
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });

        // 401 の場合、トークンをリフレッシュして再試行
        if (response.status === 401) {
            const refreshed = await this.refreshToken();
            if (refreshed) {
                response = await fetch(url, {
                    ...options,
                    headers: {
                        ...options.headers,
                        'Authorization': `Bearer ${this.#accessToken}`,
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                });
            } else {
                // リフレッシュ失敗 → ログイン画面へ
                window.location.href = '/login';
                throw new Error('認証が必要です');
            }
        }

        return response;
    }

    // トークンリフレッシュ
    async refreshToken() {
        try {
            const response = await fetch('/auth/refresh', {
                method: 'POST',
                credentials: 'include',  // Cookie を送信
            });

            if (!response.ok) return false;

            const data = await response.json();
            this.#accessToken = data.accessToken;
            return true;
        } catch {
            return false;
        }
    }

    // ログアウト
    async logout() {
        await fetch('/auth/logout', {
            method: 'POST',
            credentials: 'include',
        });
        this.#accessToken = null;
        window.location.href = '/login';
    }
}

// 使用例
const auth = new AuthService();
await auth.login('tanaka', 'password123');

const response = await auth.authFetch('/api/users');
const users = await response.json();
```

---

## 5. セキュリティ上の注意点

### 5.1 トークンの保存場所

```
保存場所の比較：

❌ localStorage：
├── XSS で簡単に盗まれる
├── JavaScript で自由にアクセス可能
└── 推奨しない

❌ sessionStorage：
├── localStorage と同じリスク
├── タブを閉じると消える
└── 推奨しない

⚠️ HttpOnly Cookie：
├── XSS で盗めない（JavaScriptアクセス不可）
├── CSRF のリスクがある → SameSite で対策
└── アクセストークンにはやや不向き（API呼出時の柔軟性がない）

✅ 推奨パターン：
├── アクセストークン → メモリ（変数）に保存
│   ├── XSS で盗みにくい
│   ├── ページリロードで消える → リフレッシュで再取得
│   └── 有効期限が短いのでリスク低
└── リフレッシュトークン → HttpOnly Cookie
    ├── XSS で盗めない
    ├── SameSite=Lax で CSRF 対策
    └── パスを /auth/refresh に限定
```

### 5.2 よくある脆弱性と対策

```
1. 秘密鍵の漏洩
   ├── 原因：ソースコードにハードコーディング
   ├── 対策：環境変数や秘密管理サービスを使う
   └── 対策：十分に長いランダムなキーを使う（256bit以上）

2. アルゴリズム「none」攻撃
   ├── 原因：署名なしトークンを受け入れてしまう
   ├── 対策：alg を明示的に指定して検証
   └── 対策：信頼できるJWTライブラリを使う

3. トークンの無効化ができない
   ├── 原因：JWT はステートレスなので、発行後は無効化困難
   ├── 対策：有効期限を短くする
   ├── 対策：ブラックリスト（無効化リスト）を管理
   └── 対策：リフレッシュトークンをDB管理して取り消し可能に

4. 過大なペイロード
   ├── 原因：不要な情報をトークンに含めてしまう
   ├── 対策：最小限の情報のみ含める
   └── 対策：機密情報は含めない
```

---

## 📝 確認問題

1. JWT の3つの構成要素（Header, Payload, Signature）の役割を説明してください
2. アクセストークンとリフレッシュトークンの役割の違いは何ですか？
3. JWT の Payload が暗号化されていないことのリスクは何ですか？
4. アクセストークンの推奨保存場所はどこですか？その理由は？
5. JWT 認証で「即座にログアウト」を実現するにはどうすればよいですか？

---

## 📖 参考資料
- [JWT.io](https://jwt.io/) - JWT のデコードツール
- [RFC 7519 - JSON Web Token](https://datatracker.ietf.org/doc/html/rfc7519)
- [JJWT ライブラリ](https://github.com/jwtk/jjwt)
- [OWASP JWT Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html)
