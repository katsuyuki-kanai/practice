# REST API設計原則

## 目次
1. [REST APIとは](#rest-apiとは)
2. [RESTの6つの原則](#restの6つの原則)
3. [REST API設計のベストプラクティス](#rest-api設計のベストプラクティス)
4. [HTTPメソッドの使い分け](#httpメソッドの使い分け)
5. [ステータスコードの適切な使用](#ステータスコードの適切な使用)
6. [実践例](#実践例)

---

## REST APIとは

**REST (Representational State Transfer)** は、Webサービスの設計スタイルの1つです。2000年にRoy Fieldingによって提唱されました。

### RESTの特徴
- **リソース指向**: すべてをリソース（データや機能）として扱う
- **HTTPプロトコルの活用**: Webの標準技術を最大限に利用
- **シンプルで直感的**: URLとHTTPメソッドでAPIの意図が理解しやすい

---

## RESTの6つの原則

### 1. クライアント・サーバー分離 (Client-Server)

**概要**: クライアントとサーバーの責任を明確に分離し、それぞれが独立して進化できるようにする。

**詳細説明**:
- **クライアント**: ユーザーインターフェース（UI/UX）に集中
- **サーバー**: データストレージとビジネスロジックに集中
- 相互依存性を最小限に抑え、独立したスケーリングを可能にする

```
┌─────────────┐    HTTP    ┌─────────────┐
│ クライアント │ <--------> │ サーバー     │
│ (UI/UX)     │            │ (API/DB)    │
└─────────────┘            └─────────────┘
```

**具体例**:

**良い設計**:
```javascript
// フロントエンド (React/Vue.js)
fetch('/api/users/123')
  .then(response => response.json())
  .then(user => updateUI(user));

// バックエンド (Node.js/Python/Java)
app.get('/api/users/:id', (req, res) => {
  const user = database.getUser(req.params.id);
  res.json(user);
});
```

**メリット**:
- フロントエンドとバックエンドを別チームで開発可能
- モバイルアプリ、Webアプリ、デスクトップアプリが同じAPIを利用可能
- 技術スタックを独立して選択・更新可能

---

### 2. ステートレス (Stateless)

**概要**: サーバーはクライアントのセッション状態を保持しない。各リクエストは必要な情報をすべて含む。

**詳細説明**:
- サーバーは前回のリクエスト内容を覚えていない
- 認証情報、ページング情報なども毎回送信する
- スケーラビリティとシンプルさが向上

**悪い例（ステートフル）**:
```http
POST /login
{
  "username": "user123",
  "password": "pass456"
}
# サーバーがセッションを保持

GET /profile
# 認証情報なし（セッションに依存）

GET /users/page/next
# ページング状態をサーバーが記憶
```

**良い例（ステートレス）**:
```http
GET /profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
# 毎回認証情報を送信

GET /users?page=3&limit=20&sort=created_at&order=desc
# すべてのパラメータを明示的に指定
```

**実装例**:
```javascript
// JWTトークンベースの認証
const token = localStorage.getItem('auth_token');

fetch('/api/profile', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

**メリット**:
- サーバーのメモリ使用量が少ない
- 負荷分散が容易（どのサーバーでもリクエスト処理可能）
- 障害回復が簡単（セッション情報の復旧不要）

---

### 3. キャッシュ可能 (Cacheable)

**概要**: レスポンスデータがキャッシュ可能かどうかを明示し、不要な通信を削減する。

**詳細説明**:
- HTTPヘッダーでキャッシュポリシーを制御
- ブラウザ、CDN、プロキシサーバーでのキャッシュを活用
- ネットワーク効率とレスポンス速度の向上

**キャッシュヘッダーの例**:

```http
# 静的リソース（1年間キャッシュ）
GET /api/countries
HTTP/1.1 200 OK
Cache-Control: public, max-age=31536000
ETag: "v1.2345"
Last-Modified: Wed, 15 Nov 2023 10:00:00 GMT

# 動的コンテンツ（1時間キャッシュ）
GET /api/users/123
HTTP/1.1 200 OK
Cache-Control: private, max-age=3600
ETag: "user-123-v5"

# キャッシュ無効
POST /api/users
HTTP/1.1 201 Created
Cache-Control: no-cache, no-store
```

**条件付きリクエスト**:
```http
# クライアントが保持するETagを送信
GET /api/users/123
If-None-Match: "user-123-v5"

# データが変更されていない場合
HTTP/1.1 304 Not Modified
# ボディなし、ネットワーク帯域を節約
```

**実装例**:
```javascript
// Express.jsでのキャッシュ制御
app.get('/api/users/:id', (req, res) => {
  const user = getUser(req.params.id);
  const etag = generateETag(user);
  
  if (req.headers['if-none-match'] === etag) {
    return res.status(304).send();
  }
  
  res.set({
    'ETag': etag,
    'Cache-Control': 'private, max-age=3600'
  });
  res.json(user);
});
```

---

### 4. 統一インターフェース (Uniform Interface)

RESTの最も重要な制約。以下の4つのサブ原則があります:

#### 4-1. リソースの識別 (Resource Identification)

**概要**: URIでリソースを一意に識別できる。

**詳細説明**:
- 各リソースは明確で一意なURIを持つ
- URIはリソースの場所ではなく、リソース自体を表現
- RESTfulなURL設計の基礎

**具体例**:
```
# 良い例：リソースが明確
GET /users/123              # ユーザーID 123
GET /users/123/posts        # ユーザー123の投稿一覧
GET /posts/456              # 投稿ID 456
GET /posts/456/comments     # 投稿456のコメント一覧
GET /categories/tech/posts  # テクノロジーカテゴリの投稿

# 悪い例：リソースが不明確
GET /getUserData?id=123
GET /getPostsForUser?userId=123
GET /showPost?postId=456
```

**階層構造の表現**:
```
/organizations/123/departments/456/employees/789
# 組織123の部署456の従業員789
```

#### 4-2. リソースの操作は表現を通じて行う (Resource Manipulation Through Representations)

**概要**: クライアントはリソースの表現（JSON、XMLなど）を通じてリソースを操作する。

**詳細説明**:
- リソース自体ではなく、その表現を送受信
- 同じリソースでも複数の表現形式を提供可能
- Content-Typeでメディアタイプを指定

**具体例**:
```http
# JSON表現でユーザーを作成
POST /users
Content-Type: application/json

{
  "name": "田中太郎",
  "email": "tanaka@example.com",
  "department": "engineering"
}

# XML表現も可能
POST /users
Content-Type: application/xml

<user>
  <name>田中太郎</name>
  <email>tanaka@example.com</email>
  <department>engineering</department>
</user>

# CSVでの一括処理
POST /users/bulk
Content-Type: text/csv

name,email,department
田中太郎,tanaka@example.com,engineering
山田花子,yamada@example.com,sales
```

**コンテントネゴシエーション**:
```http
GET /users/123
Accept: application/json, application/xml;q=0.8

# サーバーが適切な形式で応答
Content-Type: application/json
{
  "id": 123,
  "name": "田中太郎"
}
```

#### 4-3. 自己記述的メッセージ (Self-Descriptive Messages)

**概要**: メッセージだけで処理方法が完全に理解できる。

**詳細説明**:
- HTTPヘッダーで十分な情報を提供
- メッセージの解釈に外部情報が不要
- API仕様書なしでも基本的な操作が理解可能

**具体例**:
```http
# 自己記述的なリクエスト
POST /api/v1/users
Content-Type: application/json
Accept: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiI...
User-Agent: MyApp/1.2.3

{
  "name": "田中太郎",
  "email": "tanaka@example.com"
}

# 自己記述的なレスポンス
HTTP/1.1 201 Created
Content-Type: application/json; charset=utf-8
Location: /api/v1/users/123
Content-Length: 156
Date: Tue, 17 Dec 2024 10:00:00 GMT

{
  "id": 123,
  "name": "田中太郎",
  "email": "tanaka@example.com",
  "created_at": "2024-12-17T10:00:00Z"
}
```

**スキーマの埋め込み**:
```json
{
  "$schema": "https://api.example.com/schemas/user.json",
  "id": 123,
  "name": "田中太郎",
  "email": "tanaka@example.com"
}
```

#### 4-4. HATEOAS (Hypermedia as the Engine of Application State)

**概要**: レスポンスに次に実行可能なアクションへのリンクを含める。

**詳細説明**:
- クライアントはURLをハードコーディングしない
- サーバーが利用可能なアクションを動的に提供
- APIの進化に対する柔軟性が向上

**基本的なHATEOAS**:
```json
{
  "id": 123,
  "name": "田中太郎",
  "email": "tanaka@example.com",
  "status": "active",
  "_links": {
    "self": {
      "href": "/api/users/123"
    },
    "edit": {
      "href": "/api/users/123",
      "method": "PUT"
    },
    "delete": {
      "href": "/api/users/123",
      "method": "DELETE"
    },
    "posts": {
      "href": "/api/users/123/posts"
    },
    "avatar": {
      "href": "/api/users/123/avatar",
      "type": "image/jpeg"
    }
  }
}
```

**HAL（Hypertext Application Language）形式**:
```json
{
  "_links": {
    "self": { "href": "/orders/523" },
    "customer": { "href": "/customers/1234" },
    "cancel": { 
      "href": "/orders/523/cancel",
      "method": "POST",
      "title": "注文をキャンセル"
    }
  },
  "_embedded": {
    "items": [
      {
        "_links": { "self": { "href": "/products/A123" } },
        "name": "商品A",
        "price": 1000
      }
    ]
  },
  "id": 523,
  "total": 1000,
  "status": "pending"
}
```

**動的なリンク生成**:
```json
{
  "id": 123,
  "name": "田中太郎",
  "status": "pending_approval",
  "_links": {
    "self": { "href": "/users/123" },
    "approve": { 
      "href": "/users/123/approve",
      "method": "POST"
    },
    "reject": { 
      "href": "/users/123/reject", 
      "method": "POST"
    }
    // status が "approved" の場合は "deactivate" リンクが表示される
  }
}
```

---

### 5. 階層化システム (Layered System)

**概要**: クライアントは中間層（プロキシ、ゲートウェイなど）の存在を意識する必要がない。

**詳細説明**:
- システムを階層に分割してスケーラビリティを向上
- セキュリティ、キャッシング、負荷分散などの機能を透過的に追加
- 各層は隣接する層のみを知る

**典型的な階層構造**:
```
クライアント
    ↓
CDN (CloudFlare、AWS CloudFront)
    ↓
ロードバランサー (Nginx、HAProxy)
    ↓
APIゲートウェイ (AWS API Gateway、Kong)
    ↓
マイクロサービス群 (User Service、Order Service)
    ↓
データベース (PostgreSQL、MongoDB)
```

**具体例**:

**1. CDN層**:
```http
# クライアントリクエスト
GET /api/countries

# CDNでキャッシュヒット
HTTP/1.1 200 OK
X-Cache: HIT
X-Cache-Hits: 47
Content-Type: application/json
```

**2. APIゲートウェイ層**:
```yaml
# Kong設定例
services:
- name: user-service
  url: http://user-service:3000
  routes:
  - name: users
    paths: ["/api/users"]
    plugins:
    - name: rate-limiting
      config:
        minute: 100
    - name: jwt
    - name: cors
```

**3. マイクロサービス層**:
```javascript
// APIゲートウェイから内部サービスへ
const userService = 'http://internal-user-service:3000';
const orderService = 'http://internal-order-service:3001';

app.get('/api/users/:id/orders', async (req, res) => {
  // 内部サービス間通信
  const user = await fetch(`${userService}/users/${req.params.id}`);
  const orders = await fetch(`${orderService}/users/${req.params.id}/orders`);
  
  res.json({ user: await user.json(), orders: await orders.json() });
});
```

**メリット**:
- **セキュリティ**: 各層で認証・認可を実装
- **パフォーマンス**: キャッシュ層を透過的に追加
- **可用性**: 負荷分散とフェイルオーバー
- **監視**: 各層でログとメトリクスを収集

---

### 6. コードオンデマンド (Code-On-Demand) ※オプション

**概要**: サーバーがクライアントに実行可能なコードを送信できる。

**詳細説明**:
- RESTの唯一のオプション制約
- クライアントの機能を動的に拡張
- JavaScriptスクリプト、Webアセンブリなどの送信

**具体例**:

**1. JavaScript配信**:
```http
GET /api/form-validation.js
HTTP/1.1 200 OK
Content-Type: application/javascript

function validateEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

// 動的バリデーションルール
const rules = {
  password: {
    minLength: 8,
    requireSpecialChar: true
  }
};
```

**2. 設定駆動UI**:
```json
{
  "form": {
    "fields": [
      {
        "name": "email",
        "type": "email",
        "required": true,
        "validation": "/api/validators/email.js"
      },
      {
        "name": "age",
        "type": "number",
        "min": 18,
        "validation": "/api/validators/age.js"
      }
    ]
  }
}
```

**3. WebAssemblyの配信**:
```http
GET /api/image-processor.wasm
HTTP/1.1 200 OK
Content-Type: application/wasm

# バイナリデータ
# クライアントでリアルタイム画像処理を実行
```

**実装例**:
```javascript
// 動的スクリプト読み込み
fetch('/api/business-rules.js')
  .then(response => response.text())
  .then(code => {
    const script = document.createElement('script');
    script.textContent = code;
    document.head.appendChild(script);
    
    // サーバーから送られたビジネスロジックを実行
    if (typeof applyBusinessRules === 'function') {
      applyBusinessRules(formData);
    }
  });
```

**使用場面**:
- A/Bテストの動的な機能切り替え
- 地域別のビジネスルール配信
- リアルタイム計算処理（金融商品の価格計算など）
- プラグイン機能の動的読み込み

**メリットとデメリット**:

✅ **メリット**:
- クライアント機能の動的拡張
- サーバー側でのビジネスロジック集中管理
- ネットワーク効率の向上（必要な時だけダウンロード）

❌ **デメリット**:
- セキュリティリスク（任意コード実行）
- デバッグの複雑化
- キャッシュ戦略の複雑化

---

## REST API設計のベストプラクティス

### 1. リソース名には名詞を使用する

**悪い例:**
```
POST /createUser
GET /getUsers
DELETE /deleteUser/123
```

**良い例:**
```
POST /users
GET /users
DELETE /users/123
```

### 2. 複数形を使用する

**統一感のある例:**
```
GET    /users          # すべてのユーザー
GET    /users/123      # 特定のユーザー
POST   /users          # ユーザー作成
PUT    /users/123      # ユーザー更新
DELETE /users/123      # ユーザー削除
```

### 3. 階層構造を利用する

```
GET /users/123/posts           # ユーザー123の投稿一覧
GET /users/123/posts/456       # ユーザー123の投稿456
GET /posts/456/comments        # 投稿456のコメント一覧
```

### 4. フィルタリング、ソート、ページングはクエリパラメータで

```
GET /users?age=25&sort=created_at&order=desc&page=2&limit=20
GET /products?category=electronics&price_min=1000&price_max=5000
```

### 5. バージョニング

**方法1: URLパスに含める (推奨)**
```
https://api.example.com/v1/users
https://api.example.com/v2/users
```

**方法2: ヘッダーで指定**
```http
Accept: application/vnd.example.v1+json
```

---

## HTTPメソッドの使い分け

| メソッド | 用途 | 冪等性 | 安全性 |
|---------|------|--------|--------|
| GET | リソースの取得 | ○ | ○ |
| POST | リソースの作成 | × | × |
| PUT | リソースの完全更新 | ○ | × |
| PATCH | リソースの部分更新 | × | × |
| DELETE | リソースの削除 | ○ | × |

### 冪等性とは
同じ操作を何度実行しても結果が同じになる性質

```
DELETE /users/123  # 1回目: 削除成功
DELETE /users/123  # 2回目: すでに存在しないが結果は同じ（エラーまたは404）
```

### 安全性とは
リソースの状態を変更しない性質（読み取り専用）

---

## ステータスコードの適切な使用

### 2xx 成功
- **200 OK**: 一般的な成功レスポンス
- **201 Created**: リソースの作成成功（POSTで使用）
- **204 No Content**: 成功したがレスポンスボディなし（DELETEで使用）

### 3xx リダイレクト
- **301 Moved Permanently**: リソースが恒久的に移動
- **304 Not Modified**: キャッシュが有効

### 4xx クライアントエラー
- **400 Bad Request**: リクエストが不正
- **401 Unauthorized**: 認証が必要
- **403 Forbidden**: アクセス権限がない
- **404 Not Found**: リソースが見つからない
- **409 Conflict**: リソースの競合（すでに存在するなど）
- **422 Unprocessable Entity**: バリデーションエラー

### 5xx サーバーエラー
- **500 Internal Server Error**: サーバー内部エラー
- **503 Service Unavailable**: サービス利用不可（メンテナンスなど）

---

## 実践例

### ユーザー管理APIの設計

#### 1. ユーザー一覧取得
```http
GET /api/v1/users?page=1&limit=20&sort=created_at&order=desc
```

**レスポンス例:**
```json
{
  "data": [
    {
      "id": 1,
      "name": "田中太郎",
      "email": "tanaka@example.com",
      "created_at": "2025-01-01T10:00:00Z"
    }
  ],
  "pagination": {
    "current_page": 1,
    "total_pages": 5,
    "total_count": 100,
    "limit": 20
  }
}
```

#### 2. ユーザー作成
```http
POST /api/v1/users
Content-Type: application/json

{
  "name": "山田花子",
  "email": "yamada@example.com",
  "password": "securePassword123"
}
```

**レスポンス例:**
```http
HTTP/1.1 201 Created
Location: /api/v1/users/123

{
  "id": 123,
  "name": "山田花子",
  "email": "yamada@example.com",
  "created_at": "2025-12-16T10:00:00Z"
}
```

#### 3. ユーザー情報取得
```http
GET /api/v1/users/123
```

**レスポンス例:**
```json
{
  "id": 123,
  "name": "山田花子",
  "email": "yamada@example.com",
  "created_at": "2025-12-16T10:00:00Z",
  "updated_at": "2025-12-16T10:00:00Z"
}
```

#### 4. ユーザー情報更新（完全更新）
```http
PUT /api/v1/users/123
Content-Type: application/json

{
  "name": "山田花子",
  "email": "yamada.hanako@example.com",
  "phone": "090-1234-5678"
}
```

#### 5. ユーザー情報更新（部分更新）
```http
PATCH /api/v1/users/123
Content-Type: application/json

{
  "phone": "090-1234-5678"
}
```

#### 6. ユーザー削除
```http
DELETE /api/v1/users/123
```

**レスポンス例:**
```http
HTTP/1.1 204 No Content
```

### エラーレスポンスの設計

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "入力内容に誤りがあります",
    "details": [
      {
        "field": "email",
        "message": "メールアドレスの形式が正しくありません"
      },
      {
        "field": "password",
        "message": "パスワードは8文字以上である必要があります"
      }
    ]
  }
}
```

---

## まとめ

### REST API設計のチェックリスト

- [ ] リソース名に名詞を使用している
- [ ] HTTPメソッドを適切に使い分けている
- [ ] ステータスコードが適切である
- [ ] URLは階層構造を適切に表現している
- [ ] ステートレスな設計になっている
- [ ] バージョニングを考慮している
- [ ] エラーメッセージが分かりやすい
- [ ] ドキュメントが整備されている

### 学習のポイント

1. **まずは基本の4つの操作から始める**
   - GET（取得）、POST（作成）、PUT（更新）、DELETE（削除）

2. **実際にAPIを作ってみる**
   - 小さなプロジェクトで実践経験を積む

3. **既存の優れたAPIを研究する**
   - GitHub API、Twitter API、Stripe APIなど

4. **OpenAPI/Swaggerでドキュメント化**
   - API仕様書の作成方法を学ぶ

---

## 参考資料

- Roy Fielding's Dissertation: [Architectural Styles and the Design of Network-based Software Architectures](https://www.ics.uci.edu/~fielding/pubs/dissertation/top.htm)
- [REST API Tutorial](https://restfulapi.net/)
- [Microsoft REST API Guidelines](https://github.com/microsoft/api-guidelines)
