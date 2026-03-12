# Git / GitHub の基礎とブランチ戦略

## 📚 この資料で学ぶこと
- Git の基本概念と仕組み
- 基本的な Git コマンド操作
- GitHub の使い方（リモートリポジトリ）
- ブランチの運用戦略
- プルリクエストとコードレビュー

> ⏰ 想定時間：1時間

---

## 1. Git とは

### 1.1 バージョン管理とは

```
バージョン管理がない場合：
├── 企画書_最新.docx
├── 企画書_最新2.docx
├── 企画書_最終版.docx
├── 企画書_最終版_修正.docx
├── 企画書_本当の最終版.docx      ← どれが本当の最新？
└── 企画書_提出用_田中確認済み.docx

バージョン管理がある場合（Git）：
commit abc123  ← 最新（現在）
commit def456  ← 田中さんのレビュー反映
commit ghi789  ← 目次を修正
commit jkl012  ← 初版作成
→ 履歴が一直線。いつでも過去に戻れる
```

### 1.2 Git の特徴

```
Git の特徴：
├── 分散型：各開発者がリポジトリの完全なコピーを持つ
├── 高速：ほとんどの操作がローカルで完結
├── ブランチ：軽量なブランチで並行開発が容易
├── 履歴管理：全ての変更履歴を追跡
└── デファクト：業界標準のバージョン管理システム
```

### 1.3 Git の3つの領域

```
┌─────────────────────────────────────────────┐
│                  ローカル                      │
│                                             │
│  ┌───────────┐  git add  ┌──────────┐  git commit  ┌────────────┐
│  │ 作業ディレクトリ│ ────────→│ステージング │ ──────────→ │ ローカル     │
│  │(Working Dir)│          │  エリア    │             │ リポジトリ   │
│  │            │          │(Staging)  │             │(.git)      │
│  │ ファイルを   │          │コミット対象 │             │変更履歴の    │
│  │ 編集する場所  │          │を選ぶ場所  │             │保存場所      │
│  └───────────┘          └──────────┘             └─────┬──────┘
│                                                       │
└───────────────────────────────────────────────────────┤
                                                        │ git push
                                                        ↓
                                              ┌────────────────┐
                                              │ リモートリポジトリ │
                                              │ (GitHub)        │
                                              └────────────────┘
```

---

## 2. 基本コマンド

### 2.1 初期設定

```bash
# ユーザー情報の設定（初回のみ）
git config --global user.name "田中太郎"
git config --global user.email "tanaka@example.com"

# 設定の確認
git config --list
```

### 2.2 リポジトリの作成・取得

```bash
# 新規リポジトリの作成
mkdir my-project
cd my-project
git init

# 既存のリポジトリをクローン
git clone https://github.com/username/repository.git
git clone https://github.com/username/repository.git my-folder  # フォルダ名指定
```

### 2.3 基本的なワークフロー

```bash
# 1. 状態の確認
git status

# 2. 変更をステージングに追加
git add ファイル名        # 特定のファイル
git add .              # 全ての変更ファイル
git add src/           # 特定のディレクトリ

# 3. コミット（変更を記録）
git commit -m "ログインフォームを追加"

# 4. 変更履歴の確認
git log                # 詳細表示
git log --oneline      # 1行表示
git log --graph        # グラフ表示
```

### 2.4 変更の確認・取り消し

```bash
# 変更内容の確認
git diff               # 作業ディレクトリの差分
git diff --staged      # ステージングエリアの差分

# 変更の取り消し
git checkout -- ファイル名              # ファイルの変更を元に戻す（Git 2.23未満）
git restore ファイル名                  # ファイルの変更を元に戻す（Git 2.23以降）
git restore --staged ファイル名         # ステージングから外す
git commit --amend -m "新しいメッセージ"  # 直前のコミットを修正
```

### 2.5 .gitignore

```bash
# .gitignore ファイル：Git で管理しないファイルを指定
# プロジェクトのルートに配置

# ビルド成果物
/target/
/build/
/dist/

# IDE 設定
.idea/
.vscode/
*.iml

# 依存関係
/node_modules/
/vendor/

# 環境変数（機密情報）
.env
.env.local

# OS 生成ファイル
.DS_Store
Thumbs.db

# ログファイル
*.log
```

---

## 3. リモートリポジトリ（GitHub）

### 3.1 GitHub の基本

```
GitHub = Git リポジトリのホスティングサービス

主な機能：
├── リモートリポジトリ：コードの保管・共有
├── Pull Request：コードレビューの仕組み
├── Issues：課題・バグの管理
├── Actions：CI/CD 自動化
├── Projects：プロジェクト管理（カンバンボード）
└── Wiki：ドキュメント管理
```

### 3.2 リモート操作

```bash
# リモートリポジトリの接続
git remote add origin https://github.com/username/my-project.git

# リモートの確認
git remote -v

# プッシュ（ローカル → リモート）
git push origin main               # main ブランチをプッシュ
git push -u origin main             # 上流ブランチを設定（初回）
git push                            # 上流ブランチ設定後は省略可

# プル（リモート → ローカル）
git pull origin main                # リモートの変更を取得＆マージ

# フェッチ（変更情報のみ取得、マージしない）
git fetch origin
```

```
push と pull の流れ：

┌───────────┐                    ┌──────────────────┐
│ ローカル    │  git push         │ GitHub（リモート）  │
│           │ ──────────────→   │                  │
│           │                   │                  │
│           │  git pull/fetch   │                  │
│           │ ←──────────────   │                  │
└───────────┘                   └──────────────────┘

    田中のPC                         共有リポジトリ
┌───────────┐   push   ┌──────────┐   pull  ┌───────────┐
│ 田中の      │ ──────→ │ GitHub   │ ←────── │ 佐藤の      │
│ ローカル    │         │          │  push   │ ローカル     │
│           │ ←────── │          │ ──────→ │            │
└───────────┘   pull   └──────────┘         └───────────┘
```

---

## 4. ブランチ

### 4.1 ブランチとは

```
ブランチ = 開発の流れを分岐させる仕組み

main ─────●────●────●────●───────●────→
                    │              ↑
                    │ ブランチ作成   │ マージ
                    ↓              │
feature ───────────●────●────●────┘
                   新機能の開発

→ main を壊さずに新機能を開発できる
→ 完成したらマージして統合する
```

### 4.2 ブランチ操作

```bash
# ブランチの一覧
git branch                     # ローカルブランチ
git branch -a                  # リモート含む全ブランチ

# ブランチの作成
git branch feature/login       # ブランチを作成
git switch feature/login       # ブランチに切り替え
git switch -c feature/login    # 作成と切り替えを同時に（推奨）

# ブランチの削除
git branch -d feature/login    # マージ済みブランチの削除
git branch -D feature/login    # 強制削除
```

### 4.3 マージ

```bash
# feature/login を main にマージする場合
git switch main                # main に切り替え
git merge feature/login        # マージ実行

# マージの種類
# ① Fast-forward マージ（main に変更がない場合）
main    ────●────●
                  ↘
feature           ●────●────●
                            ↓
main    ────●────●────●────●────●  ← そのまま進める

# ② 3-way マージ（main にも変更がある場合）
main    ────●────●────●────●
                  ↘           ↘
feature           ●────●────●──●（マージコミット）

# ③ コンフリクト（同じ箇所を変更した場合）
# → 手動で解決が必要
```

### 4.4 コンフリクトの解決

```bash
# コンフリクト発生時のファイル内容
<<<<<<< HEAD
// main ブランチの内容
function greet() {
    return "こんにちは";
}
=======
// feature ブランチの内容
function greet() {
    return "Hello";
}
>>>>>>> feature/login

# 解決方法：
# 1. コンフリクトマーカー（<<<, ===, >>>）を削除
# 2. 正しいコードに修正
# 3. git add → git commit

function greet() {
    return "こんにちは";  // ← どちらかを選ぶ or 両方活かす
}

git add src/greet.js
git commit -m "Merge feature/login: コンフリクト解決"
```

---

## 5. ブランチ戦略

### 5.1 GitHub Flow（推奨・シンプル）

```
GitHub Flow：シンプルで理解しやすい戦略

ルール：
├── main ブランチは常にデプロイ可能
├── 新しい作業は main からブランチを作成
├── ブランチにコミットしてプッシュ
├── Pull Request を作成
├── レビュー後にマージ
└── マージしたら即デプロイ

main ─────●────●──────────────●────●────→
               │              ↑
               └── feature ───┘
                   PR → レビュー → マージ

向いているプロジェクト：
├── Web アプリケーション
├── 継続的デリバリーを実施するプロジェクト
└── 小〜中規模のチーム
```

### 5.2 Git Flow（複雑だが本格的）

```
Git Flow：リリースサイクルが明確なプロジェクト向け

main     ────●──────────────────────────●────→  本番環境
              │                          ↑
develop  ────●────●────●────●────●────●──┤      開発用
              │        ↑    │        ↑   │
feature  ─────┴────●───┘    │        │   │      機能開発
                            │        │   │
release  ──────────────────┴────●───┘   │      リリース準備
                                        │
hotfix   ──────────────────────────────●┘      緊急修正

ブランチの役割：
├── main：本番環境のコード
├── develop：開発の統合ブランチ 
├── feature/*：新機能の開発
├── release/*：リリース準備（テスト・修正）
└── hotfix/*：本番の緊急バグ修正
```

### 5.3 トランクベース開発

```
トランクベース開発：短命ブランチで頻繁にマージ

main ─────●──●──●──●──●──●──●──●──●──→
           │  ↑  │  ↑     │  ↑
           └──┘  └──┘     └──┘
          短い     短い      短い
          ブランチ   ブランチ   ブランチ
         （1-2日）  （1-2日）  （1-2日）

特徴：
├── ブランチは1-2日で main にマージ
├── フィーチャーフラグで未完成機能を隠す
├── CI/CD が前提
└── 大規模チーム向け（Google, Facebook等）
```

### 5.4 ブランチ命名規則

```
ブランチ名の慣例：

feature/  ── 新機能
├── feature/login-form
├── feature/user-registration
└── feature/payment-integration

fix/      ── バグ修正
├── fix/login-error
├── fix/null-pointer
└── fix/typo-in-readme

hotfix/   ── 緊急修正
├── hotfix/security-vulnerability
└── hotfix/data-loss

chore/    ── 雑務（ライブラリ更新・設定変更等）
├── chore/update-dependencies
└── chore/add-ci-pipeline

docs/     ── ドキュメント
├── docs/api-documentation
└── docs/setup-guide
```

---

## 6. Pull Request（PR）とコードレビュー

### 6.1 Pull Request の流れ

```
① ブランチを作成して作業
   git switch -c feature/login-form

② コミットしてプッシュ
   git add .
   git commit -m "ログインフォームのUIを実装"
   git push origin feature/login-form

③ GitHub で Pull Request を作成
   ├── タイトル：ログインフォームの実装
   ├── 説明：何をしたか、なぜしたか
   ├── レビュアー：チームメンバーを指名
   └── ラベル：feature, frontend 等

④ コードレビュー
   ├── レビュアーがコードを確認
   ├── コメント・修正依頼
   └── 修正して再プッシュ

⑤ マージ
   ├── Approve をもらう
   ├── GitHub 上でマージボタンをクリック
   └── ブランチを削除
```

### 6.2 良い Pull Request の書き方

```markdown
## 概要
ログインフォームを実装しました。

## 変更内容
- ログインフォームのUIコンポーネントを作成
- バリデーション（メール形式、パスワード8文字以上）を追加
- ログインAPIとの連携を実装

## 関連Issue
- closes #42

## テスト方法
1. /login にアクセス
2. メールとパスワードを入力してログインボタンをクリック
3. 正常系：ダッシュボードにリダイレクトされること
4. 異常系：エラーメッセージが表示されること

## スクリーンショット
（UI変更がある場合）
```

### 6.3 コードレビューのポイント

```
レビュアーが確認すること：
├── 正確性：仕様通りに動作するか
├── 可読性：コードが読みやすいか
├── 保守性：変更しやすい設計か
├── テスト：テストは十分か
├── セキュリティ：脆弱性はないか
├── パフォーマンス：非効率な処理はないか
└── 命名：変数名・メソッド名は適切か

レビューのマナー：
├── ✅ 「ここはこうするとさらに良くなると思います」
├── ✅ 「このパターンだとXXの場合に問題が起きそうです」  
├── ✅ 具体的な改善案を提示する
├── ❌ 「これはダメ」（理由なし）
└── ❌ 人格への攻撃
```

---

## 7. よく使うコマンドまとめ

### 7.1 基本操作

```bash
# 初期化・クローン
git init
git clone <URL>

# 状態確認
git status
git log --oneline --graph
git diff

# ステージング・コミット
git add <ファイル>
git add .
git commit -m "メッセージ"

# リモート操作
git push origin <ブランチ>
git pull origin <ブランチ>
git fetch

# ブランチ操作
git branch
git switch -c <ブランチ名>
git switch <ブランチ名>
git merge <ブランチ名>
```

### 7.2 便利なコマンド

```bash
# 一時退避（作業中の変更を退避）
git stash              # 変更を退避
git stash list         # 退避リスト
git stash pop          # 最新の退避を復元
git stash drop         # 最新の退避を削除

# 特定のコミットを取り込む
git cherry-pick <コミットID>

# コミット履歴の整理（インタラクティブリベース）
git rebase -i HEAD~3   # 直近3コミットを整理

# 特定のファイルの変更履歴
git log --follow <ファイル>
git blame <ファイル>   # 行ごとの最終変更者
```

---

## 8. コミットメッセージの書き方

### 8.1 Conventional Commits

```
形式: <type>: <description>

type の種類：
├── feat:     新機能の追加
├── fix:      バグの修正
├── docs:     ドキュメントの変更
├── style:    コードの意味に影響しない変更（空白、フォーマット等）
├── refactor: リファクタリング（機能追加やバグ修正ではない）
├── test:     テストの追加・修正
├── chore:    ビルドプロセスや補助ツールの変更
└── ci:       CI設定の変更

例：
feat: ユーザー登録フォームを追加
fix: ログイン時のNullPointerExceptionを修正
docs: READMEにセットアップ手順を追加
refactor: UserServiceのメソッドを分割
test: UserControllerのユニットテストを追加
chore: Spring Bootを3.2.0にアップデート
```

---

## 📝 確認問題

1. Git の「作業ディレクトリ」「ステージングエリア」「リポジトリ」の役割を説明してください
2. `git pull` と `git fetch` の違いは何ですか？
3. コンフリクトが発生する条件と解決方法を説明してください
4. GitHub Flow のルールを3つ挙げてください
5. 良い Pull Request に含めるべき情報は何ですか？

---

## 📖 参考資料
- [Git 公式ドキュメント](https://git-scm.com/doc)
- [GitHub Docs](https://docs.github.com/ja)
- [サル先生の Git 入門](https://backlog.com/ja/git-tutorial/)
- [Conventional Commits](https://www.conventionalcommits.org/ja/)
