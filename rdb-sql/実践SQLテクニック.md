# 実践SQLテクニック

## 📚 この資料で学ぶこと
- サブクエリの使い方
- CASE式による条件分岐
- インデックスの基礎
- トランザクション
- よくある実装パターン

---

## 1. サブクエリ（副問合せ）

### 1.1 サブクエリとは
SQL文の中に**別のSQL文を埋め込む**手法です。

### 1.2 WHERE句でのサブクエリ
```sql
-- 平均以上の金額の注文を取得
SELECT * FROM orders
WHERE amount >= (SELECT AVG(amount) FROM orders);

-- 注文履歴があるユーザーを取得
SELECT * FROM users
WHERE id IN (SELECT DISTINCT user_id FROM orders);

-- 注文履歴がないユーザーを取得
SELECT * FROM users
WHERE id NOT IN (SELECT DISTINCT user_id FROM orders);
```

### 1.3 FROM句でのサブクエリ（インラインビュー）
```sql
-- ユーザーごとの注文集計をさらに分析
SELECT 
    user_summary.name,
    user_summary.total_amount,
    CASE 
        WHEN user_summary.total_amount >= 10000 THEN 'VIP'
        WHEN user_summary.total_amount >= 5000 THEN '優良'
        ELSE '一般'
    END AS customer_rank
FROM (
    SELECT 
        u.name,
        COALESCE(SUM(o.amount), 0) AS total_amount
    FROM users u
    LEFT JOIN orders o ON u.id = o.user_id
    GROUP BY u.id, u.name
) AS user_summary;
```

### 1.4 SELECT句でのサブクエリ（スカラーサブクエリ）
```sql
-- 各注文に全体の平均金額を表示
SELECT 
    id,
    amount,
    (SELECT AVG(amount) FROM orders) AS avg_amount,
    amount - (SELECT AVG(amount) FROM orders) AS diff_from_avg
FROM orders;
```

### 1.5 EXISTS / NOT EXISTS
```sql
-- 注文履歴があるユーザー（EXISTSを使用）
SELECT * FROM users u
WHERE EXISTS (
    SELECT 1 FROM orders o WHERE o.user_id = u.id
);

-- 注文履歴がないユーザー
SELECT * FROM users u
WHERE NOT EXISTS (
    SELECT 1 FROM orders o WHERE o.user_id = u.id
);
```

> 💡 大量データでは `IN` より `EXISTS` の方がパフォーマンスが良いことが多い

---

## 2. CASE式 - 条件分岐

### 2.1 基本構文
```sql
CASE 
    WHEN 条件1 THEN 結果1
    WHEN 条件2 THEN 結果2
    ELSE デフォルト結果
END
```

### 2.2 データの分類
```sql
-- 年齢によるグループ分け
SELECT 
    name,
    age,
    CASE 
        WHEN age < 20 THEN '10代'
        WHEN age < 30 THEN '20代'
        WHEN age < 40 THEN '30代'
        ELSE '40代以上'
    END AS age_group
FROM users;

-- 結果:
-- +----------+-----+-----------+
-- | name     | age | age_group |
-- +----------+-----+-----------+
-- | 田中太郎 |  25 | 20代      |
-- | 佐藤花子 |  30 | 30代      |
-- | 高橋美咲 |  22 | 20代      |
-- +----------+-----+-----------+
```

### 2.3 集計でのCASE式
```sql
-- 部署ごとの年代別人数（クロス集計）
SELECT 
    department,
    SUM(CASE WHEN age < 30 THEN 1 ELSE 0 END) AS under_30,
    SUM(CASE WHEN age >= 30 THEN 1 ELSE 0 END) AS over_30
FROM users
GROUP BY department;

-- 結果:
-- +------------+----------+---------+
-- | department | under_30 | over_30 |
-- +------------+----------+---------+
-- | 営業部     |        1 |       0 |
-- | 開発部     |        1 |       1 |
-- | 人事部     |        1 |       0 |
-- +------------+----------+---------+
```

### 2.4 ORDER BYでのCASE式
```sql
-- カスタム順序でソート
SELECT * FROM users
ORDER BY 
    CASE department
        WHEN '開発部' THEN 1
        WHEN '営業部' THEN 2
        WHEN '人事部' THEN 3
        ELSE 4
    END;
```

---

## 3. NULL の扱い

### 3.1 NULLの特性
- NULL は「値が存在しない」を表す
- NULL との演算結果は NULL
- NULL との比較は常に UNKNOWN

```sql
-- これはマッチしない！
SELECT * FROM users WHERE age = NULL;  -- ❌

-- 正しい書き方
SELECT * FROM users WHERE age IS NULL;  -- ✅
```

### 3.2 NULL処理関数

```sql
-- COALESCE: NULLを別の値に置換（複数指定可）
SELECT 
    name,
    COALESCE(phone, email, '連絡先なし') AS contact
FROM users;

-- IFNULL: NULLを別の値に置換（MySQL）
SELECT 
    name,
    IFNULL(age, 0) AS age
FROM users;

-- NULLIF: 2つの値が等しければNULLを返す
SELECT NULLIF(age, 0) FROM users;  -- ageが0ならNULL
```

---

## 4. 便利な関数

### 4.1 文字列関数
```sql
-- CONCAT: 文字列結合
SELECT CONCAT(last_name, ' ', first_name) AS full_name FROM users;

-- LENGTH: 文字数
SELECT name, LENGTH(name) AS name_length FROM users;

-- SUBSTRING: 部分文字列
SELECT SUBSTRING(email, 1, 5) FROM users;  -- 先頭5文字

-- REPLACE: 置換
SELECT REPLACE(phone, '-', '') AS phone_no_hyphen FROM users;

-- TRIM: 空白除去
SELECT TRIM(name) FROM users;

-- UPPER / LOWER: 大文字/小文字変換
SELECT UPPER(email), LOWER(name) FROM users;
```

### 4.2 日付関数
```sql
-- 現在日時
SELECT NOW();           -- 2026-02-03 10:30:00
SELECT CURDATE();       -- 2026-02-03
SELECT CURTIME();       -- 10:30:00

-- 日付の部分取得
SELECT YEAR(order_date) AS year FROM orders;
SELECT MONTH(order_date) AS month FROM orders;
SELECT DAY(order_date) AS day FROM orders;

-- 日付の加算・減算
SELECT DATE_ADD(order_date, INTERVAL 7 DAY) FROM orders;   -- 7日後
SELECT DATE_SUB(order_date, INTERVAL 1 MONTH) FROM orders; -- 1ヶ月前

-- 日付のフォーマット
SELECT DATE_FORMAT(order_date, '%Y年%m月%d日') FROM orders;
-- 結果: 2026年02月03日

-- 日付の差分
SELECT DATEDIFF(NOW(), order_date) AS days_ago FROM orders;
```

### 4.3 数値関数
```sql
-- ROUND: 四捨五入
SELECT ROUND(123.456, 2);  -- 123.46

-- CEIL / FLOOR: 切り上げ / 切り下げ
SELECT CEIL(123.4);   -- 124
SELECT FLOOR(123.9);  -- 123

-- ABS: 絶対値
SELECT ABS(-100);  -- 100

-- MOD: 余り
SELECT MOD(10, 3);  -- 1
```

---

## 5. インデックス

### 5.1 インデックスとは
データベースの**検索を高速化**するための仕組み。本の索引のようなもの。

```
インデックスなし                インデックスあり
+----+----------+              インデックス    テーブル
|  1 | 田中太郎 |              ┌──────────┐   +----+----------+
|  2 | 佐藤花子 |              │ 佐藤 → 2 │──→|  2 | 佐藤花子 |
|  3 | 鈴木一郎 |              │ 鈴木 → 3 │   |    |          |
| .. | ....     |              │ 田中 → 1 │   |    |          |
| 1M | 山田次郎 |              │ ...      │   |    |          |
+----+----------+              └──────────┘   +----+----------+
 全件スキャン                   直接アクセス
 O(n)                          O(log n)
```

### 5.2 インデックスの作成
```sql
-- 単一カラムインデックス
CREATE INDEX idx_users_email ON users(email);

-- 複合インデックス
CREATE INDEX idx_orders_user_date ON orders(user_id, order_date);

-- ユニークインデックス
CREATE UNIQUE INDEX idx_users_email_unique ON users(email);

-- インデックスの削除
DROP INDEX idx_users_email ON users;
```

### 5.3 インデックスが効く条件
```sql
-- ✅ インデックスが効く
SELECT * FROM users WHERE email = 'tanaka@example.com';
SELECT * FROM users WHERE email LIKE 'tanaka%';  -- 前方一致

-- ❌ インデックスが効かない
SELECT * FROM users WHERE email LIKE '%tanaka%';  -- 中間一致
SELECT * FROM users WHERE UPPER(email) = 'TANAKA@EXAMPLE.COM';  -- 関数適用
```

### 5.4 インデックスの注意点
| 項目 | 説明 |
|------|------|
| **メリット** | SELECT が高速化 |
| **デメリット** | INSERT/UPDATE/DELETE が遅くなる |
| **容量** | 追加のストレージが必要 |
| **選定** | よく検索されるカラムに作成 |

---

## 6. トランザクション

### 6.1 トランザクションとは
複数のSQL操作を**一つの処理単位**としてまとめる仕組み。

```
例: 銀行振込（AからBに1万円送金）
1. Aの口座から1万円引く
2. Bの口座に1万円足す

→ 1と2は必ず両方成功するか、両方失敗する必要がある
```

### 6.2 ACID特性

| 特性 | 英語 | 説明 |
|------|------|------|
| **原子性** | Atomicity | 全て成功 or 全て失敗 |
| **一貫性** | Consistency | 整合性が保たれる |
| **分離性** | Isolation | 他の処理の影響を受けない |
| **永続性** | Durability | 完了した処理は永続化される |

### 6.3 トランザクションの使い方
```sql
-- トランザクション開始
START TRANSACTION;
-- または
BEGIN;

-- 処理を実行
UPDATE accounts SET balance = balance - 10000 WHERE id = 1;
UPDATE accounts SET balance = balance + 10000 WHERE id = 2;

-- 成功時：確定
COMMIT;

-- 失敗時：取り消し
ROLLBACK;
```

### 6.4 Node.jsでのトランザクション例
```javascript
const connection = await mysql.createConnection(config);

try {
    // トランザクション開始
    await connection.beginTransaction();
    
    // 処理実行
    await connection.execute(
        'UPDATE accounts SET balance = balance - ? WHERE id = ?',
        [10000, 1]
    );
    await connection.execute(
        'UPDATE accounts SET balance = balance + ? WHERE id = ?',
        [10000, 2]
    );
    
    // 成功時：確定
    await connection.commit();
} catch (error) {
    // エラー時：ロールバック
    await connection.rollback();
    throw error;
}
```

---

## 7. よくある実装パターン

### 7.1 ページネーション
```sql
-- 1ページ目（10件表示）
SELECT * FROM products ORDER BY id LIMIT 10 OFFSET 0;

-- 2ページ目
SELECT * FROM products ORDER BY id LIMIT 10 OFFSET 10;

-- 3ページ目
SELECT * FROM products ORDER BY id LIMIT 10 OFFSET 20;

-- 総ページ数の計算
SELECT CEIL(COUNT(*) / 10) AS total_pages FROM products;
```

### 7.2 UPSERT（あれば更新、なければ挿入）
```sql
-- MySQL: INSERT ... ON DUPLICATE KEY UPDATE
INSERT INTO users (email, name, age)
VALUES ('tanaka@example.com', '田中太郎', 26)
ON DUPLICATE KEY UPDATE
    name = VALUES(name),
    age = VALUES(age);

-- PostgreSQL: INSERT ... ON CONFLICT
INSERT INTO users (email, name, age)
VALUES ('tanaka@example.com', '田中太郎', 26)
ON CONFLICT (email) DO UPDATE SET
    name = EXCLUDED.name,
    age = EXCLUDED.age;
```

### 7.3 ランキング
```sql
-- 売上ランキング
SELECT 
    u.name,
    SUM(o.amount) AS total,
    RANK() OVER (ORDER BY SUM(o.amount) DESC) AS ranking
FROM users u
INNER JOIN orders o ON u.id = o.user_id
GROUP BY u.id, u.name;

-- 部署内ランキング
SELECT 
    name,
    department,
    age,
    RANK() OVER (PARTITION BY department ORDER BY age DESC) AS dept_rank
FROM users;
```

### 7.4 前回からの差分
```sql
-- 前月比較
SELECT 
    month,
    amount,
    LAG(amount, 1) OVER (ORDER BY month) AS prev_month,
    amount - LAG(amount, 1) OVER (ORDER BY month) AS diff
FROM monthly_sales;
```

### 7.5 論理削除
```sql
-- 削除フラグを使用
ALTER TABLE users ADD COLUMN deleted_at DATETIME DEFAULT NULL;

-- 論理削除
UPDATE users SET deleted_at = NOW() WHERE id = 1;

-- 有効なデータのみ取得
SELECT * FROM users WHERE deleted_at IS NULL;

-- 削除済みも含めて取得
SELECT * FROM users;
```

---

## 8. パフォーマンスの基礎

### 8.1 EXPLAIN で実行計画を確認
```sql
EXPLAIN SELECT * FROM users WHERE email = 'tanaka@example.com';

-- 結果の見方
-- type: ALL → フルスキャン（遅い）
-- type: ref → インデックス使用（速い）
-- type: const → 主キー/ユニークキーで1件特定（最速）
```

### 8.2 よくあるパフォーマンス改善

| 問題 | 対策 |
|------|------|
| `SELECT *` | 必要なカラムのみ指定 |
| インデックスなし | 適切なインデックス追加 |
| N+1問題 | JOINを使用 |
| 大量データ取得 | LIMIT で制限 |
| 関数でのフィルタ | 関数を避けてインデックスを活用 |

---

## 🎯 まとめ

| テクニック | 用途 |
|-----------|------|
| **サブクエリ** | 複雑な条件や計算結果の活用 |
| **CASE式** | 条件分岐、データ分類 |
| **COALESCE** | NULL処理 |
| **インデックス** | 検索の高速化 |
| **トランザクション** | データ整合性の保証 |

---

## 📝 総合練習問題

1. 売上上位10%のユーザーを「VIP」、それ以外を「一般」としてラベル付け
2. 月ごとの売上と前月比（増減）を表示
3. 注文がないユーザーにメール送信用のリストを作成
4. 商品ごとの売上ランキングを作成
5. ユーザー登録から1週間以内に注文したユーザーを抽出

---

## 📚 参考資料・次のステップ

- **公式ドキュメント**
  - [MySQL Documentation](https://dev.mysql.com/doc/)
  - [PostgreSQL Documentation](https://www.postgresql.org/docs/)

- **学習リソース**
  - SQLZoo（オンライン練習）
  - LeetCode Database問題

- **次に学ぶべきこと**
  - ウィンドウ関数（RANK, ROW_NUMBER, LAG, LEAD）
  - CTEとWITH句
  - ビュー（VIEW）
  - ストアドプロシージャ
  - データベース設計（ER図の読み書き）
