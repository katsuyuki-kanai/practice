# JOINと集計関数 - テーブル結合とデータ集計

## 📚 この資料で学ぶこと
- 複数テーブルの結合（JOIN）
- 集計関数の使い方
- GROUP BY によるグループ化
- HAVING による集計結果のフィルタリング

---

## 1. サンプルデータ

この資料では以下のテーブルを使用します。

```sql
-- usersテーブル
+----+----------+------------+
| id | name     | department |
+----+----------+------------+
|  1 | 田中太郎 | 営業部     |
|  2 | 佐藤花子 | 開発部     |
|  3 | 鈴木一郎 | 開発部     |
|  4 | 高橋美咲 | 人事部     |
+----+----------+------------+

-- ordersテーブル
+----+---------+------------+--------+
| id | user_id | order_date | amount |
+----+---------+------------+--------+
|  1 |    1    | 2026-01-10 |   5000 |
|  2 |    1    | 2026-01-15 |   3000 |
|  3 |    2    | 2026-01-20 |   8000 |
|  4 |    3    | 2026-02-01 |   2000 |
|  5 |    1    | 2026-02-03 |   4000 |
+----+---------+------------+--------+

-- productsテーブル
+----+------------+-------+
| id | name       | price |
+----+------------+-------+
|  1 | りんご     |   100 |
|  2 | みかん     |   150 |
|  3 | バナナ     |   200 |
+----+------------+-------+
```

---

## 2. JOIN - テーブルの結合

### 2.1 JOINとは
複数のテーブルを**関連するカラムで結合**し、1つの結果として取得する操作です。

### 2.2 JOINの種類

```
    INNER JOIN          LEFT JOIN           RIGHT JOIN          FULL OUTER JOIN
    (内部結合)          (左外部結合)        (右外部結合)        (完全外部結合)
    
     ┌───┬───┐           ┌───┬───┐           ┌───┬───┐           ┌───┬───┐
     │ A │ B │           │ A │ B │           │ A │ B │           │ A │ B │
     │ ∩ │   │           │███│ ∩ │           │ ∩ │███│           │███│███│
     │   │   │           │   │   │           │   │   │           │   │   │
     └───┴───┘           └───┴───┘           └───┴───┘           └───┴───┘
     
    両方に存在        左テーブル全て      右テーブル全て       両方全て
```

---

## 3. INNER JOIN（内部結合）

### 3.1 説明
両方のテーブルで**条件に一致するデータのみ**を取得します。

### 3.2 構文
```sql
SELECT カラム
FROM テーブルA
INNER JOIN テーブルB ON テーブルA.カラム = テーブルB.カラム;
```

### 3.3 実践例
```sql
-- ユーザーと注文を結合（注文があるユーザーのみ）
SELECT 
    users.name,
    orders.order_date,
    orders.amount
FROM users
INNER JOIN orders ON users.id = orders.user_id;

-- 結果:
-- +----------+------------+--------+
-- | name     | order_date | amount |
-- +----------+------------+--------+
-- | 田中太郎 | 2026-01-10 |   5000 |
-- | 田中太郎 | 2026-01-15 |   3000 |
-- | 田中太郎 | 2026-02-03 |   4000 |
-- | 佐藤花子 | 2026-01-20 |   8000 |
-- | 鈴木一郎 | 2026-02-01 |   2000 |
-- +----------+------------+--------+
-- ※高橋美咲は注文がないため表示されない
```

### 3.4 テーブルの別名（エイリアス）
```sql
-- テーブル名が長い場合は別名を使う
SELECT 
    u.name,
    o.order_date,
    o.amount
FROM users AS u
INNER JOIN orders AS o ON u.id = o.user_id;

-- AS は省略可能
SELECT u.name, o.amount
FROM users u
INNER JOIN orders o ON u.id = o.user_id;
```

---

## 4. LEFT JOIN（左外部結合）

### 4.1 説明
左のテーブルの**全データ**と、右のテーブルの一致するデータを取得します。
一致しない場合は**NULL**になります。

### 4.2 実践例
```sql
-- 全ユーザーと注文を結合（注文がないユーザーも含む）
SELECT 
    u.name,
    o.order_date,
    o.amount
FROM users u
LEFT JOIN orders o ON u.id = o.user_id;

-- 結果:
-- +----------+------------+--------+
-- | name     | order_date | amount |
-- +----------+------------+--------+
-- | 田中太郎 | 2026-01-10 |   5000 |
-- | 田中太郎 | 2026-01-15 |   3000 |
-- | 田中太郎 | 2026-02-03 |   4000 |
-- | 佐藤花子 | 2026-01-20 |   8000 |
-- | 鈴木一郎 | 2026-02-01 |   2000 |
-- | 高橋美咲 | NULL       |   NULL |  ← 注文なし
-- +----------+------------+--------+
```

### 4.3 一致しないレコードのみ取得
```sql
-- 注文がないユーザーを取得
SELECT u.name
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE o.id IS NULL;

-- 結果:
-- +----------+
-- | name     |
-- +----------+
-- | 高橋美咲 |
-- +----------+
```

---

## 5. RIGHT JOIN（右外部結合）

### 5.1 説明
右のテーブルの**全データ**と、左のテーブルの一致するデータを取得します。

### 5.2 実践例
```sql
SELECT 
    u.name,
    o.order_date,
    o.amount
FROM users u
RIGHT JOIN orders o ON u.id = o.user_id;
```

> 💡 実務では LEFT JOIN の方がよく使われます。RIGHT JOIN は LEFT JOIN で書き換え可能です。

---

## 6. 複数テーブルの結合

### 6.1 3つ以上のテーブルを結合
```sql
-- users, orders, order_details を結合
SELECT 
    u.name AS ユーザー名,
    o.order_date AS 注文日,
    p.name AS 商品名,
    od.quantity AS 数量
FROM users u
INNER JOIN orders o ON u.id = o.user_id
INNER JOIN order_details od ON o.id = od.order_id
INNER JOIN products p ON od.product_id = p.id;
```

### 6.2 異なる種類のJOINを組み合わせ
```sql
SELECT 
    u.name,
    o.amount,
    p.name AS product_name
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
INNER JOIN products p ON o.product_id = p.id;
```

---

## 7. 集計関数

### 7.1 主な集計関数

| 関数 | 説明 | 例 |
|------|------|-----|
| `COUNT()` | 件数をカウント | `COUNT(*)`, `COUNT(column)` |
| `SUM()` | 合計を計算 | `SUM(amount)` |
| `AVG()` | 平均を計算 | `AVG(age)` |
| `MAX()` | 最大値を取得 | `MAX(price)` |
| `MIN()` | 最小値を取得 | `MIN(price)` |

### 7.2 COUNT - 件数をカウント
```sql
-- 全ユーザー数
SELECT COUNT(*) AS total_users FROM users;
-- 結果: 4

-- 注文があるユーザー数（NULLを除く）
SELECT COUNT(DISTINCT user_id) AS users_with_orders FROM orders;
-- 結果: 3

-- 部署ごとの人数
SELECT department, COUNT(*) AS count
FROM users
GROUP BY department;
```

### 7.3 SUM - 合計
```sql
-- 注文金額の合計
SELECT SUM(amount) AS total_amount FROM orders;
-- 結果: 22000

-- ユーザーごとの注文金額合計
SELECT user_id, SUM(amount) AS total
FROM orders
GROUP BY user_id;
```

### 7.4 AVG - 平均
```sql
-- 注文金額の平均
SELECT AVG(amount) AS avg_amount FROM orders;
-- 結果: 4400

-- 小数点以下を丸める
SELECT ROUND(AVG(amount), 0) AS avg_amount FROM orders;
-- 結果: 4400
```

### 7.5 MAX / MIN - 最大・最小
```sql
-- 最高注文金額と最低注文金額
SELECT 
    MAX(amount) AS max_amount,
    MIN(amount) AS min_amount
FROM orders;
-- 結果: max_amount=8000, min_amount=2000
```

---

## 8. GROUP BY - グループ化

### 8.1 説明
指定したカラムの値ごとにデータを**グループ化**し、集計を行います。

### 8.2 構文
```sql
SELECT カラム, 集計関数
FROM テーブル
GROUP BY カラム;
```

### 8.3 実践例
```sql
-- 部署ごとの人数
SELECT 
    department,
    COUNT(*) AS member_count
FROM users
GROUP BY department;

-- 結果:
-- +------------+--------------+
-- | department | member_count |
-- +------------+--------------+
-- | 営業部     |            1 |
-- | 開発部     |            2 |
-- | 人事部     |            1 |
-- +------------+--------------+
```

```sql
-- ユーザーごとの注文統計
SELECT 
    u.name,
    COUNT(o.id) AS order_count,
    SUM(o.amount) AS total_amount,
    AVG(o.amount) AS avg_amount
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
GROUP BY u.id, u.name;

-- 結果:
-- +----------+-------------+--------------+------------+
-- | name     | order_count | total_amount | avg_amount |
-- +----------+-------------+--------------+------------+
-- | 田中太郎 |           3 |        12000 |       4000 |
-- | 佐藤花子 |           1 |         8000 |       8000 |
-- | 鈴木一郎 |           1 |         2000 |       2000 |
-- | 高橋美咲 |           0 |         NULL |       NULL |
-- +----------+-------------+--------------+------------+
```

```sql
-- 月ごとの売上集計
SELECT 
    DATE_FORMAT(order_date, '%Y-%m') AS month,
    COUNT(*) AS order_count,
    SUM(amount) AS total_amount
FROM orders
GROUP BY DATE_FORMAT(order_date, '%Y-%m');

-- 結果:
-- +---------+-------------+--------------+
-- | month   | order_count | total_amount |
-- +---------+-------------+--------------+
-- | 2026-01 |           3 |        16000 |
-- | 2026-02 |           2 |         6000 |
-- +---------+-------------+--------------+
```

---

## 9. HAVING - 集計結果のフィルタリング

### 9.1 WHERE と HAVING の違い

| 句 | 用途 | 実行タイミング |
|----|------|---------------|
| **WHERE** | 個々のレコードをフィルタ | GROUP BY の前 |
| **HAVING** | 集計結果をフィルタ | GROUP BY の後 |

### 9.2 実践例
```sql
-- 注文が2回以上のユーザー
SELECT 
    u.name,
    COUNT(o.id) AS order_count
FROM users u
INNER JOIN orders o ON u.id = o.user_id
GROUP BY u.id, u.name
HAVING COUNT(o.id) >= 2;

-- 結果:
-- +----------+-------------+
-- | name     | order_count |
-- +----------+-------------+
-- | 田中太郎 |           3 |
-- +----------+-------------+
```

```sql
-- 平均注文金額が5000円以上のユーザー
SELECT 
    u.name,
    AVG(o.amount) AS avg_amount
FROM users u
INNER JOIN orders o ON u.id = o.user_id
GROUP BY u.id, u.name
HAVING AVG(o.amount) >= 5000;

-- 結果:
-- +----------+------------+
-- | name     | avg_amount |
-- +----------+------------+
-- | 佐藤花子 |       8000 |
-- +----------+------------+
```

### 9.3 WHERE と HAVING の組み合わせ
```sql
-- 2026年1月の注文のうち、合計5000円以上購入したユーザー
SELECT 
    u.name,
    SUM(o.amount) AS total
FROM users u
INNER JOIN orders o ON u.id = o.user_id
WHERE o.order_date BETWEEN '2026-01-01' AND '2026-01-31'  -- 先にフィルタ
GROUP BY u.id, u.name
HAVING SUM(o.amount) >= 5000;  -- 集計結果をフィルタ
```

---

## 10. SQL実行順序（完全版）

```sql
SELECT department, COUNT(*) AS cnt    -- 6. カラム選択
FROM users                             -- 1. テーブル指定
JOIN orders ON users.id = orders.user_id  -- 2. 結合
WHERE age >= 20                        -- 3. 行のフィルタリング
GROUP BY department                    -- 4. グループ化
HAVING COUNT(*) >= 2                   -- 5. グループのフィルタリング
ORDER BY cnt DESC                      -- 7. 並び替え
LIMIT 10;                              -- 8. 件数制限
```

```
実行順序:
1. FROM      → テーブルを決定
2. JOIN      → テーブルを結合
3. WHERE     → 行をフィルタリング
4. GROUP BY  → グループ化
5. HAVING    → グループをフィルタリング
6. SELECT    → カラムを選択
7. ORDER BY  → 並び替え
8. LIMIT     → 件数制限
```

---

## 🎯 まとめ

| 概念 | ポイント |
|------|---------|
| **INNER JOIN** | 両テーブルで一致するデータのみ |
| **LEFT JOIN** | 左テーブルの全データ + 一致する右テーブル |
| **COUNT** | 件数カウント（NULLは除外） |
| **SUM / AVG** | 合計・平均（数値カラム） |
| **GROUP BY** | 指定カラムでグループ化 |
| **HAVING** | 集計結果のフィルタリング |

---

## 📝 練習問題

以下のテーブルに対するSQLを書いてください。

1. 全ユーザーの注文回数を表示（注文がないユーザーは0として表示）
2. 部署ごとの平均年齢を計算
3. 注文金額が3000円以上の注文があるユーザー名を取得
4. 月ごとの注文件数と売上合計を集計
5. 2回以上注文し、合計金額が10000円以上のユーザーを取得

---

次の資料: [実践SQLテクニック](./実践SQLテクニック.md)
