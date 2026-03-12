# OAuth 2.0 の仕組み

## 📚 この資料で学ぶこと
- OAuth 2.0 とは何か
- なぜ OAuth 2.0 が必要なのか
- OAuth 2.0 の基本的な用語と概念
- 認可フロー（グラントタイプ）の仕組み
- セキュリティ上の注意点

> ⏰ 想定時間：1時間

---

## 1. OAuth 2.0 とは

### 1.1 OAuth 2.0 の定義

OAuth 2.0 は、**アプリケーションがユーザーのリソースに安全にアクセスするための認可フレームワーク**です。

> 💡 **認証（Authentication）と認可（Authorization）の違い**
> - **認証**：「あなたは誰？」→ 本人確認
> - **認可**：「あなたは何ができる？」→ 権限の付与
>
> OAuth 2.0 は**認可**のためのプロトコルです。

### 1.2 OAuth 2.0 が解決する問題

**OAuth 2.0 がない世界：**

```
ユーザー「写真管理アプリで、Googleドライブの写真を使いたい」

❌ 危険な方法：
ユーザー → 写真管理アプリに Google のパスワードを教える
         → アプリが Google に直接ログイン
         → 写真だけでなく、メールも連絡先も全部見れてしまう！
```

**OAuth 2.0 がある世界：**

```
ユーザー「写真管理アプリで、Googleドライブの写真を使いたい」

✅ 安全な方法：
ユーザー → Google のログイン画面で直接認証
         → 「写真へのアクセスを許可しますか？」と確認
         → 許可すると、写真だけにアクセスできるトークンが発行
         → アプリはトークンを使って写真のみにアクセス
         → パスワードは一切渡さない！
```

### 1.3 日常での OAuth 2.0

皆さんも日常的に使っています：

| サービス | OAuth 2.0 の利用例 |
|---------|-------------------|
| **Webサイト** | 「Googleでログイン」「GitHubでログイン」 |
| **Slack** | Googleカレンダーとの連携 |
| **GitHub** | CI/CDツールへのリポジトリアクセス許可 |
| **スマホアプリ** | Twitterアカウントでの投稿連携 |

---

## 2. OAuth 2.0 の登場人物

### 2.1 4つの役割（ロール）

```
┌──────────────────┐     ┌──────────────────┐
│  リソースオーナー   │     │    クライアント     │
│  (Resource Owner) │     │    (Client)       │
│                  │     │                  │
│  = ユーザー本人    │     │  = 利用するアプリ   │
│  例：あなた自身    │     │  例：写真管理アプリ  │
└──────────────────┘     └──────────────────┘
         │                       │
         ▼                       ▼
┌──────────────────┐     ┌──────────────────┐
│   認可サーバー      │     │  リソースサーバー    │
│ (Authorization    │     │ (Resource Server) │
│  Server)         │     │                  │
│  = 許可を出す      │     │  = データを持つ     │
│  例：Google認可    │     │  例：Googleドライブ  │
└──────────────────┘     └──────────────────┘
```

### 2.2 各ロールの詳細

| ロール | 役割 | 具体例 |
|--------|------|--------|
| **リソースオーナー** | リソースの所有者。アクセスを許可する人 | あなた（Googleアカウントの持ち主） |
| **クライアント** | リソースにアクセスしたいアプリケーション | 写真管理アプリ、Slack |
| **認可サーバー** | アクセストークンを発行するサーバー | Google の認可エンドポイント |
| **リソースサーバー** | 保護されたリソースを持つサーバー | Google Drive API |

> 💡 認可サーバーとリソースサーバーは**同じサービス内にある**ことが多いです（例：どちらもGoogle）

---

## 3. OAuth 2.0 の重要な概念

### 3.1 アクセストークン（Access Token）

**アクセストークン**は、保護されたリソースにアクセスするための「通行証」です。

```
アクセストークンの特徴：
├── 有効期限がある（通常 1時間程度）
├── 特定のスコープ（権限範囲）を持つ
├── リソースオーナーの代わりにリソースにアクセスできる
└── パスワードの代わりとなる安全な認証情報
```

### 3.2 リフレッシュトークン（Refresh Token）

```
アクセストークンの有効期限が切れたら...

❌ 毎回ユーザーに再認証してもらう → 面倒！

✅ リフレッシュトークンで新しいアクセストークンを取得
   → ユーザーの操作なしで継続利用可能
```

```
クライアント                    認可サーバー
    |                              |
    |  リフレッシュトークンを送信      |
    |----------------------------->|
    |                              |
    |  新しいアクセストークンを返却    |
    |<-----------------------------|
    |                              |
```

### 3.3 スコープ（Scope）

**スコープ**は、アクセストークンに付与する**権限の範囲**を定義します。

```
例：Google API のスコープ

scope=email                    → メールアドレスのみ
scope=profile                  → プロフィール情報
scope=drive.readonly           → Googleドライブの読み取り専用
scope=drive                    → Googleドライブの読み書き
scope=email profile drive.readonly → 複数のスコープを組み合わせ
```

> 💡 **最小権限の原則**：必要最低限のスコープだけを要求しましょう

### 3.4 認可コード（Authorization Code）

アクセストークンを取得するための**一時的なコード**です。

```
認可コードの特徴：
├── 一度だけ使える（使い捨て）
├── 有効期限が非常に短い（通常 数分）
├── アクセストークンと交換するために使う
└── ブラウザを経由して受け渡しされる
```

---

## 4. 認可コードフロー（Authorization Code Flow）

**最も安全で一般的なフロー**です。Webアプリケーションで標準的に使われます。

### 4.1 全体の流れ

```
ユーザー        クライアント(アプリ)     認可サーバー      リソースサーバー
  |                  |                    |                  |
  | 1.アプリにアクセス  |                    |                  |
  |----------------->|                    |                  |
  |                  |                    |                  |
  | 2.認可サーバーへ    |  3.認可リクエスト    |                  |
  |  リダイレクト      |------------------->|                  |
  |<-----------------| (response_type=code)|                  |
  |                  |                    |                  |
  | 4.ログイン画面     |                    |                  |
  |<-------------------------------------|                  |
  |                  |                    |                  |
  | 5.ログイン＋許可   |                    |                  |
  |------------------------------------->|                  |
  |                  |                    |                  |
  | 6.認可コード付き   |                    |                  |
  |  リダイレクト      |                    |                  |
  |----------------->| (code=xxx)         |                  |
  |                  |                    |                  |
  |                  | 7.トークンリクエスト  |                  |
  |                  | (code + secret)    |                  |
  |                  |------------------->|                  |
  |                  |                    |                  |
  |                  | 8.アクセストークン   |                  |
  |                  |<-------------------|                  |
  |                  |                    |                  |
  |                  | 9.APIリクエスト                         |
  |                  | (Bearer token)                        |
  |                  |--------------------------------------->|
  |                  |                                        |
  |                  | 10.リソース返却                          |
  |                  |<---------------------------------------|
  |                  |                    |                  |
  | 11.結果表示       |                    |                  |
  |<-----------------|                    |                  |
```

### 4.2 各ステップの詳細

#### ステップ 3：認可リクエスト

```
GET https://auth.example.com/authorize?
    response_type=code              ← 認可コードを要求
    &client_id=YOUR_CLIENT_ID       ← アプリの識別子
    &redirect_uri=https://app.example.com/callback  ← コールバックURL
    &scope=read write               ← 要求する権限
    &state=xyz123                   ← CSRF対策用のランダム値
```

| パラメータ | 説明 |
|-----------|------|
| `response_type` | `code` を指定（認可コードフロー） |
| `client_id` | アプリ登録時に発行される識別子 |
| `redirect_uri` | 認可後にリダイレクトされるURL |
| `scope` | 要求するアクセス範囲 |
| `state` | CSRF攻撃防止用のランダムな文字列 |

#### ステップ 6：認可コードの受け取り

```
GET https://app.example.com/callback?
    code=AUTHORIZATION_CODE         ← 認可コード
    &state=xyz123                   ← 送信時と同じ state 値
```

#### ステップ 7：トークンリクエスト

```
POST https://auth.example.com/token
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code       ← 認可コードフロー
&code=AUTHORIZATION_CODE            ← 受け取った認可コード
&redirect_uri=https://app.example.com/callback
&client_id=YOUR_CLIENT_ID
&client_secret=YOUR_CLIENT_SECRET   ← アプリの秘密鍵
```

#### ステップ 8：トークンレスポンス

```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4...",
  "scope": "read write"
}
```

#### ステップ 9：リソースへのアクセス

```
GET https://api.example.com/user/photos
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6...
```

---

## 5. その他の認可フロー

### 5.1 フローの一覧

| フロー名 | 用途 | セキュリティ |
|---------|------|------------|
| **認可コードフロー** | Webアプリ（サーバーサイド） | ⭐⭐⭐ 最も安全 |
| **認可コードフロー + PKCE** | SPA、モバイルアプリ | ⭐⭐⭐ 推奨 |
| **クライアントクレデンシャル** | サーバー間通信 | ⭐⭐ |
| **~~インプリシットフロー~~** | ~~SPA（旧方式）~~ | ⭐ **非推奨** |
| **~~リソースオーナーパスワード~~** | ~~信頼できるアプリ~~ | ⭐ **非推奨** |

### 5.2 認可コードフロー + PKCE（推奨）

**PKCE（Proof Key for Code Exchange）**は、SPA やモバイルアプリなど、**クライアントシークレットを安全に保管できない**環境向けの拡張です。

```
PKCEの仕組み：

1. クライアントがランダムな文字列を生成
   code_verifier = "dBjftJeZ4CVP-mB92K27uhbUJU1p1r..."

2. そのハッシュ値を計算
   code_challenge = BASE64URL(SHA256(code_verifier))
                  = "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM"

3. 認可リクエストに code_challenge を含める
   → 認可コードと紐付けて保存される

4. トークンリクエストに code_verifier を含める
   → サーバーがハッシュ値を検証
   → 認可コードを横取りされても、code_verifier がないとトークン取得不可
```

### 5.3 クライアントクレデンシャルフロー

**ユーザーが関与しない**、サーバー間の通信で使用します。

```
クライアント(サーバー)          認可サーバー
      |                          |
      | client_id + secret       |
      |------------------------->|
      |                          |
      | アクセストークン           |
      |<-------------------------|
      |                          |
```

```
POST https://auth.example.com/token
Content-Type: application/x-www-form-urlencoded

grant_type=client_credentials
&client_id=YOUR_CLIENT_ID
&client_secret=YOUR_CLIENT_SECRET
&scope=api.read
```

---

## 6. セキュリティ上の注意点

### 6.1 必ず守るべきこと

| 項目 | 説明 |
|------|------|
| **HTTPS を使う** | トークンが平文で流れるのを防ぐ |
| **state パラメータ** | CSRF攻撃を防ぐため、必ず検証する |
| **redirect_uri の厳密な検証** | オープンリダイレクトを防ぐ |
| **クライアントシークレットの保護** | フロントエンドに埋め込まない |
| **トークンの安全な保管** | ローカルストレージではなくメモリやhttpOnlyクッキー |
| **最小スコープの原則** | 必要最低限の権限のみ要求する |

### 6.2 よくある攻撃と対策

```
攻撃1：認可コード横取り攻撃
├── 攻撃者が認可コードを傍受
├── 対策：PKCEを使う、redirect_uriを厳密に検証

攻撃2：CSRF攻撃
├── 攻撃者が偽の認可レスポンスを送る
├── 対策：stateパラメータを検証

攻撃3：トークン漏洩
├── XSSなどでトークンが盗まれる
├── 対策：httpOnlyクッキー、短い有効期限

攻撃4：フィッシング
├── 偽の認可画面でパスワードを盗む
├── 対策：正規のドメインか確認
```

### 6.3 トークンの保管方法

```
保管場所の比較：

❌ LocalStorage
   → XSS攻撃で簡単に盗まれる

△ SessionStorage
   → XSS攻撃のリスクあり、タブを閉じると消える

✅ httpOnly Cookie
   → JavaScriptからアクセス不可、CSRF対策は必要

✅ メモリ（変数）
   → 最も安全だが、ページ更新で消える
   → リフレッシュトークンはhttpOnly Cookieに保存
```

---

## 7. 実際の利用例：GitHub OAuth

### 7.1 アプリ登録

GitHub の Settings > Developer settings > OAuth Apps で登録：

```
Application name: My App
Homepage URL: https://myapp.example.com
Authorization callback URL: https://myapp.example.com/callback
↓
Client ID: Iv1.abcdef123456
Client Secret: secret_xxxxxxxxxxxxx
```

### 7.2 実装の流れ

```javascript
// 1. ユーザーをGitHubの認可画面にリダイレクト
app.get('/login/github', (req, res) => {
  const state = generateRandomString(32);
  req.session.oauthState = state;
  
  const params = new URLSearchParams({
    client_id: 'Iv1.abcdef123456',
    redirect_uri: 'https://myapp.example.com/callback',
    scope: 'user repo',
    state: state
  });
  
  res.redirect(`https://github.com/login/oauth/authorize?${params}`);
});

// 2. コールバックで認可コードを受け取り、トークンに交換
app.get('/callback', async (req, res) => {
  const { code, state } = req.query;
  
  // state の検証（CSRF対策）
  if (state !== req.session.oauthState) {
    return res.status(403).send('Invalid state');
  }
  
  // 認可コードをアクセストークンに交換
  const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      client_id: 'Iv1.abcdef123456',
      client_secret: 'secret_xxxxxxxxxxxxx',
      code: code
    })
  });
  
  const { access_token } = await tokenResponse.json();
  
  // 3. アクセストークンでGitHub APIにアクセス
  const userResponse = await fetch('https://api.github.com/user', {
    headers: {
      'Authorization': `Bearer ${access_token}`
    }
  });
  
  const user = await userResponse.json();
  console.log(`ログインユーザー: ${user.login}`);
});
```

---

## 8. まとめ

### 8.1 OAuth 2.0 の全体像

```
OAuth 2.0 のポイント：
├── パスワードを共有せずにリソースアクセスを委任
├── スコープで最小限の権限を付与
├── アクセストークンは短命、リフレッシュトークンで更新
├── 認可コードフロー（+PKCE）が最も安全
└── セキュリティ対策（HTTPS、state、redirect_uri検証）が必須
```

### 8.2 フロー選択のガイド

```
どのフローを使う？

Webアプリ（サーバーサイド）
  → 認可コードフロー

SPA / モバイルアプリ
  → 認可コードフロー + PKCE

サーバー間通信（ユーザー不在）
  → クライアントクレデンシャルフロー
```

---

## 📝 確認問題

1. OAuth 2.0 は「認証」と「認可」のどちらのためのプロトコルですか？
2. OAuth 2.0 の4つのロール（登場人物）をすべて挙げてください
3. 認可コードフローで、認可コードをアクセストークンに交換する際に必要な情報は何ですか？
4. PKCE はどのような問題を解決するための仕組みですか？
5. アクセストークンの保管場所として推奨されるのはどこですか？その理由も説明してください

---

## 📖 参考資料
- [RFC 6749 - The OAuth 2.0 Authorization Framework](https://tools.ietf.org/html/rfc6749)
- [RFC 7636 - PKCE](https://tools.ietf.org/html/rfc7636)
- [OAuth 2.0 Security Best Current Practice](https://tools.ietf.org/html/draft-ietf-oauth-security-topics)
