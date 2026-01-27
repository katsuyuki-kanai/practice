/**
 * Controller - ユーザーコントローラー
 */

const userModel = require('../models/userModel');
const { renderLayout } = require('../views/layout');

function listUsers(req, res) {
    console.log('  [Controller] userController.listUsers が呼ばれました');
    
    // Model からデータを取得
    const users = userModel.getAllUsers();
    
    // View を生成
    const userRows = users.map(user => `
        <tr>
            <td>${user.id}</td>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${user.role}</td>
            <td>${user.department}</td>
        </tr>
    `).join('');
    
    const content = `
        <h1>👥 ユーザー一覧</h1>
        <p class="subtitle">userController → userModel でデータ取得</p>
        
        <div class="info-box">
            <strong>📊 MVCの流れ</strong><br>
            1. ルーティング: <code>/users</code> → <code>userController.listUsers()</code><br>
            2. Controller: <code>userModel.getAllUsers()</code> を呼び出し<br>
            3. Model: データベースからユーザーデータを取得して返却<br>
            4. Controller: データをHTMLに埋め込んで表示<br>
            <br>
            ターミナルのログで、この流れが確認できます！
        </div>

        <h2>📋 ユーザーデータ</h2>
        <table>
            <tr>
                <th>ID</th>
                <th>名前</th>
                <th>メール</th>
                <th>役職</th>
                <th>部署</th>
            </tr>
            ${userRows}
        </table>

        <h2>📝 コントローラーのコード例</h2>
        <div class="code-block">
// userController.js<br>
function listUsers(req, res) {<br>
&nbsp;&nbsp;// Model からデータを取得<br>
&nbsp;&nbsp;const users = userModel.getAllUsers();<br>
&nbsp;&nbsp;<br>
&nbsp;&nbsp;// View を生成してレスポンス<br>
&nbsp;&nbsp;const html = renderView(users);<br>
&nbsp;&nbsp;res.end(html);<br>
}
        </div>

        <h2>📝 モデルのコード例</h2>
        <div class="code-block">
// userModel.js<br>
function getAllUsers() {<br>
&nbsp;&nbsp;// データベースからデータ取得<br>
&nbsp;&nbsp;// （このデモでは配列から返す）<br>
&nbsp;&nbsp;return users;<br>
}
        </div>

        <button onclick="location.reload()">🔄 データを再取得</button>
    `;
    
    const html = renderLayout('ユーザー一覧 - MVC実装例', content);
    
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);
}

module.exports = { listUsers };
