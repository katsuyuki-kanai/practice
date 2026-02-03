# SQL入門 - 基本操作を学ぼう

## 📚 この資料で学ぶこと
- SQLとは何か
- 基本的なCRUD操作
- WHERE句による条件指定
- データの並び替えと制限

---

## 1. SQLとは

### 1.1 SQLの定義
SQL（Structured Query Language）は、**データベースを操作するための言語**です。

```
アプリケーション
     ↓ SQL文を送信
     ↓ 「SELECT * FROM users」
データベース
     ↓ 結果を返却
     ↓ [田中太郎, 佐藤花子, ...]
アプリケーション
```

### 1.2 SQLの種類

| 種類 | 名前 | 用途 | 主なコマンド |
|------|------|------|-------------|
| **DDL** | データ定義言語 | テーブル構造の定義 | CREATE, ALTER, DROP |
| **DML** | データ操作言語 | データの操作 | SELECT, INSERT, UPDATE, DELETE |
| **DCL** | データ制御言語 | 権限の管理 | GRANT, REVOKE |
| **TCL** | トランザクション制御 | トランザクション管理 | COMMIT, ROLLBACK |

> 💡 まずは**DML（データ操作）**をマスターしましょう！

---

## 2. テーブルの作成（CREATE TABLE）

### 2.1 基本構文
```sql
CREATE TABLE テーブル名 (
    カラム名1 データ型 制約,
    カラム名2 データ型 制約,
    ...
);
```

### 2.2 実践例
```sql
-- ユーザーテーブルの作成
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    age INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 注文テーブルの作成
CREATE TABLE orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    product_name VARCHAR(200) NOT NULL,
    amount INT NOT NULL,
    order_date DATE NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### 2.3 よく使う制約

| 制約 | 説明 | 例 |
|------|------|-----|
| `PRIMARY KEY` | 主キー（一意 + NOT NULL） | `id INT PRIMARY KEY` |
| `NOT NULL` | NULL禁止 | `name VARCHAR(100) NOT NULL` |
| `UNIQUE` | 重複禁止 | `email VARCHAR(255) UNIQUE` |
| `DEFAULT` | デフォルト値 | `status VARCHAR(20) DEFAULT 'active'` |
| `AUTO_INCREMENT` | 自動連番 | `id INT AUTO_INCREMENT` |
| `FOREIGN KEY` | 外部キー | `FOREIGN KEY (user_id) REFERENCES users(id)` |

---

## 3. CRUD操作

### CRUDとは
| 操作 | SQL | 説明 |
|------|-----|------|
| **C**reate | INSERT | データの作成 |
| **R**ead | SELECT | データの読み取り |
| **U**pdate | UPDATE | データの更新 |
| **D**elete | DELETE | データの削除 |

---

## 4. INSERT - データの挿入

### 4.1 基本構文
```sql
INSERT INTO テーブル名 (カラム1, カラム2, ...) VALUES (値1, 値2, ...);
```

### 4.2 実践例
```sql
-- 1件挿入
INSERT INTO users (name, email, age) VALUES ('田中太郎', 'tanaka@example.com', 25);

-- 複数件挿入
INSERT INTO users (name, email, age) VALUES 
    ('佐藤花子', 'sato@example.com', 30),
    ('鈴木一郎', 'suzuki@example.com', 28),
    ('高橋美咲', 'takahashi@example.com', 22);

-- 全カラム指定（非推奨：カラム順に依存）
INSERT INTO users VALUES (5, '山田次郎', 'yamada@example.com', 35, NOW());
```

> ⚠️ **ベストプラクティス**: カラム名は必ず明示的に指定しましょう

---

## 5. SELECT - データの取得

### 5.1 基本構文
```sql
SELECT カラム1, カラム2, ... FROM テーブル名;
```

### 5.2 全データ取得
```sql
-- 全カラム取得
SELECT * FROM users;

-- 結果:
-- +----+----------+----------------------+-----+---------------------+
-- | id | name     | email                | age | created_at          |
-- +----+----------+----------------------+-----+---------------------+
-- |  1 | 田中太郎 | tanaka@example.com   |  25 | 2026-02-03 10:00:00 |
-- |  2 | 佐藤花子 | sato@example.com     |  30 | 2026-02-03 10:01:00 |
-- |  3 | 鈴木一郎 | suzuki@example.com   |  28 | 2026-02-03 10:02:00 |
-- +----+----------+----------------------+-----+---------------------+
```

### 5.3 特定カラムの取得
```sql
-- 名前とメールのみ取得
SELECT name, email FROM users;

-- 結果:
-- +----------+----------------------+
-- | name     | email                |
-- +----------+----------------------+
-- | 田中太郎 | tanaka@example.com   |
-- | 佐藤花子 | sato@example.com     |
-- +----------+----------------------+
```

### 5.4 エイリアス（別名）
```sql
-- カラムに別名をつける
SELECT name AS 名前, email AS メールアドレス FROM users;

-- 結果:
-- +----------+----------------------+
-- | 名前     | メールアドレス        |
-- +----------+----------------------+
-- | 田中太郎 | tanaka@example.com   |
-- +----------+----------------------+
```

### 5.5 重複を除く（DISTINCT）
```sql
-- 重複する値を除いて取得
SELECT DISTINCT age FROM users;
```

---

## 6. WHERE - 条件の指定

### 6.1 基本構文
```sql
SELECT * FROM テーブル名 WHERE 条件;
```

### 6.2 比較演算子

| 演算子 | 意味 | 例 |
|--------|------|-----|
| `=` | 等しい | `age = 25` |
| `<>` または `!=` | 等しくない | `age <> 25` |
| `>` | より大きい | `age > 25` |
| `<` | より小さい | `age < 25` |
| `>=` | 以上 | `age >= 25` |
| `<=` | 以下 | `age <= 25` |

```sql
-- 25歳のユーザーを取得
SELECT * FROM users WHERE age = 25;

-- 25歳以上のユーザーを取得
SELECT * FROM users WHERE age >= 25;
```

### 6.3 論理演算子

```sql
-- AND: 両方の条件を満たす
SELECT * FROM users WHERE age >= 25 AND age <= 30;

-- OR: どちらかの条件を満たす
SELECT * FROM users WHERE age = 25 OR age = 30;

-- NOT: 条件を満たさない
SELECT * FROM users WHERE NOT age = 25;
```

### 6.4 便利な条件指定

```sql
-- BETWEEN: 範囲指定
SELECT * FROM users WHERE age BETWEEN 25 AND 30;

-- IN: 複数値のいずれか
SELECT * FROM users WHERE age IN (25, 28, 30);

-- LIKE: パターンマッチング
-- % は0文字以上の任意の文字列
-- _ は1文字の任意の文字
SELECT * FROM users WHERE name LIKE '田%';      -- 「田」で始まる
SELECT * FROM users WHERE email LIKE '%@example.com';  -- example.comで終わる
SELECT * FROM users WHERE name LIKE '%花%';     -- 「花」を含む

-- IS NULL / IS NOT NULL: NULLの判定
SELECT * FROM users WHERE age IS NULL;
SELECT * FROM users WHERE age IS NOT NULL;
```

---

## 7. UPDATE - データの更新

### 7.1 基本構文
```sql
UPDATE テーブル名 SET カラム1 = 値1, カラム2 = 値2 WHERE 条件;
```

### 7.2 実践例
```sql
-- 特定ユーザーの年齢を更新
UPDATE users SET age = 26 WHERE id = 1;

-- 複数カラムを更新
UPDATE users SET name = '田中太郎Jr', age = 26 WHERE id = 1;

-- 計算による更新
UPDATE users SET age = age + 1 WHERE id = 1;
```

> ⚠️ **重要**: WHERE句を忘れると**全レコードが更新**されます！

```sql
-- 危険な例（全員の年齢が30になる）
UPDATE users SET age = 30;  -- WHERE句がない！
```

---

## 8. DELETE - データの削除

### 8.1 基本構文
```sql
DELETE FROM テーブル名 WHERE 条件;
```

### 8.2 実践例
```sql
-- 特定ユーザーを削除
DELETE FROM users WHERE id = 1;

-- 条件に合うレコードを削除
DELETE FROM users WHERE age < 20;
```

> ⚠️ **重要**: WHERE句を忘れると**全レコードが削除**されます！

```sql
-- 危険な例（全データ削除）
DELETE FROM users;  -- WHERE句がない！

-- 全データ削除する場合は TRUNCATE を使う（高速）
TRUNCATE TABLE users;
```

---

## 9. ORDER BY - 並び替え

### 9.1 基本構文
```sql
SELECT * FROM テーブル名 ORDER BY カラム名 [ASC|DESC];
```

### 9.2 実践例
```sql
-- 年齢の昇順（小さい順）
SELECT * FROM users ORDER BY age ASC;
SELECT * FROM users ORDER BY age;  -- ASCは省略可能

-- 年齢の降順（大きい順）
SELECT * FROM users ORDER BY age DESC;

-- 複数カラムでソート（年齢順、同じなら名前順）
SELECT * FROM users ORDER BY age ASC, name ASC;
```

---

## 10. LIMIT - 取得件数の制限

### 10.1 基本構文
```sql
SELECT * FROM テーブル名 LIMIT 件数;
SELECT * FROM テーブル名 LIMIT オフセット, 件数;
```

### 10.2 実践例
```sql
-- 先頭3件を取得
SELECT * FROM users LIMIT 3;

-- 4件目から3件を取得（ページネーション）
SELECT * FROM users LIMIT 3, 3;  -- オフセット3, 取得3件

-- OFFSET構文（MySQLはどちらも使える）
SELECT * FROM users LIMIT 3 OFFSET 3;
```

---

## 11. SQL文の実行順序

SQLは書いた順番とは異なる順序で実行されます。

```sql
SELECT name, age        -- 5. 取得するカラムを選択
FROM users              -- 1. テーブルを指定
WHERE age >= 20         -- 2. 条件でフィルタリング
ORDER BY age DESC       -- 3. 並び替え
LIMIT 10;               -- 4. 件数制限
```

```
実行順序:
1. FROM    → テーブルを決定
2. WHERE   → 条件に合う行を抽出
3. ORDER BY → 結果を並び替え
4. LIMIT   → 取得件数を制限
5. SELECT  → 表示するカラムを選択
```

---

## 🎯 まとめ

| 操作 | SQL | ポイント |
|------|-----|---------|
| **作成** | INSERT INTO ... VALUES ... | カラム名は明示的に指定 |
| **読取** | SELECT ... FROM ... WHERE ... | * の多用は避ける |
| **更新** | UPDATE ... SET ... WHERE ... | WHERE句を忘れずに！ |
| **削除** | DELETE FROM ... WHERE ... | WHERE句を忘れずに！ |
| **並替** | ORDER BY ... ASC/DESC | 昇順はASC、降順はDESC |
| **制限** | LIMIT 件数 | ページネーションに使用 |

---

## 📝 練習問題

以下のusersテーブルに対するSQLを書いてください。

```
+----+----------+----------------------+-----+
| id | name     | email                | age |
+----+----------+----------------------+-----+
|  1 | 田中太郎 | tanaka@example.com   |  25 |
|  2 | 佐藤花子 | sato@example.com     |  30 |
|  3 | 鈴木一郎 | suzuki@example.com   |  28 |
|  4 | 高橋美咲 | takahashi@example.com|  22 |
|  5 | 山田次郎 | yamada@example.com   |  35 |
+----+----------+----------------------+-----+
```

1. 全ユーザーの名前とメールアドレスを取得
2. 25歳以上30歳以下のユーザーを取得
3. 名前に「田」が含まれるユーザーを取得
4. 年齢順（降順）で上位3名を取得
5. id=3のユーザーの年齢を29に更新
6. 新しいユーザー「伊藤健太（ito@example.com、27歳）」を追加

---

次の資料: [JOINと集計関数](./JOINと集計関数.md)
