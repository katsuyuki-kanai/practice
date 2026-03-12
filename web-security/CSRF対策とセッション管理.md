# CSRF対策とセッション管理

## 📚 この資料で学ぶこと
- CSRF（クロスサイトリクエストフォージェリ）の仕組みと対策
- セッション管理のベストプラクティス
- セッション固定攻撃とその対策
- Spring Securityでの実装例

> ⏰ 想定時間：1時間

---

## 1. CSRF（クロスサイトリクエストフォージェリ）

### 1.1 CSRFとは

**CSRF**は、ユーザーがログイン中のWebアプリに対して、**ユーザーの意図しないリクエストを送信させる攻撃**です。

```
CSRFの攻撃シナリオ：

1. ユーザーが銀行サイトにログイン中（セッションCookieが有効）

2. 攻撃者が罠サイトを用意
   <form action="https://bank.example.com/transfer" method="POST">
     <input type="hidden" name="to" value="attacker_account" />
     <input type="hidden" name="amount" value="1000000" />
   </form>
   <script>document.forms[0].submit();</script>

3. ユーザーが罠サイトにアクセス
   → 自動的に送金リクエストが送信される
   → ブラウザがCookieを自動送付
   → 銀行サーバーは正規のリクエストと判断
   → 100万円が攻撃者に送金される！😱
```

### 1.2 CSRFが成立する条件

```
CSRF成功の条件（すべて満たす必要あり）：
├── ユーザーが対象サイトにログイン中
├── 対象サイトがCookieベースの認証を使用
├── 攻撃者がリクエストの構造を知っている
└── サイトにCSRF対策が施されていない
```

### 1.3 CSRFとXSSの違い

| | CSRF | XSS |
|--|------|-----|
| **攻撃対象** | サーバー（ユーザーの権限を悪用） | ユーザーのブラウザ |
| **攻撃の仕組み** | ユーザーになりすましてリクエスト | ブラウザでスクリプト実行 |
| **必要条件** | ユーザーがログイン中 | 脆弱なページの存在 |
| **主な被害** | 不正な操作の実行 | データの窃取、改ざん |

---

## 2. CSRF対策

### 2.1 CSRFトークン（Synchronizer Token Pattern）**最も一般的**

```
仕組み：
1. サーバーがフォームにランダムなトークンを埋め込む
2. フォーム送信時にトークンも一緒に送信
3. サーバーがトークンを検証
4. 攻撃者はトークンの値を知ることができないため、攻撃が失敗

正規のリクエスト：
┌──────────────────────────────────┐
│ <form method="POST">             │
│   <input type="hidden"           │
│     name="_csrf"                 │
│     value="a8f5d3e1..." />       │ ← CSRFトークン
│   <input type="text" name="to"/> │
│   <button>送金</button>          │
│ </form>                          │
└──────────────────────────────────┘

→ トークンが一致 → リクエストを処理 ✅

攻撃者のリクエスト：
┌──────────────────────────────────┐
│ <form action="https://bank...">  │
│   <input name="to" value="atk"/> │
│   <!-- CSRFトークンがない！ -->    │
│ </form>                          │
└──────────────────────────────────┘

→ トークンがない or 不一致 → リクエストを拒否 ❌
```

### 2.2 Spring SecurityでのCSRF対策

Spring Securityは**デフォルトでCSRF保護が有効**です。

```java
// Spring Security設定
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) 
            throws Exception {
        http
            .csrf(csrf -> csrf
                .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
            )
            // ... 他の設定
        ;
        return http.build();
    }
}
```

```html
<!-- Thymeleafでは自動的にCSRFトークンが埋め込まれる -->
<form th:action="@{/transfer}" method="post">
    <!-- 自動で以下が追加される -->
    <!-- <input type="hidden" name="_csrf" value="xxx..." /> -->
    
    <input type="text" name="to" />
    <input type="number" name="amount" />
    <button type="submit">送金</button>
</form>
```

```javascript
// Ajax（Fetch API）でCSRFトークンを送信
const csrfToken = document.querySelector('meta[name="_csrf"]').content;
const csrfHeader = document.querySelector('meta[name="_csrf_header"]').content;

fetch('/api/transfer', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        [csrfHeader]: csrfToken  // CSRFトークンをヘッダーに含める
    },
    body: JSON.stringify({ to: 'account123', amount: 1000 })
});
```

### 2.3 SameSite Cookie属性

```
SameSite属性：クロスサイトからのCookie送信を制御

SameSite=Strict
  → 別サイトからのリクエストではCookieを送信しない
  → 最も安全だが、外部リンクからアクセス時にログアウト状態になる

SameSite=Lax（推奨、多くのブラウザのデフォルト）
  → GETリクエストのみCookieを送信
  → POST, PUT, DELETEではCookieを送信しない

SameSite=None
  → すべてのリクエストでCookieを送信（Secure属性が必須）
```

```java
// Spring Bootでの設定
// application.properties
server.servlet.session.cookie.same-site=lax
server.servlet.session.cookie.secure=true
server.servlet.session.cookie.http-only=true
```

### 2.4 その他のCSRF対策

```
CSRF対策の一覧：
├── 🥇 CSRFトークン（Synchronizer Token Pattern）← 標準
├── 🥈 SameSite Cookie 属性
├── 🥉 Double Submit Cookie Pattern
├──    Referer / Origin ヘッダーの検証
└──    カスタムヘッダーの要求（API向け）
```

### 2.5 REST APIのCSRF

```
REST APIの場合：

✅ CSRFトークン不要なケース：
├── Bearer Token認証（Authorization ヘッダー）
├── APIキー認証
└── Cookieを使わない認証方式

→ ブラウザが自動でCredentialを送信しないため、CSRF攻撃が成立しない

⚠️ CSRFトークン必要なケース：
├── Cookie認証を使うAPI
└── セッションベース認証のAPI
```

```java
// REST APIでCSRFを無効化する場合（Bearer Token認証時）
@Bean
public SecurityFilterChain apiSecurityFilterChain(HttpSecurity http) 
        throws Exception {
    http
        .securityMatcher("/api/**")
        .csrf(csrf -> csrf.disable())  // API はCSRF無効化
        .sessionManagement(session -> 
            session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        // ...
    ;
    return http.build();
}
```

---

## 3. セッション管理

### 3.1 セッションの仕組み（復習）

```
1. ユーザーがログイン
   → サーバーがセッションIDを生成（例: ABC123）

2. セッションIDをCookieで送信
   Set-Cookie: JSESSIONID=ABC123; Path=/; HttpOnly; Secure

3. 以降のリクエストでブラウザがCookieを自動送付
   Cookie: JSESSIONID=ABC123

4. サーバーがセッションIDからユーザー情報を特定
```

### 3.2 セッション管理の脅威

#### 脅威1：セッション固定攻撃（Session Fixation）

```
攻撃の流れ：
1. 攻撃者がサイトにアクセスし、セッションID（SID=AAA）を取得
2. 攻撃者がそのSIDをユーザーに使わせる
   （URL: https://example.com?JSESSIONID=AAA）
3. ユーザーがそのURLでログイン
4. ログイン後もSIDがAAAのまま
5. 攻撃者はSID=AAAでログイン済みのセッションにアクセス！

対策：ログイン成功時にセッションIDを再生成する
```

```java
// Spring Securityではデフォルトでセッション固定攻撃対策が有効
http
    .sessionManagement(session -> session
        .sessionFixation().changeSessionId()  // ログイン時にセッションIDを変更
    );
```

#### 脅威2：セッションハイジャック

```
攻撃方法：
├── ネットワーク盗聴（HTTP通信）→ 対策：HTTPS
├── XSS でCookie窃取 → 対策：HttpOnly Cookie
├── セッションIDの推測 → 対策：強力な乱数生成
└── マルウェア → 対策：エンドポイントセキュリティ
```

### 3.3 セッション管理のベストプラクティス

#### セキュアなCookie設定

```java
// application.properties
server.servlet.session.cookie.http-only=true   # JavaScriptからアクセス不可
server.servlet.session.cookie.secure=true      # HTTPSのみ
server.servlet.session.cookie.same-site=lax    # クロスサイト制限
server.servlet.session.cookie.max-age=1800     # 30分（秒）
server.servlet.session.cookie.name=SESSIONID   # カスタムCookie名
```

#### セッションタイムアウト

```java
// application.properties
server.servlet.session.timeout=30m  # 30分でタイムアウト

// プログラム的に設定
@Bean
public ServletWebServerFactory servletContainer() {
    TomcatServletWebServerFactory factory = new TomcatServletWebServerFactory();
    factory.addConnectorCustomizers(connector -> {
        // アイドルタイムアウト: 30分
    });
    return factory;
}
```

#### ログアウト処理

```java
// Spring Security のログアウト設定
http
    .logout(logout -> logout
        .logoutUrl("/logout")
        .logoutSuccessUrl("/login?logout")
        .invalidateHttpSession(true)        // セッションを無効化
        .deleteCookies("JSESSIONID")        // Cookieを削除
        .clearAuthentication(true)          // 認証情報をクリア
    );
```

### 3.4 セッション管理のチェックリスト

```
セッション管理チェックリスト：
□ セッションIDは十分にランダム（推測困難）か？
□ ログイン成功時にセッションIDを再生成しているか？
□ Cookie に HttpOnly 属性を設定しているか？
□ Cookie に Secure 属性を設定しているか？
□ Cookie に SameSite 属性を設定しているか？
□ 適切なセッションタイムアウトを設定しているか？
□ ログアウト時にセッションを完全に無効化しているか？
□ 同時セッション数を制限しているか？
□ HTTPSを使用しているか？
```

---

## 4. Spring Security の基本設定

### 4.1 依存関係

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>
```

### 4.2 基本的なセキュリティ設定

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) 
            throws Exception {
        http
            // 認可設定
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/", "/public/**", "/css/**", "/js/**").permitAll()
                .requestMatchers("/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            )
            // フォームログイン
            .formLogin(form -> form
                .loginPage("/login")
                .defaultSuccessUrl("/dashboard")
                .permitAll()
            )
            // ログアウト
            .logout(logout -> logout
                .logoutUrl("/logout")
                .logoutSuccessUrl("/login?logout")
                .invalidateHttpSession(true)
                .deleteCookies("JSESSIONID")
            )
            // CSRF保護（デフォルト有効）
            .csrf(csrf -> csrf
                .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
            )
            // セッション管理
            .sessionManagement(session -> session
                .sessionFixation().changeSessionId()
                .maximumSessions(1)  // 同時ログイン数の制限
                .expiredUrl("/login?expired")
            )
            // セキュリティヘッダー
            .headers(headers -> headers
                .contentSecurityPolicy(csp -> 
                    csp.policyDirectives("default-src 'self'"))
                .frameOptions(frame -> frame.deny())
            );
        
        return http.build();
    }
    
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
```

---

## 5. セキュリティヘッダー

### 5.1 重要なセキュリティヘッダー

| ヘッダー | 目的 | 推奨値 |
|---------|------|--------|
| `Content-Security-Policy` | XSS対策 | `default-src 'self'` |
| `X-Content-Type-Options` | MIMEスニッフィング防止 | `nosniff` |
| `X-Frame-Options` | クリックジャッキング防止 | `DENY` |
| `Strict-Transport-Security` | HTTPS強制 | `max-age=31536000; includeSubDomains` |
| `X-XSS-Protection` | ブラウザXSSフィルター | `0`（CSPを使用する場合） |
| `Referrer-Policy` | Referer情報の制御 | `strict-origin-when-cross-origin` |

```java
// Spring Security で自動設定される（一部カスタマイズ可能）
http.headers(headers -> headers
    .contentSecurityPolicy(csp -> 
        csp.policyDirectives("default-src 'self'; script-src 'self'"))
    .httpStrictTransportSecurity(hsts -> 
        hsts.includeSubDomains(true).maxAgeInSeconds(31536000))
    .frameOptions(frame -> frame.deny())
);
```

---

## 📝 確認問題

1. CSRFはどのような攻撃ですか？成立条件を説明してください
2. CSRFトークンの仕組みを説明してください
3. SameSite Cookie属性の3つの値（Strict, Lax, None）の違いは何ですか？
4. セッション固定攻撃とは何ですか？どう対策しますか？
5. REST API（Bearer Token認証）でCSRF対策が不要な理由を説明してください
6. セッションCookieに設定すべき属性を3つ挙げ、それぞれの効果を説明してください

---

## 📖 参考資料
- [OWASP - CSRF Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
- [OWASP - Session Management](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)
- [Spring Security - CSRF](https://docs.spring.io/spring-security/reference/features/exploits/csrf.html)
