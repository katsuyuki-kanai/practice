# 非同期処理と Ajax / Fetch API

## 📚 この資料で学ぶこと
- 同期処理と非同期処理の違い
- コールバック、Promise、async/await の理解
- XMLHttpRequest と Ajax の歴史
- Fetch API の実践的な使い方
- エラーハンドリングと実践パターン

> ⏰ 想定時間：1時間

---

## 1. 同期処理と非同期処理

### 1.1 同期処理

```javascript
// 同期処理：上から順番に1つずつ実行
console.log('1. 開始');
console.log('2. 処理中...');  // ← これが終わるまで次に進めない
console.log('3. 完了');

// 出力:
// 1. 開始
// 2. 処理中...
// 3. 完了
```

### 1.2 非同期処理

```javascript
// 非同期処理：完了を待たずに次の処理に進む
console.log('1. 開始');

setTimeout(() => {
    console.log('2. 2秒後に実行');  // ← 後で実行される
}, 2000);

console.log('3. 先に実行される');

// 出力:
// 1. 開始
// 3. 先に実行される
// 2. 2秒後に実行（2秒後）
```

### 1.3 なぜ非同期処理が必要か

```
JavaScriptはシングルスレッド（1つの処理しか同時にできない）

同期的にサーバー通信すると...
┌────────────┐
│ ボタンクリック │
│     ↓       │
│ API呼び出し  │ ← サーバー応答まで待機（数秒）
│ ........... │
│ ........... │ ← この間、画面がフリーズ！
│     ↓       │
│ 結果を表示   │
└────────────┘

非同期にすると...
┌────────────┐
│ ボタンクリック │
│     ↓       │
│ API呼び出し  │ → バックグラウンドで通信
│     ↓       │
│ 他の処理継続  │ ← 画面は操作可能！
│     ↓       │
│ 通信完了     │ → コールバックで結果を処理
│     ↓       │
│ 結果を表示   │
└────────────┘
```

---

## 2. 非同期処理の進化

### 2.1 コールバック（古い方法）

```javascript
// コールバック：完了時に呼ばれる関数を渡す
function fetchData(url, onSuccess, onError) {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.onload = function() {
        if (xhr.status === 200) {
            onSuccess(JSON.parse(xhr.responseText));
        } else {
            onError(new Error(`Status: ${xhr.status}`));
        }
    };
    xhr.onerror = function() {
        onError(new Error('Network error'));
    };
    xhr.send();
}

// 使い方
fetchData('/api/users',
    function(data) { console.log('成功:', data); },
    function(err)  { console.log('失敗:', err); }
);
```

### 2.2 コールバック地獄

```javascript
// ❌ コールバックがネストして読みにくい（コールバック地獄）
getUser(userId, function(user) {
    getOrders(user.id, function(orders) {
        getOrderDetails(orders[0].id, function(details) {
            getProduct(details.productId, function(product) {
                console.log(product.name);
                // さらにネストが続く...
            }, handleError);
        }, handleError);
    }, handleError);
}, handleError);
```

### 2.3 Promise（ES2015〜）

```javascript
// Promise：非同期処理の結果を表すオブジェクト
// 3つの状態: pending（実行中）、fulfilled（成功）、rejected（失敗）

function fetchData(url) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        xhr.onload = () => {
            if (xhr.status === 200) {
                resolve(JSON.parse(xhr.responseText));  // 成功
            } else {
                reject(new Error(`Status: ${xhr.status}`));  // 失敗
            }
        };
        xhr.onerror = () => reject(new Error('Network error'));
        xhr.send();
    });
}

// Promiseチェーンで読みやすく
fetchData('/api/users')
    .then(users => {
        console.log('ユーザー一覧:', users);
        return fetchData(`/api/users/${users[0].id}/orders`);
    })
    .then(orders => {
        console.log('注文一覧:', orders);
        return fetchData(`/api/orders/${orders[0].id}`);
    })
    .then(detail => {
        console.log('注文詳細:', detail);
    })
    .catch(error => {
        console.error('エラー:', error);  // どこでエラーが起きても捕捉
    })
    .finally(() => {
        console.log('処理完了');  // 成功・失敗に関わらず実行
    });
```

### 2.4 async/await（ES2017〜）

```javascript
// async/await：Promiseをより直感的に書ける構文
async function loadUserOrders(userId) {
    try {
        // await で Promise の完了を待つ
        const user = await fetchData(`/api/users/${userId}`);
        console.log('ユーザー:', user.name);

        const orders = await fetchData(`/api/users/${user.id}/orders`);
        console.log('注文数:', orders.length);

        const detail = await fetchData(`/api/orders/${orders[0].id}`);
        console.log('注文詳細:', detail);

        return detail;
    } catch (error) {
        console.error('エラー:', error);
        throw error;
    } finally {
        console.log('処理完了');
    }
}

// async 関数は Promise を返す
loadUserOrders(1).then(result => console.log(result));
```

### 2.5 進化のまとめ

```
コールバック（〜2015）    Promise（2015〜）      async/await（2017〜）
─────────────────    ─────────────────    ─────────────────
getData(url, cb)     getData(url)         const data = await getData(url)
  ↓ ネスト地獄         .then(data => {})    ↓ 同期的に読める
  ↓ エラー処理困難      .catch(err => {})    try/catch で捕捉
                     .finally(() => {})   
```

---

## 3. Ajax とは

### 3.1 Ajax の概要

```
Ajax = Asynchronous JavaScript And XML

従来のWebページ：
┌──────┐  リクエスト  ┌──────┐
│ ブラウザ │ ─────────→│サーバー│  ページ全体を再読み込み
│      │ ←─────────│      │  → 画面が一瞬白くなる
└──────┘  HTML全体   └──────┘

Ajax を使ったWebページ：
┌──────┐  APIリクエスト ┌──────┐
│ ブラウザ │ ─────────→ │サーバー│  必要なデータだけ取得
│      │ ←──────────│      │  → 画面の一部だけ更新
└──────┘  JSONデータ   └──────┘
          （部分的）
```

### 3.2 XMLHttpRequest（レガシー）

```javascript
// XMLHttpRequest: Ajax の元祖（現在はほぼ使わない）
const xhr = new XMLHttpRequest();
xhr.open('GET', '/api/users');

xhr.onreadystatechange = function() {
    // readyState: 0=未初期化, 1=読込中, 2=読込完了, 3=対話中, 4=完了
    if (xhr.readyState === 4) {
        if (xhr.status === 200) {
            const data = JSON.parse(xhr.responseText);
            console.log(data);
        } else {
            console.error('Error:', xhr.status);
        }
    }
};

xhr.send();
```

---

## 4. Fetch API（モダンな方法）

### 4.1 基本的な使い方

```javascript
// GETリクエスト
const response = await fetch('/api/users');
const data = await response.json();  // JSONとしてパース

// レスポンスのプロパティ
console.log(response.ok);       // true (status 200-299)
console.log(response.status);   // 200
console.log(response.headers);  // Headers オブジェクト
```

### 4.2 各HTTPメソッドの使い方

```javascript
// GET（デフォルト）
const users = await fetch('/api/users').then(r => r.json());

// POST
const newUser = await fetch('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: '田中', email: 'tanaka@example.com' }),
}).then(r => r.json());

// PUT（全体更新）
await fetch('/api/users/1', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: '田中太郎', email: 'tanaka@example.com' }),
});

// PATCH（部分更新）
await fetch('/api/users/1', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: '田中太郎' }),
});

// DELETE
await fetch('/api/users/1', { method: 'DELETE' });
```

### 4.3 クエリパラメータ

```javascript
// URLSearchParams でクエリパラメータを構築
const params = new URLSearchParams({
    page: 1,
    limit: 10,
    sort: 'name',
    order: 'asc',
});

const response = await fetch(`/api/users?${params}`);
// → GET /api/users?page=1&limit=10&sort=name&order=asc
```

### 4.4 レスポンスの処理

```javascript
const response = await fetch('/api/data');

// レスポンスの形式に合わせてパース
const json = await response.json();     // JSON
const text = await response.text();     // テキスト
const blob = await response.blob();     // バイナリ（ファイル）
const formData = await response.formData(); // フォームデータ
const buffer = await response.arrayBuffer(); // ArrayBuffer

// ⚠️ body は一度しか読めない。2回読むとエラー
// const json = await response.json();
// const text = await response.text();  // ← エラー！
```

### 4.5 ヘッダーの操作

```javascript
// リクエストヘッダーの設定
const response = await fetch('/api/protected', {
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'X-Custom-Header': 'value',
    },
});

// レスポンスヘッダーの読み取り
const contentType = response.headers.get('Content-Type');
const totalCount = response.headers.get('X-Total-Count');
```

---

## 5. 実践パターン

### 5.1 再利用可能なAPIクライアント

```javascript
class ApiClient {
    constructor(baseUrl = '') {
        this.baseUrl = baseUrl;
        this.defaultHeaders = {
            'Content-Type': 'application/json',
        };
    }

    // トークンの設定
    setAuthToken(token) {
        this.defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    // 共通のリクエスト処理
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const config = {
            headers: { ...this.defaultHeaders, ...options.headers },
            ...options,
        };

        try {
            const response = await fetch(url, config);

            // 認証エラー
            if (response.status === 401) {
                // トークンのリフレッシュやログイン画面へのリダイレクト
                throw new AuthError('認証が必要です');
            }

            if (!response.ok) {
                const errorBody = await response.json().catch(() => ({}));
                throw new ApiError(
                    errorBody.message || `HTTP ${response.status}`,
                    response.status,
                    errorBody
                );
            }

            // 204 No Content の場合はnullを返す
            if (response.status === 204) return null;

            return await response.json();
        } catch (error) {
            if (error instanceof ApiError || error instanceof AuthError) {
                throw error;
            }
            throw new NetworkError('ネットワークエラーが発生しました');
        }
    }

    // 便利メソッド
    get(endpoint)              { return this.request(endpoint); }
    post(endpoint, data)       { return this.request(endpoint, { method: 'POST', body: JSON.stringify(data) }); }
    put(endpoint, data)        { return this.request(endpoint, { method: 'PUT', body: JSON.stringify(data) }); }
    patch(endpoint, data)      { return this.request(endpoint, { method: 'PATCH', body: JSON.stringify(data) }); }
    delete(endpoint)           { return this.request(endpoint, { method: 'DELETE' }); }
}

// カスタムエラークラス
class ApiError extends Error {
    constructor(message, status, body) {
        super(message);
        this.status = status;
        this.body = body;
    }
}

class AuthError extends Error {}
class NetworkError extends Error {}

// 使用例
const api = new ApiClient('/api');
api.setAuthToken('your-jwt-token');

const users = await api.get('/users');
const newUser = await api.post('/users', { name: '田中', email: 'tanaka@example.com' });
```

### 5.2 並列リクエスト

```javascript
// Promise.all: すべてのリクエストを並列実行
async function loadDashboard() {
    const [users, products, orders] = await Promise.all([
        fetch('/api/users').then(r => r.json()),
        fetch('/api/products').then(r => r.json()),
        fetch('/api/orders').then(r => r.json()),
    ]);

    console.log('ユーザー:', users.length);
    console.log('商品:', products.length);
    console.log('注文:', orders.length);
}

// Promise.allSettled: 失敗しても他の結果を取得
async function loadDashboardSafe() {
    const results = await Promise.allSettled([
        fetch('/api/users').then(r => r.json()),
        fetch('/api/products').then(r => r.json()),
        fetch('/api/orders').then(r => r.json()),
    ]);

    results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
            console.log(`成功 [${index}]:`, result.value);
        } else {
            console.log(`失敗 [${index}]:`, result.reason);
        }
    });
}
```

### 5.3 リクエストのキャンセル

```javascript
// AbortController でリクエストをキャンセル
const controller = new AbortController();

// 5秒でタイムアウト
const timeoutId = setTimeout(() => controller.abort(), 5000);

try {
    const response = await fetch('/api/slow-endpoint', {
        signal: controller.signal,
    });
    clearTimeout(timeoutId);
    const data = await response.json();
} catch (error) {
    if (error.name === 'AbortError') {
        console.log('リクエストがキャンセルされました');
    } else {
        throw error;
    }
}

// React での使い方（コンポーネントのアンマウント時にキャンセル）
useEffect(() => {
    const controller = new AbortController();

    fetch('/api/data', { signal: controller.signal })
        .then(r => r.json())
        .then(data => setData(data))
        .catch(err => {
            if (err.name !== 'AbortError') {
                setError(err.message);
            }
        });

    // クリーンアップ関数でキャンセル
    return () => controller.abort();
}, []);
```

### 5.4 リトライ処理

```javascript
async function fetchWithRetry(url, options = {}, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const response = await fetch(url, options);
            if (response.ok) return response;
            
            // 5xx エラーはリトライ対象
            if (response.status >= 500 && attempt < maxRetries) {
                const delay = Math.pow(2, attempt) * 1000; // 指数バックオフ
                console.log(`リトライ ${attempt}/${maxRetries} (${delay}ms後)...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                continue;
            }
            
            throw new Error(`HTTP ${response.status}`);
        } catch (error) {
            if (attempt === maxRetries) throw error;
            
            const delay = Math.pow(2, attempt) * 1000;
            console.log(`リトライ ${attempt}/${maxRetries} (${delay}ms後)...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}
```

---

## 6. よくある間違いと注意点

### 6.1 fetch のエラーハンドリング

```javascript
// ❌ よくある間違い：fetchは4xxや5xxでもrejectしない
try {
    const response = await fetch('/api/not-found');
    const data = await response.json();  // ← 404でもここに来る！
} catch (error) {
    // ネットワークエラーの場合のみここに来る
}

// ✅ 正しい方法：response.ok をチェック
try {
    const response = await fetch('/api/not-found');
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
} catch (error) {
    console.error('エラー:', error.message);
}
```

### 6.2 async/await の注意点

```javascript
// ❌ ループ内の await は直列実行（遅い）
async function fetchAllUsers(ids) {
    const users = [];
    for (const id of ids) {
        const user = await fetch(`/api/users/${id}`).then(r => r.json());
        users.push(user);
    }
    return users;  // 1つずつ順番に取得（遅い）
}

// ✅ Promise.all で並列実行（速い）
async function fetchAllUsers(ids) {
    const promises = ids.map(id => 
        fetch(`/api/users/${id}`).then(r => r.json())
    );
    return await Promise.all(promises);  // 全部同時に取得
}
```

---

## 📝 確認問題

1. 同期処理と非同期処理の違いを説明してください
2. コールバック → Promise → async/await の進化の利点は何ですか？
3. `fetch` が HTTP 404 を返した場合、catch ブロックに入りますか？
4. `Promise.all` と `Promise.allSettled` の違いは何ですか？
5. `AbortController` はどのような場面で使用しますか？

---

## 📖 参考資料
- [MDN - Fetch API](https://developer.mozilla.org/ja/docs/Web/API/Fetch_API)
- [MDN - async function](https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Statements/async_function)
- [MDN - Promise](https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Promise)
- [JavaScript Primer - 非同期処理](https://jsprimer.net/basic/async/)
