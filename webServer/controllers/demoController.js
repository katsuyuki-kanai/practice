/**
 * Controller - SSR/CSRデモ用コントローラー
 */

const userModel = require('../models/userModel');
const { renderLayout } = require('../views/layout');

function ssr(req, res) {
    console.log('  [Controller] demoController.ssr が呼ばれました');
    console.log('  ⏳ サーバー側でHTMLを生成中...');
    
    setTimeout(() => {
        // Model からデータを取得
        const users = userModel.getAllUsers();
        const serverTime = new Date().toLocaleString('ja-JP');
        
        const userRows = users.map(user => `
            <tr>
                <td>${user.id}</td>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>${user.role}</td>
            </tr>
        `).join('');
        
        const content = `
            <h1>📄 SSR（サーバーサイドレンダリング）デモ</h1>
            <p class="subtitle">このページはサーバー側でHTMLを完全に生成しています</p>

            <div class="info-box">
                <strong>💡 SSRの特徴</strong><br>
                サーバーでデータを取得し、HTMLを生成してから送信します。<br>
                ブラウザは完成したHTMLを受け取るだけなので、JavaScriptなしでも表示できます。
            </div>

            <h2>⏱️ サーバー処理時刻</h2>
            <p>このHTMLが生成された時刻: <strong>${serverTime}</strong></p>
            <p>（ページをリロードすると時刻が更新されます）</p>

            <h2>👥 ユーザー一覧（サーバーで生成）</h2>
            <table>
                <tr>
                    <th>ID</th>
                    <th>名前</th>
                    <th>メール</th>
                    <th>役職</th>
                </tr>
                ${userRows}
            </table>

            <button onclick="location.reload()">🔄 データを再取得（画面全体がリロードされます）</button>

            <div class="info-box" style="margin-top: 20px;">
                <strong>🔍 動作確認ポイント</strong><br>
                上のボタンをクリックすると、画面全体が白くフラッシュしてリロードされます。<br>
                これがSSRの特徴：データを取得するたびにサーバーから新しいHTMLページが送られてきます。
            </div>

            <h2>📝 サーバー側のコード例</h2>
            <div class="code-block">
// SSRの場合：サーバーでHTMLを生成<br>
const users = await userModel.getAllUsers();<br>
const html = users.map(u => \`&lt;tr&gt;&lt;td&gt;\${u.name}&lt;/td&gt;&lt;/tr&gt;\`).join('');<br>
res.send(\`&lt;table&gt;\${html}&lt;/table&gt;\`);
            </div>
        `;
        
        const html = renderLayout('SSRデモ - サーバーサイドレンダリング', content);
        
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(html);
    }, 1000);
}

function csr(req, res) {
    console.log('  [Controller] demoController.csr が呼ばれました');
    
    const content = `
        <h1>⚡ CSR（クライアントサイドレンダリング）デモ</h1>
        <p class="subtitle">このページはブラウザ側でAPIからデータを取得して描画しています</p>

        <div class="info-box">
            <strong>💡 CSRの特徴</strong><br>
            最初に空のHTMLとJavaScriptを送信し、ブラウザ側でAPIからデータを取得してUIを構築します。<br>
            ページ遷移なしでデータを更新できます。
        </div>

        <h2>👥 ユーザー一覧（APIから取得）</h2>
        <div id="user-list">
            <div class="loading">
                <div class="spinner"></div>
                <p>APIからデータを取得中...</p>
            </div>
        </div>

        <button onclick="fetchUsers()">🔄 データを再取得</button>

        <h2>📝 クライアント側のコード例</h2>
        <div class="code-block">
// CSRの場合：ブラウザでAPIを呼び出し<br>
fetch('/api/users')<br>
&nbsp;&nbsp;.then(res => res.json())<br>
&nbsp;&nbsp;.then(users => {<br>
&nbsp;&nbsp;&nbsp;&nbsp;const html = users.map(u => \`&lt;tr&gt;&lt;td&gt;\${u.name}&lt;/td&gt;&lt;/tr&gt;\`).join('');<br>
&nbsp;&nbsp;&nbsp;&nbsp;document.getElementById('user-list').innerHTML = html;<br>
&nbsp;&nbsp;});
        </div>

        <script>
            async function fetchUsers() {
                const container = document.getElementById('user-list');
                container.innerHTML = '<div class="loading"><div class="spinner"></div><p>APIからデータを取得中...</p></div>';
                
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                try {
                    const response = await fetch('/api/users');
                    const data = await response.json();
                    
                    const html = \`
                        <p style="color: #666; margin-bottom: 10px;">
                            取得時刻: \${new Date().toLocaleString('ja-JP')}
                        </p>
                        <table>
                            <tr>
                                <th>ID</th>
                                <th>名前</th>
                                <th>メール</th>
                                <th>役職</th>
                            </tr>
                            \${data.users.map(user => \`
                                <tr>
                                    <td>\${user.id}</td>
                                    <td>\${user.name}</td>
                                    <td>\${user.email}</td>
                                    <td>\${user.role}</td>
                                </tr>
                            \`).join('')}
                        </table>
                    \`;
                    container.innerHTML = html;
                } catch (error) {
                    container.innerHTML = '<p style="color: red;">エラーが発生しました: ' + error.message + '</p>';
                }
            }
            
            fetchUsers();
        </script>
    `;
    
    const html = renderLayout('CSRデモ - クライアントサイドレンダリング', content);
    
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);
}

module.exports = { ssr, csr };
