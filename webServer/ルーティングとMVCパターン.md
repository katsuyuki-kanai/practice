# Webサーバーの仕組み・ルーティング・MVCパターン

## 目次
1. [Webサーバーとは](#1-webサーバーとは)
2. [リクエスト・レスポンスの流れ](#2-リクエストレスポンスの流れ)
3. [ルーティングの仕組み](#3-ルーティングの仕組み)
4. [MVCパターン](#4-mvcパターン)
5. [2つのレンダリング方式](#5-2つのレンダリング方式)
6. [実践デモ](#6-実践デモ)

---

## 1. Webサーバーとは

Webサーバーは、クライアント（ブラウザ）からのHTTPリクエストを受け取り、適切なレスポンスを返すソフトウェアです。

```
┌─────────────┐         HTTPリクエスト         ┌─────────────┐
│             │   ──────────────────────────▶ │             │
│  クライアント│                                │  Webサーバー │
│  (ブラウザ)  │  ◀─────────────────────────── │             │
└─────────────┘         HTTPレスポンス         └─────────────┘
```

---

## 2. リクエスト・レスポンスの流れ

### 2.1 全体像

```
ブラウザ                    Webサーバー                  アプリケーション
   │                           │                              │
   │  1. HTTPリクエスト送信      │                              │
   │  ─────────────────────▶   │                              │
   │                           │  2. リクエスト解析             │
   │                           │  ──────────────────────────▶  │
   │                           │                              │
   │                           │  3. ビジネスロジック実行       │
   │                           │  ◀──────────────────────────  │
   │                           │                              │
   │                           │  4. レスポンス生成             │
   │  5. HTTPレスポンス受信      │                              │
   │  ◀─────────────────────   │                              │
```

### 2.2 サーバー内部での処理ステップ

1. **リクエスト受信**: クライアントからTCP接続を受け付ける
2. **リクエスト解析（パース）**: HTTPメソッド、URL、ヘッダー、ボディを解析
3. **ルーティング**: URLに対応する処理を決定 ⬅️ **重要！**
4. **ミドルウェア処理**: 認証、ログ、CORS処理など
5. **ハンドラー実行**: 実際のビジネスロジックを実行
6. **レスポンス生成**: HTML、JSON、ファイルなどを生成
7. **レスポンス送信**: クライアントにデータを返す

---

## 3. ルーティングの仕組み

### 3.1 ルーティングとは

**ルーティング**は、URLとHTTPメソッドの組み合わせに基づいて、適切な処理（ハンドラー）を選択する仕組みです。

```javascript
// ルーティングの例
const routes = {
    'GET /':          homeController.index,      // トップページ
    'GET /users':     userController.listUsers,  // ユーザー一覧
    'GET /products':  productController.list,    // 商品一覧
    'POST /users':    userController.create,     // ユーザー作成
    'GET /api/users': apiController.getUsers,    // API
};
```

### 3.2 ルーティングの流れ

```
リクエスト                ルーティング               コントローラー
GET /users     ────▶    マッピング確認    ────▶    userController.listUsers()
                       routes['GET /users']
```

### 3.3 実装例

```javascript
// server.js - ルーティング設定
const server = http.createServer((req, res) => {
    const url = req.url.split('?')[0];
    const routeKey = `${req.method} ${url}`;
    
    // ルーティングテーブルから適切なハンドラーを取得
    const handler = routes[routeKey];
    
    if (handler) {
        handler(req, res);  // コントローラーを実行
    } else {
        render404(req, res);  // 404エラー
    }
});
```

### 3.4 動的ルーティング

URLの一部をパラメータとして扱うこともできます：

```javascript
// 例: /users/123 → ユーザーID:123の詳細ページ
GET /users/:id  → userController.show(id)
```

---

## 4. MVCパターン

### 4.1 MVCとは

**MVC**は、アプリケーションを3つの役割に分離する設計パターンです：

- **Model（モデル）**: データとビジネスロジックを担当
- **View（ビュー）**: 画面表示を担当
- **Controller（コントローラー）**: ModelとViewを仲介

### 4.2 MVCの全体像

```
┌─────────────────────────────────────────────────────────┐
│                    クライアント (ブラウザ)                  │
└───────────────────┬─────────────────────────────────────┘
                    │ HTTPリクエスト
                    ▼
┌─────────────────────────────────────────────────────────┐
│                  ルーティング (server.js)                 │
│              URLに応じてControllerを選択                  │
└───────────────────┬─────────────────────────────────────┘
                    │
                    ▼
        ┌───────────────────────┐
        │   Controller 層       │  ← リクエストを受け取る
        │  (controllers/*.js)   │     Modelからデータ取得
        └───────┬───────────────┘     Viewにデータを渡す
                │
        ┌───────┴───────┐
        │               │
        ▼               ▼
┌──────────────┐  ┌──────────────┐
│   Model 層    │  │   View 層     │
│ (models/*.js) │  │ (views/*.js)  │
│               │  │               │
│ データ取得     │  │ HTML生成      │
│ ビジネスロジック│  │ 画面表示      │
└──────────────┘  └──────────────┘
```

### 4.3 各層の役割

#### Model（モデル）
データの取得・保存・加工を担当

```javascript
// models/userModel.js
function getAllUsers() {
    // データベースからユーザーを取得
    return database.query('SELECT * FROM users');
}

function getUserById(id) {
    return database.query('SELECT * FROM users WHERE id = ?', [id]);
}

module.exports = { getAllUsers, getUserById };
```

#### Controller（コントローラー）
リクエストを受け取り、ModelとViewを組み合わせる

```javascript
// controllers/userController.js
const userModel = require('../models/userModel');
const { renderLayout } = require('../views/layout');

function listUsers(req, res) {
    // 1. Modelからデータを取得
    const users = userModel.getAllUsers();
    
    // 2. Viewを生成
    const html = renderLayout('ユーザー一覧', users);
    
    // 3. レスポンスを返す
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
}

module.exports = { listUsers };
```

#### View（ビュー）
HTMLの生成・表示を担当

```javascript
// views/layout.js
function renderLayout(title, content) {
    return `
<!DOCTYPE html>
<html>
<head><title>${title}</title></head>
<body>
    <h1>${title}</h1>
    ${content}
</body>
</html>`;
}

module.exports = { renderLayout };
```

### 4.4 MVCのメリット

✅ **関心の分離**: 各層が独立しており、役割が明確  
✅ **保守性向上**: 変更の影響範囲が限定される  
✅ **再利用性**: ModelやViewを他のControllerでも使える  
✅ **テストしやすい**: 各層を独立してテストできる

### 4.5 実際の処理フロー例

```
1. ブラウザが GET /users をリクエスト
   ↓
2. server.js がルーティング
   'GET /users' → userController.listUsers
   ↓
3. userController.listUsers が実行される
   ↓
4. userModel.getAllUsers() を呼び出し
   ↓
5. Model がデータベースからユーザーデータを取得
   ↓
6. Controller がデータを受け取る
   ↓
7. renderLayout() でHTMLを生成
   ↓
8. ブラウザにHTMLレスポンスを返す
```

---

## 5. 2つのレンダリング方式

### 5.1 サーバーサイドレンダリング（SSR）

**概要**: サーバー側でHTMLを完成させてからクライアントに送信する方式

```
┌─────────────┐                     ┌─────────────┐                  ┌──────────┐
│  ブラウザ     │  1. ページリクエスト  │  Webサーバー  │  2. データ取得    │  データベース │
│             │  ──────────────────▶ │             │  ────────────▶  │          │
│             │                     │             │  ◀────────────  │          │
│             │                     │             │  3. データ返却    │          │
│             │  4. 完成したHTML返却   │             │                  │          │
│             │  ◀────────────────── │  (HTML生成)  │                  │          │
│             │                     │             │                  │          │
│  5. 画面表示  │                     │             │                  │          │
└─────────────┘                     └─────────────┘                  └──────────┘
```

**特徴**:
- ✅ 初期表示が速い（HTMLが完成した状態で届く）
- ✅ SEOに強い（検索エンジンがコンテンツを読み取りやすい）
- ✅ JavaScript無効でも基本的な表示が可能
- ❌ ページ遷移のたびにサーバーへリクエストが必要
- ❌ サーバーの負荷が高くなりやすい

**ユースケース**:
- ブログ、ニュースサイト
- ECサイトの商品ページ
- SEOが重要なサービス

---

### 5.2 クライアントサイドレンダリング（CSR）/ API方式

**概要**: 最初に空のHTMLとJavaScriptを送信し、ブラウザ側でAPIからデータを取得してUIを構築する方式

```
┌─────────────┐                     ┌─────────────┐                  ┌──────────┐
│  ブラウザ     │  1. ページリクエスト  │  Webサーバー  │                  │  データベース │
│             │  ──────────────────▶ │             │                  │          │
│             │  2. HTML+JS返却      │             │                  │          │
│             │  ◀────────────────── │             │                  │          │
│             │                     │             │                  │          │
│  3. JS実行   │  4. APIリクエスト    │             │  5. データ取得    │          │
│             │  ──────────────────▶ │             │  ────────────▶  │          │
│             │                     │             │  ◀────────────  │          │
│             │  6. JSONデータ返却   │             │  7. データ返却    │          │
│             │  ◀────────────────── │             │                  │          │
│             │                     │             │                  │          │
│  8. 画面描画  │                     │             │                  │          │
└─────────────┘                     └─────────────┘                  └──────────┘
```

**特徴**:
- ✅ ページ遷移が高速（必要なデータだけ取得）
- ✅ サーバー負荷が軽い（HTMLレンダリングをクライアントに委譲）
- ✅ リッチなユーザー体験（SPA: Single Page Application）
- ❌ 初期表示が遅い（JSの読み込み・実行が必要）
- ❌ SEOに弱い（JavaScriptを実行しないとコンテンツが見えない）

**ユースケース**:
- 管理画面、ダッシュボード
- チャットアプリ
- リアルタイム性が必要なサービス

---

### 5.3 比較表

| 観点 | SSR（サーバーサイド） | CSR（クライアントサイド） |
|------|---------------------|------------------------|
| 初期表示速度 | 速い | 遅い |
| ページ遷移 | 遅い（再読み込み） | 速い（部分更新） |
| SEO | 強い | 弱い |
| サーバー負荷 | 高い | 低い |
| UX | シンプル | リッチ |
| JavaScript依存 | 低い | 高い |

---

## 6. 実践デモ

### 6.1 プロジェクト構成

```
webServer/
├── server.js                    # ルーティング、サーバー起動
├── controllers/                 # Controller層
│   ├── homeController.js        #   トップページ
│   ├── userController.js        #   ユーザー関連
│   ├── productController.js     #   商品関連
│   ├── demoController.js        #   SSR/CSRデモ
│   └── apiController.js         #   API
├── models/                      # Model層
│   ├── userModel.js             #   ユーザーデータ
│   └── productModel.js          #   商品データ
└── views/                       # View層
    └── layout.js                #   HTMLテンプレート
```

### 6.2 サーバー起動

```bash
# webServerディレクトリに移動
cd webServer

# サーバー起動
node server.js
```

### 6.3 動作確認

ブラウザで以下のURLにアクセス：

| URL | Controller | 説明 |
|-----|-----------|------|
| http://localhost:3000/ | homeController | トップページ（MVC説明） |
| http://localhost:3000/users | userController | ユーザー一覧（MVC実装例） |
| http://localhost:3000/products | productController | 商品一覧（MVC実装例） |
| http://localhost:3000/ssr | demoController | SSRデモ |
| http://localhost:3000/csr | demoController | CSRデモ |
| http://localhost:3000/api/users | apiController | ユーザーAPI（JSON） |

### 6.4 ログで確認すること

ターミナルに表示されるログで以下を確認できます：

```
🔀 ルーティング: GET /users
  [Controller] userController.listUsers が呼ばれました
  [Model] データベースから全ユーザーを取得
```

この流れで、**リクエスト → ルーティング → Controller → Model** の処理が確認できます！

---

## 7. まとめ

### 7.1 Webサーバーの基本

1. **Webサーバーの役割**: HTTPリクエストを受け取り、適切なレスポンスを返す
2. **リクエスト処理**: パース → ルーティング → ハンドラー → レスポンス

### 7.2 ルーティング

3. **ルーティング**: URLとHTTPメソッドに応じて、適切なコントローラーに処理を振り分ける

### 7.3 MVCパターン

4. **Model**: データ取得・ビジネスロジック
5. **View**: HTML生成・画面表示
6. **Controller**: ModelとViewを組み合わせてレスポンス生成

### 7.4 レンダリング方式

7. **SSR**: サーバーでHTMLを生成 → SEOに強く、初期表示が速い
8. **CSR**: クライアントでHTMLを生成 → リッチなUX、ページ遷移が速い

---

## 8. 参考リンク

- [Node.js 公式ドキュメント](https://nodejs.org/docs/)
- [MDN - HTTP の基本](https://developer.mozilla.org/ja/docs/Web/HTTP/Basics_of_HTTP)
- [MDN - MVC アーキテクチャ](https://developer.mozilla.org/ja/docs/Glossary/MVC)
