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
- クライアントとサーバーは独立して開発・進化できる
- UIとデータストレージの関心事を分離

```
クライアント <---HTTP---> サーバー
(UI/UX)                    (ビジネスロジック/DB)
```

### 2. ステートレス (Stateless)
- サーバーはクライアントの状態を保持しない
- 各リクエストは完結した情報を含む必要がある

**悪い例:**
```
GET /users/next  # 前回のリクエストに依存
```

**良い例:**
```
GET /users?page=2&limit=10  # すべての情報を含む
```

### 3. キャッシュ可能 (Cacheable)
- レスポンスはキャッシュ可能かどうかを明示する
- パフォーマンスとスケーラビリティの向上

```http
HTTP/1.1 200 OK
Cache-Control: max-age=3600
ETag: "123456789"
```

### 4. 統一インターフェース (Uniform Interface)
RESTの最も重要な制約。以下の4つのサブ原則があります:

#### 4-1. リソースの識別
- URIでリソースを一意に識別

```
/users/123        # ユーザーID 123
/posts/456        # 投稿ID 456
```

#### 4-2. リソースの操作は表現を通じて行う
- JSONやXMLなどの形式でリソースを表現

#### 4-3. 自己記述的メッセージ
- メッセージだけで処理方法が理解できる

```http
Content-Type: application/json
Accept: application/json
```

#### 4-4. HATEOAS (Hypermedia as the Engine of Application State)
- レスポンスに次に実行可能なアクションへのリンクを含める

```json
{
  "id": 123,
  "name": "田中太郎",
  "links": {
    "self": "/users/123",
    "posts": "/users/123/posts",
    "delete": "/users/123"
  }
}
```

### 5. 階層化システム (Layered System)
- クライアントは直接サーバーに接続しているかどうか分からない
- ロードバランサー、キャッシュサーバーなどを透過的に配置可能

```
クライアント <-> CDN <-> ロードバランサー <-> APIサーバー <-> DB
```

### 6. コードオンデマンド (Code-On-Demand) ※オプション
- サーバーがクライアントに実行可能なコードを送信できる
- JavaScriptなどのスクリプト送信

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
