/**
 * Controller - ホームページコントローラー
 * ModelとViewを組み合わせてレスポンスを生成
 */

const { renderLayout } = require('../views/layout');

function index(req, res) {
    console.log('  [Controller] homeController.index が呼ばれました');
    
    const content = `
        <h1>🌐 Webサーバーの仕組み デモ</h1>
        <p class="subtitle">新人向け勉強会 - ルーティングとMVCパターン</p>
        
        <h2>📚 このデモで学べること</h2>
        <div class="info-box">
            <ul style="padding-left: 20px; line-height: 2;">
                <li><strong>ルーティング</strong>：URLに応じて適切なコントローラーに処理を振り分ける</li>
                <li><strong>MVCパターン</strong>：Model、View、Controllerに役割を分離する</li>
                <li><strong>SSR vs CSR</strong>：2つのレンダリング方式の違い</li>
            </ul>
        </div>

        <h2>🔄 ルーティングの仕組み</h2>
        <div class="card">
            <h3>URLとコントローラーのマッピング</h3>
            <div class="code-block">
GET /           → homeController.index()<br>
GET /users      → userController.listUsers()<br>
GET /products   → productController.listProducts()<br>
GET /ssr        → demoController.ssr()<br>
GET /csr        → demoController.csr()<br>
GET /api/users  → apiController.getUsers()
            </div>
            <p style="margin-top: 15px;">
                各URLにアクセスすると、サーバーは対応するコントローラーを呼び出します。<br>
                ターミナルのログで、どのコントローラーが呼ばれているか確認できます。
            </p>
        </div>

        <h2>🏗️ MVCパターン</h2>
        <div class="mvc-diagram">
            <pre style="line-height: 2; text-align: left; font-size: 14px;">
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
            </pre>
        </div>

        <h2>📂 ファイル構成</h2>
        <div class="code-block">
webServer/<br>
├── server.js                    # メインサーバー、ルーティング<br>
├── controllers/                 # Controller層<br>
│   ├── homeController.js        #   トップページ<br>
│   ├── userController.js        #   ユーザー関連<br>
│   ├── productController.js     #   商品関連<br>
│   └── demoController.js        #   SSR/CSRデモ<br>
├── models/                      # Model層<br>
│   ├── userModel.js             #   ユーザーデータ<br>
│   └── productModel.js          #   商品データ<br>
└── views/                       # View層<br>
    └── layout.js                #   HTMLテンプレート
        </div>

        <h2>🧪 デモページ</h2>
        <table>
            <tr>
                <th>URL</th>
                <th>コントローラー</th>
                <th>説明</th>
            </tr>
            <tr>
                <td><a href="/">/</a></td>
                <td>homeController</td>
                <td>このページ（トップ）</td>
            </tr>
            <tr>
                <td><a href="/users">/users</a></td>
                <td>userController</td>
                <td>ユーザー一覧（Model→データ取得）</td>
            </tr>
            <tr>
                <td><a href="/products">/products</a></td>
                <td>productController</td>
                <td>商品一覧（Model→データ取得）</td>
            </tr>
            <tr>
                <td><a href="/ssr">/ssr</a></td>
                <td>demoController</td>
                <td>SSRデモ（サーバーでHTML生成）</td>
            </tr>
            <tr>
                <td><a href="/csr">/csr</a></td>
                <td>demoController</td>
                <td>CSRデモ（APIからデータ取得）</td>
            </tr>
        </table>

        <div class="info-box" style="margin-top: 30px;">
            <strong>💡 確認方法</strong><br>
            各ページにアクセスすると、ターミナルに以下のログが表示されます：<br>
            <code style="background: #fff; padding: 2px 6px; border-radius: 4px;">
                [Controller] userController.listUsers が呼ばれました<br>
                [Model] データベースから全ユーザーを取得
            </code><br>
            これにより、ルーティング → Controller → Model の流れが確認できます。
        </div>
    `;
    
    const html = renderLayout('Webサーバーデモ - ルーティングとMVC', content);
    
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);
}

module.exports = { index };
