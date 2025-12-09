# HTTPメソッド・ステータスコード・ヘッダーの理解
対象: 新人エンジニア（APIバックエンド担当）  
想定時間: 90分（講義30分 + デモ/ハンズオン40分 + Q&A20分）  

---

## 学習目標
- HTTPの基本的な動作と役割を理解する
- 主要なHTTPメソッドの意味・使い分け（安全性・冪等性を含む）を説明できる
- よく使うHTTPステータスコードを分類・意味と使いどころを説明できる
- 代表的なHTTPヘッダー（リクエスト/レスポンス）の役割・書き方・実務での使い方を理解する
- curl/Postmanでヘッダーやステータス挙動を確認できる
- キャッシュ、条件付きリクエスト（ETag/If-None-Match）、CORS、認証ヘッダーなど実運用に必要な知識を実践できる

---

## アジェンダ（セッションの流れ）
1. HTTPの役割とリクエスト/レスポンスのライフサイクル（5分）
2. HTTPメソッド（15分）
3. ステータスコード（15分）
4. 主要ヘッダー（20分）
5. デモ/ハンズオン（curlでの確認、ETag, CORS, 認証）（40分）
6. クイズ & Q&A（15分）

---

## 1. HTTPの基本
- HTTP = HyperText Transfer Protocol。クライアント（ブラウザやAPIクライアント）とサーバ間のリクエスト/レスポンスプロトコル。
- リクエストは「メソッド」「URI」「プロトコルバージョン」「ヘッダー」「ボディ」から構成される。
- サーバは「ステータスライン（HTTP/1.1 200 OK）」「ヘッダー」「ボディ」を返す。
- ステートレス: 各リクエストは独立。状態を保持するならクッキー・トークン・サーバ側セッションなどを用いる。

---

## 2. HTTPメソッド（意味・性質・使い分け）
注: RFCやRESTの設計原則に基づく実務的な運用を説明します。

- GET
  - 用途: リソースの取得
  - 安全（safe）: リソースの状態を変えない（副作用なしが期待される）
  - 冪等（idempotent）: 同じリクエストを何度送っても結果は同じ（概念上）
  - ボディ: 通常リクエストボディを使わない（サーバが無視することが多い）
  - キャッシュ可能: はい（Cache-Control, ETag など）
- HEAD
  - GETと同じだが、レスポンスボディを返さない。ヘッダー（メタ情報）だけが必要なときに使う
- POST
  - 用途: 新規作成、処理の実行。サーバ側の状態を変える（副作用あり）
  - 冪等性: いいえ（同一リクエストの複数回実行で複数作成される可能性）
  - ボディ: リクエストボディを持つ（例: JSON）
- PUT
  - 用途: リソースの完全更新（指定したURIにリソースを置き換える）
  - 冪等: はい（同じPUTを繰り返しても結果は変わらない）
  - 新規作成にも使える（クライアントがURIを決める場合）
- PATCH
  - 用途: リソースの部分更新（差分/パッチを適用）
  - 冪等: 実装次第（JSON Patch等で冪等にする設計がある）
- DELETE
  - 用途: リソースの削除
  - 冪等: はい（既に削除済みでも同じ結果）
- OPTIONS
  - 用途: サーバがサポートするメソッドやCORSプリフライトに使用
- TRACE / CONNECT
  - TRACE: ループバック診断用（セキュリティ上制限されることが多い）
  - CONNECT: HTTPトンネリング（例: HTTPSプロキシ）

実務的なルール（推奨）
- 取得: GET、作成: POST、完全更新: PUT、部分更新: PATCH、削除: DELETE
- リソース設計: URIは名詞（/users/123）、動詞は使わない（/createUser は避ける）
- マイグレーションや非標準操作は POST /resources/123/actions/restart などで扱うこともある

---

## 3. HTTPステータスコード（分類と代表例）
大分類:
- 1xx（情報）: 一時的な情報（ほとんど使わない）
- 2xx（成功）: リクエスト成功
- 3xx（リダイレクト）: クライアントは追加操作を行う必要がある
- 4xx（クライアントエラー）: リクエストが不正
- 5xx（サーバエラー）: サーバ内部のエラー

代表的なコードと使用例:
- 200 OK
  - GET成功、または一般的成功
- 201 Created
  - リソース作成成功。Locationヘッダーで新リソースURIを返す
- 202 Accepted
  - リクエストを受理したが処理は非同期で完了していない
- 204 No Content
  - 成功したがレスポンスボディ無し（DELETE成功等）
- 301 Moved Permanently / 302 Found / 307 / 308
  - リダイレクト。POST時の挙動を確実にするには307/308を使う
- 400 Bad Request
  - リクエスト構文が不正、バリデーションエラー
- 401 Unauthorized
  - 認証が必要または失敗（Unauthorizedだが「認証」意味）
- 403 Forbidden
  - 認証済みでも権限がない（アクセス禁止）
- 404 Not Found
  - リソースが存在しない
- 405 Method Not Allowed
  - 指定メソッドが許可されていない（Allowヘッダーで許可メソッドを返す）
- 409 Conflict
  - 競合、重複
- 410 Gone
  - 永続的に削除済み
- 422 Unprocessable Entity
  - リクエストは文法的に正しいが意味的に処理できない（バリデーション詳細）
- 429 Too Many Requests
  - レート制限に引っかかった
- 500 Internal Server Error
  - 汎用サーバエラー
- 502 Bad Gateway / 503 Service Unavailable / 504 Gateway Timeout
  - サービス間やバックエンドの問題、メンテ中、タイムアウト

実務的注意点:
- エラー時はステータスコードに加え、機械可読なエラーボディ（例: problem+json）を返す
- 4xx と 5xx の分け方を明確に（クライアント側の検証で防げるものは4xx）
- 非同期処理は 202 を使い、Location や operation-status の追跡APIを提供する

エラー応答フォーマット例（RFC 7807 - problem+json 推奨）:
```json
{
  "type": "https://example.com/probs/out-of-credit",
  "title": "You do not have enough credit.",
  "status": 403,
  "detail": "Your current balance is 30, but that costs 50.",
  "instance": "/account/12345/transactions/abc"
}
```

---

## 4. HTTPヘッダー（カテゴリと代表例）
ヘッダーは「一般ヘッダー」「リクエストヘッダー」「レスポンスヘッダー」「エンティティヘッダー」に分けられる（実務では用途別で覚える）。

重要なリクエストヘッダー（説明と使用例）
- Accept: クライアントが受け取り可能なメディアタイプ
  - Accept: application/json
- Content-Type: リクエストボディのメディアタイプ
  - Content-Type: application/json; charset=utf-8
- Authorization: 認証情報（Bearer トークン、Basic）
  - Authorization: Bearer <token>
- Accept-Encoding: gzip, deflate（圧縮指定）
- If-None-Match / If-Match: 条件付きリクエスト（ETagによるキャッシュ/楽観ロック）
  - If-None-Match: "abc123"
- Range: 部分取得（バイトレンジ）
  - Range: bytes=0-1023
- Origin: CORSプリフライト時にブラウザが設定
- Referer: リファラ情報（セキュリティ用に注意）

重要なレスポンスヘッダー
- Content-Type: レスポンスのメディアタイプ
- Content-Length: ボディ長（圧縮状態では注意）
- Location: 201 Created 時に新規リソースのURIを返す、リダイレクト時にも使用
- Cache-Control: キャッシュ制御 (no-cache, no-store, max-age=...)
- ETag: エンティティタグ。キャッシュや条件付きリクエストに使用
- Last-Modified: 最終更新日時（If-Modified-Since と組み合わせ）
- Vary: コンテンツネゴシエーション時にキャッシュ分岐キーを指定（例: Vary: Accept-Encoding）
- Retry-After: 503 などで再試行までの待機時間を示す
- Link: ページネーション（rel="next"）などに使用
- Set-Cookie: クッキーの設定
- WWW-Authenticate: 401 応答で認証方式を示す

CORS（Cross-Origin Resource Sharing）関連
- Access-Control-Allow-Origin: ホストの許可
- Access-Control-Allow-Methods: 許可メソッド（プリフライト応答）
- Access-Control-Allow-Headers: 許可ヘッダー
- Access-Control-Expose-Headers: ブラウザがアクセス可能にするレスポンスヘッダー
- Access-Control-Allow-Credentials: クッキー/認証情報を許可するか

セキュリティ関連ヘッダー（推奨）
- Strict-Transport-Security (HSTS)
- Content-Security-Policy (CSP)
- X-Frame-Options (クリックジャッキング防止)
- X-Content-Type-Options: nosniff
- Referrer-Policy

実務的注意点:
- コンテンツネゴシエーション: Accept と Content-Type を正しく扱う
- キャッシュ設定はAPIの性質に合わせる（ユーザ固有データはキャッシュしない）
- ETag を使うと帯域と負荷を減らせるが、厳密なETag設計（強い/弱い）を検討する
- CORSはブラウザが適用する仕様でサーバ側は適切にヘッダーを返す必要がある

---

## 5. 実践例とcurlコマンド
GETの例:
```bash
curl -i https://api.example.com/users/123
```
レスポンス（例）
```
HTTP/1.1 200 OK
Content-Type: application/json
ETag: "abc123"
Cache-Control: max-age=60

{"id":123,"name":"Alice"}
```

POSTで作成:
```bash
curl -i -X POST https://api.example.com/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Bob","email":"bob@example.com"}'
```
レスポンス（例）
```
HTTP/1.1 201 Created
Location: /users/456
Content-Type: application/json

{"id":456,"name":"Bob"}
```

条件付きリクエスト（ETag利用）
```bash
# まずGETでETagを取得
curl -i https://api.example.com/users/123

# If-None-Matchを使ったキャッシュ確認
curl -i -H 'If-None-Match: "abc123"' https://api.example.com/users/123
# サーバが変更なければ 304 Not Modified が返る
```

CORSプリフライト（ブラウザが送るOPTIONS）
```bash
curl -i -X OPTIONS https://api.example.com/resource \
  -H "Origin: https://app.example.com" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type, Authorization"
```

認証ヘッダー（Bearer）
```bash
curl -i -H "Authorization: Bearer <token>" https://api.example.com/secure
```

エラー応答例（JSON）
```json
HTTP/1.1 400 Bad Request
Content-Type: application/problem+json

{
  "type": "https://example.com/probs/invalid-params",
  "title": "Invalid parameters",
  "status": 400,
  "detail": "The 'email' field must be a valid email address."
}
```

---

## 6. ハンズオン課題（推奨）
1. 基本確認（15分）
   - curlでGET/POST/PUT/DELETEを実行して、ステータスコードとヘッダーを確認する
   - 例: JSONPlaceholder（https://jsonplaceholder.typicode.com）を利用
2. ETagキャッシュ（15分）
   - ローカルに簡単なAPIを立てる（Express / Flask / FastAPI 等）
   - 生成したリソースに ETag をつけ、If-None-Match を送って 304 を受け取る動作を確認
3. CORSプリフライト（10分）
   - ブラウザの挙動を確認（簡単なHTMLでfetchを実行）
   - サーバ側で Access-Control-Allow-Origin と Access-Control-Allow-Headers を設定し、ブラウザで成功/失敗を確認
4. 認証（10分）
   - Bearerトークンで簡易保護されたエンドポイントを作り、認証なしだと401、トークンありだと200を返す

---

## 7. 設計上のベストプラクティス（まとめ）
- メソッドを正しく使う（RESTの原則に沿う）
- ステータスコードは意味に合ったものを返す（クライアントが適切に分岐できるように）
- エラーは標準化したJSON形式（problem+json 等）で返す
- キャッシュと条件付きリクエストを活用し、パフォーマンスを改善する
- ヘッダーでAPIのバージョン管理や条件分岐をシンプルにする（ただしURIによるバージョン管理も検討）
- CORS設定は最小権限で許可する（ワイルドカードは必要最小限に）
- セキュリティヘッダーを設定して攻撃面を減らす
- APIドキュメント（OpenAPI）にメソッド・ステータス・ヘッダーの仕様を明記する

---

## 8. よくある間違い / トラブルシューティング
- GETで副作用を起こす（ログ以外の状態変更は避ける）
- 201を返すが Location を返していない
- エラーレスポンスが HTML やテキストで返る（APIクライアントはJSONを期待）
- ETagをつけているが正しく更新していない（古いキャッシュを返す）
- CORSエラーをブラウザのエラーとして表示してサーバ側ログを見ない
- 403 と 401 の混同（401 は認証、403 は認可）
- レート制限時に Retry-After を返さない（クライアントのリトライが難しくなる）

---

## 9. クイズ（理解度チェック）
1. GETは「安全」か？「冪等」か？（答え: 安全・冪等）
2. POST と PUT の主な違いは？（答え: POST は主に作成/処理、冪等でない。PUT はリソースの完全置換、冪等）
3. 201 Created を返すときに返すべき重要なヘッダーは？（答え: Location）
4. 304 Not Modified は何を意味する？（答え: クライアントのキャッシュが最新なのでボディは返さない）
5. If-None-Match と If-Match の違いは？（答え: If-None-Match は「キャッシュが最新なら変更なし(条件付きGET)」に使う。If-Match は「条件付き更新(楽観ロック)」に使う）
6. CORSプリフライト時にサーバが返すべきヘッダーは？（答え: Access-Control-Allow-Origin, Access-Control-Allow-Methods, Access-Control-Allow-Headers 等）
7. 401 と 403 の違いは？（答え: 401 は未認証/認証失敗、403 は認証済みでも権限なし）

（解答は上に記載のとおり。セッションで解説を行う）

---

## 10. チートシート（短縮版）
- 主なメソッド: GET/POST/PUT/PATCH/DELETE/HEAD/OPTIONS
- よく使うステータス: 200, 201, 202, 204, 301, 302, 400, 401, 403, 404, 405, 409, 422, 429, 500, 503
- 代表的ヘッダー:
  - リクエスト: Authorization, Content-Type, Accept, If-None-Match, Range, Origin
  - レスポンス: Content-Type, Location, ETag, Cache-Control, Vary, Set-Cookie, WWW-Authenticate
- CORS: Access-Control-Allow-Origin / Methods / Headers / Credentials
- キャッシュ: ETag + If-None-Match、Cache-Control（no-store/no-cache/max-age）

---

## 11. 参考資料・リンク
- RFC 7231 (HTTP/1.1 Semantics and Content)
- RFC 7232 (Conditional Requests)
- RFC 7235 (Authentication)
- RFC 7807 (Problem Details for HTTP APIs)
- MDN Web Docs: HTTP (https://developer.mozilla.org/en-US/docs/Web/HTTP)
- OWASP API Security Project

---

必要なら：
- スライド（20〜30枚）を作成します（講義用スライド + 図とcurlサンプル）
- ハンズオン用のサンプルリポジトリ（Express/FastAPI）を用意します
- 各項目ごとにスライド/演習の詳細な手順書を作ります

どれを次に用意しましょうか？（スライド / サンプルコード / ハンズオン手順書 / クイズの自動化など）