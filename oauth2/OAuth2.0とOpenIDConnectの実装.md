# OAuth 2.0 / OpenID Connect の実装

## 📚 この資料で学ぶこと
- OAuth 2.0 の実装パターン
- OpenID Connect（OIDC）の概要
- IDトークンとアクセストークンの違い
- Spring Boot での Google ログイン実装
- セキュリティのベストプラクティス

> ⏰ 想定時間：1時間

---

## 1. OAuth 2.0 おさらいと実装の前提知識

### 1.1 OAuth 2.0 の認可コードフロー（復習）

```
┌──────────┐                                    ┌──────────────┐
│ ユーザー   │                                    │ 認可サーバー    │
│（ブラウザ） │                                    │（Google等）    │
└────┬─────┘                                    └──────┬───────┘
     │          ┌──────────────┐                       │
     │  ①認可   │ クライアント   │                       │
     │  リクエスト│（自社アプリ）  │                       │
     │─────────→│              │  ②リダイレクト          │
     │          │              │──────────────────────→│
     │          └──────────────┘                       │
     │                                                │
     │  ③ログイン画面表示　                               │
     │←────────────────────────────────────────────────│
     │                                                │
     │  ④同意・認証                                     │
     │────────────────────────────────────────────────→│
     │                                                │
     │  ⑤認可コード付きリダイレクト                        │
     │←─────────────────┐                              │
     │          ┌───────┴──────┐                       │
     │          │ クライアント   │  ⑥認可コードでトークン要求│
     │          │              │──────────────────────→│
     │          │              │                       │
     │          │              │  ⑦アクセストークン+      │
     │          │              │   IDトークン返却         │
     │          │              │←──────────────────────│
     │          └──────────────┘                       │
```

### 1.2 OAuth 2.0 と OpenID Connect の関係

```
OAuth 2.0：
├── 目的：認可（Authorization）= 「何ができるか」
├── 発行物：アクセストークン
└── 用途：APIへのアクセス権限を委譲

OpenID Connect（OIDC）：
├── 目的：認証（Authentication）= 「誰であるか」
├── OAuth 2.0 の上に構築された拡張仕様
├── 発行物：IDトークン（JWT形式）+ アクセストークン
└── 用途：ユーザーのログイン（SSO）

┌────────────────────────────────┐
│         OpenID Connect         │
│  ┌──────────────────────────┐  │
│  │       OAuth 2.0          │  │
│  │  ・認可の仕組み            │  │
│  │  ・アクセストークン         │  │
│  └──────────────────────────┘  │
│  ・IDトークン（JWT）            │
│  ・UserInfoエンドポイント       │
│  ・標準的なスコープ             │
│    （openid, profile, email）  │
└────────────────────────────────┘
```

### 1.3 IDトークンとアクセストークンの違い

| 項目 | IDトークン | アクセストークン |
|------|----------|--------------|
| **目的** | ユーザーの身元確認 | APIアクセスの認可 |
| **形式** | 必ずJWT | 形式は問わない |
| **発行者** | 認可サーバー（IdP） | 認可サーバー |
| **対象** | クライアントアプリ | リソースサーバー（API） |
| **含まれる情報** | ユーザーID, 名前, メール等 | スコープ（権限）情報 |
| **送信先** | クライアントが自分で検証 | APIリクエストのヘッダー |

```
IDトークンの例（デコード後）：
{
  "iss": "https://accounts.google.com",     ← 発行者
  "sub": "110169484474386276334",           ← ユーザーID（Google内）
  "aud": "your-client-id.apps.google...",   ← クライアントID
  "exp": 1716239022,                        ← 有効期限
  "iat": 1716235422,                        ← 発行日時
  "email": "tanaka@gmail.com",              ← メールアドレス
  "name": "田中太郎",                        ← 表示名
  "picture": "https://lh3.google...",       ← プロフィール画像
  "nonce": "abc123"                         ← リプレイ攻撃防止
}
```

---

## 2. Spring Boot での Google ログイン実装

### 2.1 事前準備：Google Cloud Console での設定

```
① Google Cloud Console にアクセス
   https://console.cloud.google.com/

② プロジェクトを作成

③ OAuth 同意画面の設定
   ├── ユーザータイプ：外部
   ├── アプリ名：My App
   ├── スコープ：email, profile, openid
   └── テストユーザーを追加

④ 認証情報の作成
   ├── OAuth 2.0 クライアント ID を作成
   ├── アプリケーションの種類：ウェブアプリケーション
   ├── 承認済みリダイレクト URI：
   │   http://localhost:8080/login/oauth2/code/google
   └── クライアントID と クライアントシークレット を取得
```

### 2.2 依存関係

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
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-oauth2-client</artifactId>
    </dependency>
</dependencies>
```

### 2.3 設定ファイル

```yaml
# application.yml
spring:
  security:
    oauth2:
      client:
        registration:
          google:
            client-id: ${GOOGLE_CLIENT_ID}      # 環境変数から取得
            client-secret: ${GOOGLE_CLIENT_SECRET}
            scope:
              - openid
              - email
              - profile
```

### 2.4 Security 設定

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/", "/login", "/public/**").permitAll()
                .anyRequest().authenticated()
            )
            .oauth2Login(oauth2 -> oauth2
                .loginPage("/login")
                .defaultSuccessUrl("/dashboard", true)
                .failureUrl("/login?error=true")
                .userInfoEndpoint(userInfo -> userInfo
                    .userService(customOAuth2UserService())
                )
            )
            .logout(logout -> logout
                .logoutSuccessUrl("/")
                .invalidateHttpSession(true)
                .clearAuthentication(true)
            );

        return http.build();
    }

    @Bean
    public CustomOAuth2UserService customOAuth2UserService() {
        return new CustomOAuth2UserService();
    }
}
```

### 2.5 カスタムユーザーサービス

```java
@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);

        // Google から取得したユーザー情報
        String googleId = oAuth2User.getAttribute("sub");
        String name = oAuth2User.getAttribute("name");
        String email = oAuth2User.getAttribute("email");
        String picture = oAuth2User.getAttribute("picture");

        // DBにユーザーを登録 or 更新
        User user = userRepository.findByGoogleId(googleId)
            .orElseGet(() -> {
                User newUser = new User();
                newUser.setGoogleId(googleId);
                newUser.setRole("USER");
                return newUser;
            });

        user.setName(name);
        user.setEmail(email);
        user.setPicture(picture);
        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);

        return oAuth2User;
    }
}
```

### 2.6 コントローラー

```java
@Controller
public class PageController {

    @GetMapping("/")
    public String home() {
        return "home";
    }

    @GetMapping("/login")
    public String login() {
        return "login";
    }

    @GetMapping("/dashboard")
    public String dashboard(@AuthenticationPrincipal OAuth2User principal, Model model) {
        model.addAttribute("name", principal.getAttribute("name"));
        model.addAttribute("email", principal.getAttribute("email"));
        model.addAttribute("picture", principal.getAttribute("picture"));
        return "dashboard";
    }
}

// REST API の場合
@RestController
@RequestMapping("/api")
public class ApiController {

    @GetMapping("/me")
    public Map<String, Object> getCurrentUser(@AuthenticationPrincipal OAuth2User principal) {
        return Map.of(
            "name", principal.getAttribute("name"),
            "email", principal.getAttribute("email"),
            "picture", principal.getAttribute("picture")
        );
    }
}
```

---

## 3. SPA（React）+ バックエンド API での実装

### 3.1 アーキテクチャ

```
SPA での OAuth ログインは主に2パターン：

パターン A: バックエンドでOAuth処理（推奨）
┌────────┐  ①ログインボタン   ┌──────────┐  ②認可リクエスト  ┌──────────┐
│ React  │ ──────────────→ │Spring Boot│ ──────────────→│ Google   │
│        │                │          │                │          │
│        │  ⑤JWT返却       │          │  ④トークン交換   │          │
│        │ ←────────────── │          │ ←──────────────│          │
└────────┘                └──────────┘                └──────────┘
                                ↑ ③コールバック受信

パターン B: フロントエンドでOAuth処理
┌────────┐  ①認可リクエスト                           ┌──────────┐
│ React  │ ─────────────────────────────────────────→│ Google   │
│        │                                          │          │
│        │  ②認可コード返却                            │          │
│        │ ←─────────────────────────────────────────│          │
│        │                                          └──────────┘
│        │  ③認可コードをバックエンドに送信  ┌──────────┐
│        │ ──────────────────────────→ │Spring Boot│
│        │  ④JWT返却                   │  トークン交換│
│        │ ←────────────────────────── │          │
└────────┘                            └──────────┘
```

### 3.2 パターンA: バックエンド主導（BFF パターン）

```java
// Spring Boot 側
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtUtil jwtUtil;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/auth/**", "/login/**", "/oauth2/**").permitAll()
                .anyRequest().authenticated()
            )
            .oauth2Login(oauth2 -> oauth2
                .successHandler(oAuth2SuccessHandler())
            );

        return http.build();
    }

    @Bean
    public AuthenticationSuccessHandler oAuth2SuccessHandler() {
        return (request, response, authentication) -> {
            OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

            // ユーザー情報からJWTを生成
            String email = oAuth2User.getAttribute("email");
            String name = oAuth2User.getAttribute("name");

            User user = userService.findOrCreateByEmail(email, name);
            String jwt = jwtUtil.generateAccessToken(user);

            // フロントエンドにリダイレクト（JWTをクエリパラメータで渡す）
            String redirectUrl = "http://localhost:5173/auth/callback?token=" + jwt;
            response.sendRedirect(redirectUrl);
        };
    }
}
```

```jsx
// React 側
function LoginPage() {
    const handleGoogleLogin = () => {
        // Spring Boot の OAuth エンドポイントにリダイレクト
        window.location.href = 'http://localhost:8080/oauth2/authorization/google';
    };

    return (
        <div>
            <h1>ログイン</h1>
            <button onClick={handleGoogleLogin}>
                Googleでログイン
            </button>
        </div>
    );
}

// コールバック処理
function AuthCallback() {
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');
        
        if (token) {
            // トークンをメモリに保存
            authService.setToken(token);
            // ダッシュボードにリダイレクト
            window.location.href = '/dashboard';
        }
    }, []);

    return <p>認証処理中...</p>;
}
```

---

## 4. PKCE（Proof Key for Code Exchange）

### 4.1 PKCE とは

```
PKCE はパブリッククライアント（SPA, モバイルアプリ）向けの
認可コード横取り攻撃の対策

通常の認可コードフロー → 認可コードが盗まれる可能性
PKCE 付きフロー → 認可コードだけでは使えない

PKCE の仕組み：
① code_verifier（ランダム文字列）を生成
② code_challenge = SHA256(code_verifier) を計算
③ 認可リクエストに code_challenge を含める
④ トークンリクエストに code_verifier を含める
⑤ サーバーが SHA256(code_verifier) == code_challenge を検証

攻撃者は code_verifier を知らないので、
認可コードを盗んでもトークン取得はできない
```

### 4.2 PKCE の実装例

```javascript
// PKCE ユーティリティ
class PKCEUtil {
    // ランダム文字列の生成
    static generateCodeVerifier() {
        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        return this.base64UrlEncode(array);
    }

    // code_challenge の計算
    static async generateCodeChallenge(codeVerifier) {
        const encoder = new TextEncoder();
        const data = encoder.encode(codeVerifier);
        const hash = await crypto.subtle.digest('SHA-256', data);
        return this.base64UrlEncode(new Uint8Array(hash));
    }

    static base64UrlEncode(buffer) {
        return btoa(String.fromCharCode(...buffer))
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');
    }
}

// 認可リクエストの送信
async function startOAuthFlow() {
    const codeVerifier = PKCEUtil.generateCodeVerifier();
    const codeChallenge = await PKCEUtil.generateCodeChallenge(codeVerifier);

    // code_verifier をセッションストレージに保存
    sessionStorage.setItem('code_verifier', codeVerifier);

    const params = new URLSearchParams({
        response_type: 'code',
        client_id: 'YOUR_CLIENT_ID',
        redirect_uri: 'http://localhost:5173/callback',
        scope: 'openid email profile',
        code_challenge: codeChallenge,
        code_challenge_method: 'S256',
        state: crypto.randomUUID(),  // CSRF対策
    });

    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

// コールバック処理
async function handleCallback() {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const codeVerifier = sessionStorage.getItem('code_verifier');

    // バックエンドにコードと code_verifier を送信
    const response = await fetch('/auth/oauth/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, codeVerifier }),
    });

    const data = await response.json();
    // JWT を受け取って保存
}
```

---

## 5. セキュリティのベストプラクティス

### 5.1 チェックリスト

```
✅ 実装時のセキュリティチェック：

認可リクエスト：
├── state パラメータで CSRF 対策
├── PKCE を使用（SPA/モバイルアプリ）
├── scope は最小限に
└── redirect_uri を厳密に指定

トークン管理：
├── クライアントシークレットは環境変数で管理
├── アクセストークンはサーバー側で保持（BFFパターン）
├── IDトークンの署名を必ず検証
├── IDトークンの iss, aud, exp を検証
└── nonce でリプレイ攻撃を防止

通信：
├── すべての通信は HTTPS
├── redirect_uri は完全一致で検証
├── 認可コードは1回限り有効
└── CORS 設定を適切に

ユーザー情報：
├── sub（Subject）でユーザーを識別（emailは変更される可能性）
├── 取得した情報はDB保存前にサニタイズ
└── 権限はローカルDBで管理（IdPに依存しない）
```

### 5.2 複数プロバイダー対応

```yaml
# application.yml - Google + GitHub
spring:
  security:
    oauth2:
      client:
        registration:
          google:
            client-id: ${GOOGLE_CLIENT_ID}
            client-secret: ${GOOGLE_CLIENT_SECRET}
            scope: openid, email, profile
          github:
            client-id: ${GITHUB_CLIENT_ID}
            client-secret: ${GITHUB_CLIENT_SECRET}
            scope: user:email, read:user
```

```java
// プロバイダーごとのユーザー情報抽出
@Service
public class OAuth2UserInfoExtractor {

    public UserInfo extract(String provider, OAuth2User oAuth2User) {
        return switch (provider) {
            case "google" -> new UserInfo(
                oAuth2User.getAttribute("sub"),
                oAuth2User.getAttribute("name"),
                oAuth2User.getAttribute("email"),
                oAuth2User.getAttribute("picture")
            );
            case "github" -> new UserInfo(
                oAuth2User.getAttribute("id").toString(),
                oAuth2User.getAttribute("login"),
                oAuth2User.getAttribute("email"),
                oAuth2User.getAttribute("avatar_url")
            );
            default -> throw new IllegalArgumentException("未対応: " + provider);
        };
    }
}
```

---

## 📝 確認問題

1. OAuth 2.0 と OpenID Connect の違いを説明してください
2. IDトークンとアクセストークンの用途の違いは何ですか？
3. PKCE はどのような攻撃を防ぐための仕組みですか？
4. SPA で OAuth を実装する場合のBFFパターンとは何ですか？
5. IDトークンの検証時に確認すべき項目を3つ挙げてください

---

## 📖 参考資料
- [OpenID Connect 仕様](https://openid.net/developers/specs/)
- [Google OAuth 2.0 ドキュメント](https://developers.google.com/identity/protocols/oauth2)
- [Spring Security OAuth2 ガイド](https://docs.spring.io/spring-security/reference/servlet/oauth2/index.html)
- [OAuth 2.0 Security Best Current Practice](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-security-topics)
