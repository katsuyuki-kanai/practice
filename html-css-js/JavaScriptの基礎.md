# HTML/CSS/JavaScript の基礎 - 第2回：JavaScript

## 📚 この資料で学ぶこと
- JavaScriptの基本構文
- DOM操作
- イベント処理
- 実践的なインタラクション

> ⏰ 想定時間：1時間（HTML/CSS/JS 全2回中の第2回）

---

## 1. JavaScriptの基本

### 1.1 JavaScriptとは

**JavaScript**はWebページに**動き（インタラクティブ性）**を加えるプログラミング言語です。

```
HTML = 構造（骨格）
CSS  = 見た目（装飾）
JS   = 動き（インタラクション）← 今回
```

### 1.2 JavaScriptの実行方法

```html
<!-- 方法1：外部ファイル（推奨） -->
<script src="script.js"></script>

<!-- 方法2：HTML内に記述 -->
<script>
    console.log('Hello, JavaScript!');
</script>

<!-- 方法3：ブラウザの開発者ツール（F12 → Console） -->
```

> 💡 `<script>` タグは `</body>` の直前に配置するのが一般的です

### 1.3 変数と定数

```javascript
// const：再代入不可（基本的にこちらを使う）
const name = '田中太郎';
const PI = 3.14159;
// name = '佐藤';  // エラー！

// let：再代入可能
let age = 25;
age = 26;  // OK

// var：古い書き方（使わない）
// var old = 'これは使わない';
```

> 💡 **基本は `const` を使い、再代入が必要な場合のみ `let` を使いましょう**

### 1.4 データ型

```javascript
// 文字列
const str = 'Hello';
const str2 = "World";
const template = `こんにちは、${name}さん！`;  // テンプレートリテラル（バッククォート）

// 数値
const num = 42;
const decimal = 3.14;

// 真偽値
const isActive = true;

// null / undefined
const empty = null;          // 明示的な「空」
let notDefined;              // undefined（未定義）

// 配列
const fruits = ['りんご', 'バナナ', 'みかん'];
console.log(fruits[0]);      // りんご
console.log(fruits.length);  // 3

// オブジェクト
const user = {
    name: '田中太郎',
    age: 25,
    email: 'tanaka@example.com'
};
console.log(user.name);      // 田中太郎
console.log(user['age']);    // 25
```

### 1.5 関数

```javascript
// 関数宣言
function greet(name) {
    return `こんにちは、${name}さん！`;
}
console.log(greet('田中'));  // こんにちは、田中さん！

// アロー関数（推奨）
const add = (a, b) => a + b;
console.log(add(10, 20));  // 30

const multiply = (a, b) => {
    const result = a * b;
    return result;
};

// デフォルト引数
const greet2 = (name = 'ゲスト') => `こんにちは、${name}さん！`;
console.log(greet2());        // こんにちは、ゲストさん！
console.log(greet2('佐藤'));  // こんにちは、佐藤さん！
```

### 1.6 条件分岐とループ

```javascript
// if文
const score = 85;
if (score >= 80) {
    console.log('合格');
} else if (score >= 60) {
    console.log('追試');
} else {
    console.log('不合格');
}

// 三項演算子
const status = score >= 80 ? '合格' : '不合格';

// forループ
for (let i = 0; i < 5; i++) {
    console.log(i);
}

// for...of（配列）
const colors = ['赤', '青', '緑'];
for (const color of colors) {
    console.log(color);
}

// 配列メソッド（推奨）
colors.forEach(color => console.log(color));
const upperColors = colors.map(c => c + '色');
const filtered = [1,2,3,4,5].filter(n => n > 3);  // [4, 5]
```

---

## 2. DOM操作

### 2.1 DOMとは

**DOM（Document Object Model）**は、HTMLをJavaScriptから操作するための仕組みです。

```
HTML文書をツリー構造のオブジェクトとして表現：

document
└── html
    ├── head
    │   └── title
    └── body
        ├── h1
        ├── p
        └── div
            └── button
```

### 2.2 要素の取得

```javascript
// IDで取得（1つだけ）
const header = document.getElementById('header');

// CSSセレクタで取得（1つ目）
const firstCard = document.querySelector('.card');

// CSSセレクタで取得（すべて）
const allCards = document.querySelectorAll('.card');

// 実用例
const title = document.querySelector('h1');
const navLinks = document.querySelectorAll('.nav-link');
const form = document.querySelector('#loginForm');
const buttons = document.querySelectorAll('button');
```

### 2.3 要素の変更

```javascript
const title = document.querySelector('#title');

// テキストの変更
title.textContent = '新しいタイトル';

// HTMLの変更（XSSに注意！ユーザー入力には使わない）
// title.innerHTML = '<em>強調タイトル</em>';

// 属性の変更
const link = document.querySelector('a');
link.setAttribute('href', 'https://example.com');
link.setAttribute('target', '_blank');

// クラスの操作
const card = document.querySelector('.card');
card.classList.add('active');       // クラスを追加
card.classList.remove('active');    // クラスを削除
card.classList.toggle('active');    // 追加/削除を切り替え
card.classList.contains('active');  // クラスがあるか確認

// スタイルの変更
title.style.color = 'red';
title.style.fontSize = '24px';
title.style.display = 'none';  // 非表示
```

### 2.4 要素の作成と追加

```javascript
// 新しい要素を作成
const newItem = document.createElement('li');
newItem.textContent = '新しい項目';
newItem.classList.add('list-item');

// 要素を追加
const list = document.querySelector('ul');
list.appendChild(newItem);                  // 末尾に追加
list.prepend(newItem);                      // 先頭に追加
list.insertBefore(newItem, list.firstChild); // 特定の位置に追加

// 要素を削除
const target = document.querySelector('.remove-me');
target.remove();
```

---

## 3. イベント処理

### 3.1 イベントリスナー

```javascript
const button = document.querySelector('#myButton');

// クリックイベント
button.addEventListener('click', () => {
    console.log('ボタンがクリックされました！');
});

// イベントオブジェクトを受け取る
button.addEventListener('click', (event) => {
    console.log(event.target);      // クリックされた要素
    console.log(event.type);        // 'click'
    event.preventDefault();         // デフォルト動作を防止
});
```

### 3.2 よく使うイベント

| イベント | 発生タイミング |
|---------|--------------|
| `click` | クリック時 |
| `submit` | フォーム送信時 |
| `input` | 入力値が変化した時 |
| `change` | 値が確定した時 |
| `keydown` / `keyup` | キー押下/離した時 |
| `mouseover` / `mouseout` | マウスが乗った/離れた時 |
| `focus` / `blur` | フォーカスした/外れた時 |
| `DOMContentLoaded` | HTML解析完了時 |
| `load` | ページ完全読み込み時 |

### 3.3 フォームのイベント処理

```javascript
const form = document.querySelector('#myForm');
const nameInput = document.querySelector('#name');

// フォーム送信の処理
form.addEventListener('submit', (event) => {
    event.preventDefault();  // ページ遷移を防止
    
    const name = nameInput.value;
    if (name.trim() === '') {
        alert('名前を入力してください');
        return;
    }
    
    console.log(`送信: ${name}`);
});

// リアルタイム入力チェック
nameInput.addEventListener('input', (event) => {
    const value = event.target.value;
    const counter = document.querySelector('#charCount');
    counter.textContent = `${value.length}/20文字`;
});
```

---

## 4. 実践：ToDoリスト

```html
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ToDoリスト</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: sans-serif; max-width: 500px; margin: 40px auto; padding: 0 16px; }
        h1 { text-align: center; margin-bottom: 24px; }
        .input-area { display: flex; gap: 8px; margin-bottom: 24px; }
        .input-area input { flex: 1; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; font-size: 16px; }
        .input-area button { padding: 8px 16px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer; }
        .todo-list { list-style: none; }
        .todo-item { display: flex; align-items: center; gap: 8px; padding: 12px; border-bottom: 1px solid #eee; }
        .todo-item.completed span { text-decoration: line-through; color: #999; }
        .todo-item span { flex: 1; }
        .todo-item button { padding: 4px 8px; border: none; border-radius: 4px; cursor: pointer; }
        .btn-delete { background: #f44336; color: white; }
    </style>
</head>
<body>
    <h1>📝 ToDoリスト</h1>
    
    <div class="input-area">
        <input type="text" id="todoInput" placeholder="やることを入力...">
        <button id="addBtn">追加</button>
    </div>
    
    <ul class="todo-list" id="todoList"></ul>

    <script>
        const input = document.querySelector('#todoInput');
        const addBtn = document.querySelector('#addBtn');
        const todoList = document.querySelector('#todoList');

        // ToDo追加
        const addTodo = () => {
            const text = input.value.trim();
            if (text === '') return;

            const li = document.createElement('li');
            li.classList.add('todo-item');
            li.innerHTML = `
                <input type="checkbox">
                <span>${escapeHtml(text)}</span>
                <button class="btn-delete">削除</button>
            `;

            // 完了チェック
            li.querySelector('input[type="checkbox"]').addEventListener('change', (e) => {
                li.classList.toggle('completed', e.target.checked);
            });

            // 削除
            li.querySelector('.btn-delete').addEventListener('click', () => {
                li.remove();
            });

            todoList.appendChild(li);
            input.value = '';
            input.focus();
        };

        // XSS対策：HTMLエスケープ
        const escapeHtml = (str) => {
            const div = document.createElement('div');
            div.textContent = str;
            return div.innerHTML;
        };

        addBtn.addEventListener('click', addTodo);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') addTodo();
        });
    </script>
</body>
</html>
```

---

## 5. モダンJavaScript の便利な機能

### 5.1 分割代入

```javascript
// 配列の分割代入
const [first, second, ...rest] = [1, 2, 3, 4, 5];
// first=1, second=2, rest=[3,4,5]

// オブジェクトの分割代入
const user = { name: '田中', age: 25, email: 'tanaka@example.com' };
const { name, age } = user;
// name='田中', age=25
```

### 5.2 スプレッド構文

```javascript
// 配列のコピーと結合
const arr1 = [1, 2, 3];
const arr2 = [...arr1, 4, 5];  // [1, 2, 3, 4, 5]

// オブジェクトのコピーと更新
const user = { name: '田中', age: 25 };
const updated = { ...user, age: 26 };  // { name: '田中', age: 26 }
```

### 5.3 オプショナルチェーン

```javascript
const user = { name: '田中', address: null };

// ❌ エラーになる可能性
// console.log(user.address.city);

// ✅ 安全にアクセス
console.log(user.address?.city);  // undefined（エラーにならない）
console.log(user.profile?.avatar?.url);  // undefined
```

---

## 📝 練習問題

### 問題1：カウンターアプリ
+ボタンと-ボタンで数字が増減するカウンターを作成してください。

### 問題2：文字数カウンター
テキストエリアに入力した文字数をリアルタイムで表示し、100文字を超えたら赤色で表示してください。

### 問題3：ToDoリストの拡張
上記のToDoリストに以下の機能を追加してください：
- 全削除ボタン
- 残りタスク数の表示
- ローカルストレージへの保存

---

## 📖 参考資料
- [MDN Web Docs - JavaScript](https://developer.mozilla.org/ja/docs/Web/JavaScript)
- [MDN Web Docs - HTML](https://developer.mozilla.org/ja/docs/Web/HTML)
- [MDN Web Docs - CSS](https://developer.mozilla.org/ja/docs/Web/CSS)
