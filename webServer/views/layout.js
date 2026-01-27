/**
 * View Helper - 共通レイアウト
 */

function renderLayout(title, content, badge = '') {
    return `
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        .container {
            max-width: 1000px;
            margin: 0 auto;
            background: white;
            border-radius: 16px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            padding: 40px;
        }
        h1 { color: #333; margin-bottom: 10px; }
        h2 { color: #667eea; margin: 30px 0 15px; }
        .subtitle { color: #666; margin-bottom: 30px; }
        nav { 
            background: #f8f9fa; 
            padding: 15px; 
            border-radius: 8px;
            margin-bottom: 30px;
        }
        nav a { 
            color: #667eea; 
            text-decoration: none;
            margin-right: 20px;
            font-weight: 500;
        }
        nav a:hover { text-decoration: underline; }
        .badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            margin-left: 10px;
        }
        .badge-ssr { background: #d4edda; color: #155724; }
        .badge-csr { background: #cce5ff; color: #004085; }
        .badge-api { background: #fff3cd; color: #856404; }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        th, td {
            padding: 12px 15px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        th { background: #667eea; color: white; }
        tr:hover { background: #f5f5f5; }
        .code-block {
            background: #2d2d2d;
            color: #f8f8f2;
            padding: 20px;
            border-radius: 8px;
            overflow-x: auto;
            margin: 15px 0;
            font-family: 'Courier New', monospace;
            font-size: 14px;
            line-height: 1.6;
        }
        .info-box {
            background: #e7f3ff;
            border-left: 4px solid #667eea;
            padding: 15px 20px;
            margin: 20px 0;
            border-radius: 0 8px 8px 0;
        }
        button {
            margin-top: 20px;
            padding: 10px 20px;
            background: #667eea;
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 16px;
        }
        button:hover {
            background: #5568d3;
        }
        .loading {
            text-align: center;
            padding: 40px;
            color: #666;
        }
        .spinner {
            width: 40px;
            height: 40px;
            border: 4px solid #f3f3f3;
            border-top: 4px solid #667eea;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 20px;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        .card {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin: 15px 0;
            border-left: 4px solid #667eea;
        }
        .mvc-diagram {
            background: #f8f9fa;
            padding: 30px;
            border-radius: 8px;
            margin: 20px 0;
            text-align: center;
            font-family: monospace;
        }
    </style>
</head>
<body>
    <div class="container">
        <nav>
            <a href="/">🏠 トップ</a>
            <a href="/users">👥 ユーザー</a>
            <a href="/products">📦 商品</a>
            <a href="/ssr">📄 SSRデモ</a>
            <a href="/csr">⚡ CSRデモ</a>
            <a href="/api/users">📊 API</a>
        </nav>
        ${content}
    </div>
</body>
</html>`;
}

module.exports = { renderLayout };
