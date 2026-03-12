# HTML/CSS/JavaScript の基礎 - 第1回：HTML と CSS

## 📚 この資料で学ぶこと
- HTMLの基本構造とタグ
- よく使うHTML要素
- CSSの基本（セレクタ、プロパティ）
- レイアウトの基礎（Flexbox）
- レスポンシブデザイン入門

> ⏰ 想定時間：1時間（HTML/CSS/JS 全2回中の第1回）

---

## 1. HTMLの基本

### 1.1 HTMLとは

**HTML（HyperText Markup Language）**は、Webページの**構造（骨組み）**を定義する言語です。

```
Webページの3つの技術：
├── HTML：構造（骨格）← 今回
├── CSS：見た目（装飾）← 今回
└── JavaScript：動き（動作）← 次回
```

### 1.2 HTMLの基本構造

```html
<!DOCTYPE html>                    <!-- HTML5であることを宣言 -->
<html lang="ja">                   <!-- HTML文書の開始 -->
<head>                             <!-- メタ情報（ブラウザには表示されない） -->
    <meta charset="UTF-8">         <!-- 文字エンコーディング -->
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ページタイトル</title>     <!-- タブに表示されるタイトル -->
    <link rel="stylesheet" href="style.css">  <!-- CSSファイルの読み込み -->
</head>
<body>                             <!-- ページの本体（表示される部分） -->
    <h1>こんにちは！</h1>
    <p>これは段落です。</p>
    <script src="script.js"></script>  <!-- JSファイルの読み込み -->
</body>
</html>
```

### 1.3 よく使うHTMLタグ

#### テキスト関連

```html
<!-- 見出し（h1が最大、h6が最小） -->
<h1>大見出し</h1>
<h2>中見出し</h2>
<h3>小見出し</h3>

<!-- 段落 -->
<p>これは段落です。文章はここに書きます。</p>

<!-- 強調 -->
<strong>太字（重要）</strong>
<em>斜体（強調）</em>

<!-- 改行 -->
<br>

<!-- 水平線 -->
<hr>

<!-- リンク -->
<a href="https://example.com">リンクテキスト</a>
<a href="https://example.com" target="_blank">新しいタブで開く</a>
```

#### リスト

```html
<!-- 順序なしリスト -->
<ul>
    <li>項目1</li>
    <li>項目2</li>
    <li>項目3</li>
</ul>

<!-- 順序ありリスト -->
<ol>
    <li>手順1</li>
    <li>手順2</li>
    <li>手順3</li>
</ol>
```

#### テーブル

```html
<table>
    <thead>
        <tr>
            <th>名前</th>
            <th>年齢</th>
            <th>部署</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>田中太郎</td>
            <td>25</td>
            <td>開発部</td>
        </tr>
        <tr>
            <td>佐藤花子</td>
            <td>30</td>
            <td>営業部</td>
        </tr>
    </tbody>
</table>
```

#### フォーム

```html
<form action="/submit" method="POST">
    <div>
        <label for="name">名前：</label>
        <input type="text" id="name" name="name" placeholder="名前を入力" required>
    </div>
    <div>
        <label for="email">メール：</label>
        <input type="email" id="email" name="email" required>
    </div>
    <div>
        <label for="password">パスワード：</label>
        <input type="password" id="password" name="password" minlength="8">
    </div>
    <div>
        <label for="age">年齢：</label>
        <input type="number" id="age" name="age" min="0" max="150">
    </div>
    <div>
        <label>性別：</label>
        <input type="radio" name="gender" value="male"> 男性
        <input type="radio" name="gender" value="female"> 女性
    </div>
    <div>
        <label>趣味：</label>
        <input type="checkbox" name="hobby" value="reading"> 読書
        <input type="checkbox" name="hobby" value="sports"> スポーツ
    </div>
    <div>
        <label for="dept">部署：</label>
        <select id="dept" name="department">
            <option value="">選択してください</option>
            <option value="dev">開発部</option>
            <option value="sales">営業部</option>
        </select>
    </div>
    <div>
        <label for="message">メッセージ：</label>
        <textarea id="message" name="message" rows="4"></textarea>
    </div>
    <button type="submit">送信</button>
</form>
```

#### セマンティックHTML

```html
<!-- ページの構造を意味のあるタグで表現 -->
<header>
    <nav>
        <a href="/">ホーム</a>
        <a href="/about">会社概要</a>
        <a href="/contact">お問い合わせ</a>
    </nav>
</header>

<main>
    <article>
        <h1>記事タイトル</h1>
        <p>記事の内容...</p>
    </article>
    
    <aside>
        <h2>サイドバー</h2>
        <p>関連リンクなど</p>
    </aside>
</main>

<footer>
    <p>&copy; 2025 会社名</p>
</footer>
```

### 1.4 divとspan

```html
<!-- div：ブロック要素のグルーピング（改行あり） -->
<div class="card">
    <h2>カードタイトル</h2>
    <p>カード内容</p>
</div>

<!-- span：インライン要素のグルーピング（改行なし） -->
<p>価格は <span class="price">¥1,980</span> です。</p>
```

### 1.5 class と id

```html
<!-- class：複数の要素に同じスタイルを適用（複数指定可能） -->
<div class="card featured">カード1</div>
<div class="card">カード2</div>

<!-- id：ページ内で一意の要素を識別 -->
<div id="main-content">メインコンテンツ</div>
```

---

## 2. CSSの基本

### 2.1 CSSの書き方

```css
/* 基本構文: セレクタ { プロパティ: 値; } */

/* タグセレクタ */
h1 {
    color: blue;
    font-size: 24px;
}

/* クラスセレクタ（.をつける） */
.card {
    background-color: white;
    border: 1px solid #ddd;
    padding: 16px;
    border-radius: 8px;
}

/* IDセレクタ（#をつける） */
#main-content {
    max-width: 800px;
    margin: 0 auto;
}

/* 複数セレクタ */
h1, h2, h3 {
    font-family: sans-serif;
}

/* 子孫セレクタ */
.card p {
    color: gray;
}
```

### 2.2 CSSの適用方法

```html
<!-- 方法1：外部ファイル（推奨） -->
<link rel="stylesheet" href="style.css">

<!-- 方法2：<style>タグ内に記述 -->
<style>
    h1 { color: blue; }
</style>

<!-- 方法3：インラインスタイル（非推奨） -->
<h1 style="color: blue;">タイトル</h1>
```

### 2.3 よく使うプロパティ

#### テキスト

```css
.text-example {
    color: #333;                  /* 文字色 */
    font-size: 16px;              /* 文字サイズ */
    font-weight: bold;            /* 太さ（normal, bold, 100-900） */
    font-family: sans-serif;      /* フォント */
    line-height: 1.6;             /* 行間 */
    text-align: center;           /* 揃え（left, center, right） */
    text-decoration: underline;   /* 装飾（none, underline） */
    letter-spacing: 1px;          /* 文字間隔 */
}
```

#### 色の指定方法

```css
.color-examples {
    color: red;                    /* 色名 */
    color: #FF0000;                /* 16進数 */
    color: #F00;                   /* 16進数（省略形） */
    color: rgb(255, 0, 0);         /* RGB */
    color: rgba(255, 0, 0, 0.5);   /* RGBA（透過度あり） */
}
```

#### ボックスモデル

```
                margin（外側の余白）
    ┌──────────────────────────────┐
    │       border（枠線）          │
    │   ┌──────────────────────┐   │
    │   │   padding（内側の余白） │   │
    │   │   ┌──────────────┐   │   │
    │   │   │   content    │   │   │
    │   │   │  （内容領域）  │   │   │
    │   │   └──────────────┘   │   │
    │   └──────────────────────┘   │
    └──────────────────────────────┘
```

```css
.box {
    width: 300px;                  /* 幅 */
    height: 200px;                 /* 高さ */
    padding: 16px;                 /* 内側の余白 */
    margin: 20px;                  /* 外側の余白 */
    border: 1px solid #ddd;        /* 枠線 */
    border-radius: 8px;            /* 角丸 */
    
    /* 個別指定 */
    padding-top: 10px;
    padding-right: 20px;
    padding-bottom: 10px;
    padding-left: 20px;
    /* 省略形: padding: 10px 20px; */
    
    /* box-sizing で padding を含めた幅にする（推奨） */
    box-sizing: border-box;
}
```

#### 背景

```css
.bg-example {
    background-color: #f5f5f5;
    background-image: url('bg.jpg');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    
    /* 省略形 */
    background: #f5f5f5 url('bg.jpg') center/cover no-repeat;
}
```

---

## 3. Flexbox レイアウト

### 3.1 Flexboxとは

**Flexbox**は、要素を**横並び・縦並び**に柔軟に配置するレイアウト手法です。

```css
.container {
    display: flex;           /* Flexboxを有効化 */
    flex-direction: row;     /* 横並び（デフォルト） */
    /* flex-direction: column;  縦並び */
}
```

### 3.2 主な配置

```css
.container {
    display: flex;
    
    /* 主軸方向（横方向）の配置 */
    justify-content: flex-start;    /* 左寄せ（デフォルト） */
    justify-content: center;        /* 中央 */
    justify-content: flex-end;      /* 右寄せ */
    justify-content: space-between; /* 均等配置（両端揃え） */
    justify-content: space-around;  /* 均等配置（均等余白） */
    
    /* 交差軸方向（縦方向）の配置 */
    align-items: stretch;           /* 引き伸ばし（デフォルト） */
    align-items: center;            /* 中央 */
    align-items: flex-start;        /* 上揃え */
    align-items: flex-end;          /* 下揃え */
    
    /* 折り返し */
    flex-wrap: wrap;                /* 改行あり */
    
    /* 隙間 */
    gap: 16px;                      /* 要素間の隙間 */
}

.item {
    flex: 1;                        /* 均等に幅を分配 */
}
```

### 3.3 実践例：ナビゲーションバー

```html
<nav class="navbar">
    <div class="logo">MyApp</div>
    <ul class="nav-links">
        <li><a href="/">ホーム</a></li>
        <li><a href="/about">概要</a></li>
        <li><a href="/contact">お問い合わせ</a></li>
    </ul>
</nav>
```

```css
.navbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 24px;
    height: 60px;
    background-color: #333;
    color: white;
}

.nav-links {
    display: flex;
    list-style: none;
    gap: 24px;
}

.nav-links a {
    color: white;
    text-decoration: none;
}

.nav-links a:hover {
    color: #4CAF50;
}
```

### 3.4 実践例：カードレイアウト

```html
<div class="card-container">
    <div class="card">
        <h3>カード1</h3>
        <p>カードの説明文です。</p>
    </div>
    <div class="card">
        <h3>カード2</h3>
        <p>カードの説明文です。</p>
    </div>
    <div class="card">
        <h3>カード3</h3>
        <p>カードの説明文です。</p>
    </div>
</div>
```

```css
.card-container {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    padding: 16px;
}

.card {
    flex: 1 1 300px;  /* 最小幅300px、残りを均等分配 */
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 24px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    transition: box-shadow 0.3s;
}

.card:hover {
    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}
```

---

## 4. レスポンシブデザイン

### 4.1 メディアクエリ

```css
/* デフォルト（モバイルファースト） */
.container {
    padding: 16px;
}

/* タブレット以上 */
@media (min-width: 768px) {
    .container {
        padding: 24px;
        max-width: 720px;
        margin: 0 auto;
    }
}

/* デスクトップ以上 */
@media (min-width: 1024px) {
    .container {
        max-width: 960px;
    }
}
```

### 4.2 viewport の設定

```html
<!-- レスポンシブ対応に必須 -->
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

---

## 📝 練習問題

### 問題1：プロフィールカード
以下の要素を含むプロフィールカードを作成してください：
- 名前、肩書き、自己紹介文
- リンク（GitHub、Twitter）
- Flexboxを使ってレイアウト

### 問題2：レスポンシブナビゲーション
PC（横並び）とスマホ（縦並び）で表示が変わるナビゲーションバーを作成してください。

---

## ▶ 次回予告
**第2回：JavaScript の基礎**
- 変数、関数、条件分岐
- DOM操作
- イベント処理
- 実践的なインタラクション
