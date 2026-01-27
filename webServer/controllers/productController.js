/**
 * Controller - 商品コントローラー
 */

const productModel = require('../models/productModel');
const { renderLayout } = require('../views/layout');

function listProducts(req, res) {
    console.log('  [Controller] productController.listProducts が呼ばれました');
    
    // Model からデータを取得
    const products = productModel.getAllProducts();
    
    // View を生成
    const productRows = products.map(product => `
        <tr>
            <td>${product.id}</td>
            <td>${product.name}</td>
            <td>¥${product.price.toLocaleString()}</td>
            <td>${product.category}</td>
            <td>${product.stock}</td>
        </tr>
    `).join('');
    
    const content = `
        <h1>📦 商品一覧</h1>
        <p class="subtitle">productController → productModel でデータ取得</p>
        
        <div class="info-box">
            <strong>🔄 異なるルートからのアクセス</strong><br>
            <code>/users</code> → userController → userModel<br>
            <code>/products</code> → productController → productModel<br>
            <br>
            同じMVCパターンでも、URLによって異なるコントローラーとモデルが使われます。
        </div>

        <h2>📋 商品データ</h2>
        <table>
            <tr>
                <th>ID</th>
                <th>商品名</th>
                <th>価格</th>
                <th>カテゴリ</th>
                <th>在庫</th>
            </tr>
            ${productRows}
        </table>

        <h2>💡 ルーティングの比較</h2>
        <div class="card">
            <h3>URLによる振り分け</h3>
            <table style="margin-top: 15px;">
                <tr>
                    <th>URL</th>
                    <th>Controller</th>
                    <th>Model</th>
                    <th>データ</th>
                </tr>
                <tr>
                    <td>/users</td>
                    <td>userController</td>
                    <td>userModel</td>
                    <td>ユーザー</td>
                </tr>
                <tr style="background: #e7f3ff;">
                    <td>/products</td>
                    <td>productController</td>
                    <td>productModel</td>
                    <td>商品（今ここ！）</td>
                </tr>
                <tr>
                    <td>/</td>
                    <td>homeController</td>
                    <td>-</td>
                    <td>-</td>
                </tr>
            </table>
        </div>

        <button onclick="location.reload()">🔄 データを再取得</button>
    `;
    
    const html = renderLayout('商品一覧 - MVC実装例', content);
    
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);
}

module.exports = { listProducts };
