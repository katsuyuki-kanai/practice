# RDB基礎 & SQL入門 - 勉強会資料

## 📖 概要
1年目エンジニア向けのRDB（リレーショナルデータベース）基礎とSQL入門の勉強会資料です。

## 🎯 対象者
- プログラミング初心者〜1年目のエンジニア
- データベースの基礎を学びたい方
- SQLの基本操作を習得したい方

## 📚 資料構成

| No | 資料 | 内容 | 所要時間(目安) |
|----|------|------|---------------|
| 1 | [RDBの基礎概念](./RDBの基礎概念.md) | データベースとは、テーブル構造、キーの概念、リレーション | 30分 |
| 2 | [SQL入門](./SQL入門.md) | CRUD操作、WHERE句、ORDER BY、LIMIT | 45分 |
| 3 | [JOINと集計関数](./JOINと集計関数.md) | JOIN、COUNT/SUM/AVG、GROUP BY、HAVING | 45分 |
| 4 | [実践SQLテクニック](./実践SQLテクニック.md) | サブクエリ、CASE式、インデックス、トランザクション | 60分 |

## 📅 学習スケジュール案

### 1週目: 基礎理解
- RDBの基礎概念を読む
- SQL入門（SELECT, WHERE）を実践

### 2週目: CRUD操作
- INSERT, UPDATE, DELETEを実践
- ORDER BY, LIMITを使いこなす

### 3週目: データ結合と集計
- JOINの各種パターンを理解
- GROUP BYと集計関数を実践

### 4週目: 実践テクニック
- サブクエリ、CASE式を活用
- インデックスとパフォーマンスを理解

## 🛠 実践環境の準備

### オンライン環境（推奨）
- [DB Fiddle](https://www.db-fiddle.com/) - ブラウザでSQL実行
- [SQLZoo](https://sqlzoo.net/) - インタラクティブ学習

### ローカル環境
```bash
# Docker を使用する場合
docker run --name mysql-practice -e MYSQL_ROOT_PASSWORD=password -d mysql:8.0

# 接続
docker exec -it mysql-practice mysql -uroot -ppassword
```

## 📝 練習用サンプルデータ

```sql
-- データベース作成
CREATE DATABASE practice_db;
USE practice_db;

-- ユーザーテーブル
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    age INT,
    department VARCHAR(50),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 注文テーブル
CREATE TABLE orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    product_name VARCHAR(200) NOT NULL,
    amount INT NOT NULL,
    order_date DATE NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- サンプルデータ挿入
INSERT INTO users (name, email, age, department) VALUES
('田中太郎', 'tanaka@example.com', 25, '営業部'),
('佐藤花子', 'sato@example.com', 30, '開発部'),
('鈴木一郎', 'suzuki@example.com', 28, '開発部'),
('高橋美咲', 'takahashi@example.com', 22, '人事部'),
('山田次郎', 'yamada@example.com', 35, '営業部');

INSERT INTO orders (user_id, product_name, amount, order_date) VALUES
(1, 'ノートPC', 150000, '2026-01-10'),
(1, 'マウス', 3000, '2026-01-15'),
(2, 'モニター', 45000, '2026-01-20'),
(3, 'キーボード', 12000, '2026-02-01'),
(1, 'USBハブ', 2500, '2026-02-03'),
(2, 'Webカメラ', 8000, '2026-02-05');
```

## ✅ 習得チェックリスト

### 基礎レベル
- [ ] テーブル、レコード、カラムの違いを説明できる
- [ ] 主キーと外部キーの役割を理解している
- [ ] SELECT文でデータを取得できる
- [ ] WHERE句で条件を指定できる
- [ ] INSERT, UPDATE, DELETEを実行できる

### 中級レベル
- [ ] JOINで複数テーブルを結合できる
- [ ] GROUP BYで集計ができる
- [ ] HAVINGとWHEREの違いを説明できる
- [ ] サブクエリを使用できる

### 応用レベル
- [ ] CASE式で条件分岐ができる
- [ ] インデックスの効果を理解している
- [ ] トランザクションの必要性を説明できる
- [ ] EXPLAINで実行計画を確認できる

## 📞 質問・フィードバック
勉強会に関する質問やフィードバックは、チームのSlackチャンネルまでお願いします。

---
最終更新: 2026年2月3日
