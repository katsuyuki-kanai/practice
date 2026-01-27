/**
 * 新人向け勉強会用 - MVCパターン実装デモ
 * 
 * このサーバーは以下の概念をデモします：
 * 1. ルーティング：URLに応じて適切なコントローラーに処理を振り分ける
 * 2. MVCパターン：Model、View、Controllerに役割を分離する
 * 3. SSR vs CSR：2つのレンダリング方式の違い
 */

const http = require('http');

// Controllers
const homeController = require('./controllers/homeController');
const userController = require('./controllers/userController');
const productController = require('./controllers/productController');
const demoController = require('./controllers/demoController');
const apiController = require('./controllers/apiController');

// サーバー設定
const PORT = 3000;
const HOST = 'localhost';

// ログ出力用ユーティリティ
function logRequest(req, body = '') {
    const timestamp = new Date().toISOString();
    console.log('\n' + '='.repeat(80));
    console.log(`📨 リクエスト受信 [${timestamp}]`);
    console.log('='.repeat(80));
    console.log(`メソッド: ${req.method}`);
    console.log(`URL: ${req.url}`);
    console.log(`HTTPバージョン: HTTP/${req.httpVersion}`);
    console.log('\n【リクエストヘッダ】');
    Object.entries(req.headers).forEach(([key, value]) => {
        console.log(`  ${key}: ${value}`);
    });
    if (body) {
        console.log('\n【リクエストボディ】');
        console.log(body.substring(0, 500));
    }
    console.log('-'.repeat(80));
}

function logResponse(statusCode, headers, body = '') {
    console.log('\n📤 レスポンス送信');
    console.log(`ステータスコード: ${statusCode}`);
    console.log('\n【レスポンスヘッダ】');
    Object.entries(headers).forEach(([key, value]) => {
        console.log(`  ${key}: ${value}`);
    });
    console.log('\n【レスポンスボディ】');
    const bodyPreview = typeof body === 'string' ? body : JSON.stringify(body);
    const preview = bodyPreview.length > 300 ? bodyPreview.substring(0, 300) + '...(省略)' : bodyPreview;
    console.log(preview);
    console.log('='.repeat(80) + '\n');
}

// 404ページ
function render404Page(req, res, url) {
    const { renderLayout } = require('./views/layout');
    const content = `
        <h1>😵 404 - ページが見つかりません</h1>
        <p class="subtitle">リクエストされたURL: ${url}</p>
        <div class="info-box">
            <p>このURLに対応するページは存在しません。</p>
            <p>サーバーのルーティングで、このURLに対するハンドラーが定義されていないためです。</p>
        </div>
        
        <h2>📋 利用可能なルート</h2>
        <table>
            <tr><th>URL</th><th>説明</th></tr>
            <tr><td><a href="/">/</a></td><td>トップページ</td></tr>
            <tr><td><a href="/users">/users</a></td><td>ユーザー一覧</td></tr>
            <tr><td><a href="/products">/products</a></td><td>商品一覧</td></tr>
            <tr><td><a href="/ssr">/ssr</a></td><td>SSRデモ</td></tr>
            <tr><td><a href="/csr">/csr</a></td><td>CSRデモ</td></tr>
            <tr><td><a href="/api/users">/api/users</a></td><td>ユーザーAPI</td></tr>
        </table>
    `;
    const html = renderLayout('404 Not Found', content);
    
    const headers = { 'Content-Type': 'text/html; charset=utf-8' };
    res.writeHead(404, headers);
    res.end(html);
    logResponse(404, headers, html);
}

// ルーティング設定
const routes = {
    'GET /': homeController.index,
    'GET /users': userController.listUsers,
    'GET /products': productController.listProducts,
    'GET /ssr': demoController.ssr,
    'GET /csr': demoController.csr,
    'GET /api/users': apiController.getUsers,
};

// HTTPサーバー作成
const server = http.createServer((req, res) => {
    // リクエストをログ出力
    logRequest(req);
    
    // URLからパス部分を取得
    const url = req.url.split('?')[0];
    const routeKey = `${req.method} ${url}`;
    
    console.log(`\n🔀 ルーティング: ${routeKey}`);
    
    // ルーティング
    const handler = routes[routeKey];
    
    if (handler) {
        // 対応するコントローラーを実行
        handler(req, res);
    } else {
        // 404ページを表示
        console.log('  ⚠️  ルートが見つかりません → 404ページを表示');
        render404Page(req, res, url);
    }
});

// サーバー起動
server.listen(PORT, HOST, () => {
    console.log('='.repeat(80));
    console.log('🌐 Webサーバーデモ（MVC実装版）が起動しました！');
    console.log('='.repeat(80));
    console.log(`\n📍 サーバーURL: http://${HOST}:${PORT}\n`);
    console.log('📂 ファイル構成:');
    console.log('  webServer/');
    console.log('  ├── server.js              # ルーティング');
    console.log('  ├── controllers/           # Controller層');
    console.log('  │   ├── homeController.js');
    console.log('  │   ├── userController.js');
    console.log('  │   ├── productController.js');
    console.log('  │   ├── demoController.js');
    console.log('  │   └── apiController.js');
    console.log('  ├── models/                # Model層');
    console.log('  │   ├── userModel.js');
    console.log('  │   └── productModel.js');
    console.log('  └── views/                 # View層');
    console.log('      └── layout.js');
    console.log('\n🔀 利用可能なルート:');
    console.log('  - GET  /          → homeController.index');
    console.log('  - GET  /users     → userController.listUsers');
    console.log('  - GET  /products  → productController.listProducts');
    console.log('  - GET  /ssr       → demoController.ssr');
    console.log('  - GET  /csr       → demoController.csr');
    console.log('  - GET  /api/users → apiController.getUsers');
    console.log('\n📋 リクエストログ:');
    console.log('-'.repeat(80));
});
