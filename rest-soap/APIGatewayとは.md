# API Gatewayとは？役割とアーキテクチャ

## 目次
1. [API Gatewayとは](#api-gatewayとは)
2. [API Gatewayの主要な役割](#api-gatewayの主要な役割)
3. [アーキテクチャパターン](#アーキテクチャパターン)
4. [主要な機能の詳細](#主要な機能の詳細)
5. [代表的なAPI Gateway製品](#代表的なapi-gateway製品)
6. [実装例](#実装例)
7. [ベストプラクティス](#ベストプラクティス)

---

## API Gatewayとは

**API Gateway** は、クライアントとバックエンドサービス間の**単一のエントリーポイント**として機能するサーバーです。すべてのAPIリクエストを受け付け、適切なバックエンドサービスにルーティングします。

### 基本概念

```
┌─────────────┐
│  クライアント │
│ (Web/Mobile) │
└──────┬──────┘
       │
       ▼
┌──────────────────────────────────────┐
│           API Gateway                │
│  ・認証/認可  ・レート制限           │
│  ・ルーティング ・ロギング           │
│  ・キャッシュ  ・リクエスト変換      │
└──────────────────────────────────────┘
       │
       ├─────────────┬─────────────┐
       ▼             ▼             ▼
┌───────────┐ ┌───────────┐ ┌───────────┐
│ User      │ │ Order     │ │ Payment   │
│ Service   │ │ Service   │ │ Service   │
└───────────┘ └───────────┘ └───────────┘
```

### なぜAPI Gatewayが必要か

#### API Gatewayがない場合の問題

```
┌─────────────┐
│  クライアント │
└──────┬──────┘
       │
       ├── 認証処理（各サービスで実装）
       ├── レート制限（各サービスで実装）
       ├── ログ収集（各サービスで実装）
       │
       ├─────────────┬─────────────┐
       ▼             ▼             ▼
┌───────────┐ ┌───────────┐ ┌───────────┐
│ User      │ │ Order     │ │ Payment   │
│ Service   │ │ Service   │ │ Service   │
│ (認証実装) │ │ (認証実装) │ │ (認証実装) │
└───────────┘ └───────────┘ └───────────┘
```

**問題点**:
- 各サービスで認証ロジックの重複実装
- 横断的関心事（ログ、監視等）の分散
- クライアントが複数のエンドポイントを知る必要
- セキュリティポリシーの統一が困難

---

## API Gatewayの主要な役割

### 1. ルーティング (Routing)

リクエストを適切なバックエンドサービスに転送します。

```yaml
# ルーティング設定例
routes:
  - path: /api/users/*
    service: user-service
    port: 3001
    
  - path: /api/orders/*
    service: order-service
    port: 3002
    
  - path: /api/payments/*
    service: payment-service
    port: 3003
```

**リクエスト例**:
```http
GET /api/users/123
→ user-service:3001/users/123 にルーティング

POST /api/orders
→ order-service:3002/orders にルーティング
```

### 2. 認証・認可 (Authentication & Authorization)

すべてのリクエストに対して認証・認可を一元的に処理します。

```
クライアント → API Gateway → バックエンドサービス
              ここで認証チェック
```

**認証フロー**:
```javascript
// API Gatewayでの認証処理（疑似コード）
async function authenticate(request) {
  const token = request.headers['Authorization'];
  
  if (!token) {
    return { status: 401, message: 'Unauthorized' };
  }
  
  try {
    const decoded = await verifyJWT(token);
    request.user = decoded;
    return { status: 'OK', user: decoded };
  } catch (error) {
    return { status: 401, message: 'Invalid token' };
  }
}
```

### 3. レート制限 (Rate Limiting)

APIの過剰な呼び出しを防ぎ、システムを保護します。

```yaml
# レート制限設定例
rate_limiting:
  # IPアドレスごとの制限
  - type: ip
    requests: 100
    period: 1m  # 1分間に100リクエスト
    
  # ユーザーごとの制限
  - type: user
    requests: 1000
    period: 1h  # 1時間に1000リクエスト
    
  # プランごとの制限
  - type: plan
    free:
      requests: 100
      period: 1d
    premium:
      requests: 10000
      period: 1d
```

**レスポンス例（制限超過時）**:
```http
HTTP/1.1 429 Too Many Requests
Retry-After: 60
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1642683600

{
  "error": "Rate limit exceeded",
  "message": "リクエスト制限を超えました。60秒後に再試行してください。"
}
```

### 4. リクエスト/レスポンス変換 (Request/Response Transformation)

クライアントとバックエンド間のデータ形式を変換します。

```javascript
// リクエスト変換例
// クライアントからのリクエスト
{
  "user_name": "tanaka",  // スネークケース
  "email_address": "tanaka@example.com"
}

// バックエンドへ転送（キャメルケースに変換）
{
  "userName": "tanaka",
  "emailAddress": "tanaka@example.com"
}
```

**ヘッダー追加**:
```yaml
transform:
  request:
    headers:
      add:
        - X-Request-ID: ${uuid()}
        - X-Forwarded-For: ${client.ip}
        - X-Internal-Service: "true"
```

### 5. 負荷分散 (Load Balancing)

複数のサービスインスタンス間でリクエストを分散します。

```
                    ┌─────────────────┐
                    │   API Gateway   │
                    └────────┬────────┘
                             │
         ┌───────────────────┼───────────────────┐
         │                   │                   │
         ▼                   ▼                   ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ User Service    │ │ User Service    │ │ User Service    │
│ Instance 1      │ │ Instance 2      │ │ Instance 3      │
└─────────────────┘ └─────────────────┘ └─────────────────┘
```

**負荷分散アルゴリズム**:
- **ラウンドロビン**: 順番にリクエストを振り分け
- **最小接続数**: 接続数が少ないサーバーに振り分け
- **加重ラウンドロビン**: サーバー性能に応じた重み付け
- **IPハッシュ**: 同一クライアントを同一サーバーに

### 6. キャッシュ (Caching)

頻繁にアクセスされるレスポンスをキャッシュし、パフォーマンスを向上させます。

```yaml
caching:
  enabled: true
  
  rules:
    - path: /api/countries
      ttl: 86400  # 24時間
      
    - path: /api/products/*
      ttl: 3600   # 1時間
      vary:
        - Accept
        - Accept-Language
        
    - path: /api/users/*
      ttl: 0      # キャッシュしない
```

### 7. ロギング・監視 (Logging & Monitoring)

すべてのAPIトラフィックを記録し、監視します。

```json
{
  "timestamp": "2026-01-21T10:30:00.123Z",
  "request_id": "req-abc123",
  "method": "GET",
  "path": "/api/users/123",
  "status": 200,
  "latency_ms": 45,
  "client_ip": "192.168.1.100",
  "user_id": "user-456",
  "user_agent": "Mozilla/5.0...",
  "upstream_service": "user-service",
  "upstream_latency_ms": 32
}
```

### 8. サーキットブレーカー (Circuit Breaker)

バックエンドサービスの障害時にシステム全体を保護します。

```
正常時:
クライアント → API Gateway → バックエンドサービス
                          ↓
                     レスポンス返却

障害検知時:
クライアント → API Gateway ✕ バックエンドサービス（ダウン）
                   ↓
              即座にエラー返却（サーキットオープン）
```

**状態遷移**:
```
┌────────┐     失敗増加      ┌────────┐
│ Closed │ ───────────────→ │  Open  │
│ (正常) │                   │ (遮断) │
└────────┘                   └────────┘
    ↑                            │
    │        一定時間経過        ▼
    │                      ┌──────────┐
    └───────成功───────────│Half-Open│
                           │(テスト中)│
                           └──────────┘
```

---

## アーキテクチャパターン

### 1. 単一エントリーポイントパターン

最も基本的なパターン。すべてのリクエストが1つのAPI Gatewayを通過します。

```
                    ┌─────────────────┐
                    │   API Gateway   │
                    └────────┬────────┘
                             │
    ┌────────────────────────┼────────────────────────┐
    ▼                        ▼                        ▼
┌────────┐              ┌────────┐              ┌────────┐
│Service │              │Service │              │Service │
│   A    │              │   B    │              │   C    │
└────────┘              └────────┘              └────────┘
```

**メリット**:
- シンプルな構成
- 管理が容易

**デメリット**:
- 単一障害点になりうる
- スケーラビリティに制限

### 2. BFF（Backend for Frontend）パターン

クライアントの種類ごとに専用のAPI Gatewayを用意します。

```
┌───────────┐  ┌───────────┐  ┌───────────┐
│  Web App  │  │Mobile App │  │  IoT端末  │
└─────┬─────┘  └─────┬─────┘  └─────┬─────┘
      │              │              │
      ▼              ▼              ▼
┌───────────┐  ┌───────────┐  ┌───────────┐
│  Web BFF  │  │Mobile BFF │  │  IoT BFF  │
└─────┬─────┘  └─────┬─────┘  └─────┬─────┘
      │              │              │
      └──────────────┼──────────────┘
                     │
    ┌────────────────┼────────────────┐
    ▼                ▼                ▼
┌────────┐      ┌────────┐      ┌────────┐
│User Svc│      │Order Svc│     │Product │
└────────┘      └────────┘      │  Svc   │
                                └────────┘
```

**メリット**:
- クライアント固有の最適化が可能
- フロントエンドチームの独立性向上

**デメリット**:
- 管理するコンポーネントが増加
- 重複コードの可能性

### 3. マイクロゲートウェイパターン

サービスごとまたはドメインごとに小さなゲートウェイを配置します。

```
                    ┌─────────────────┐
                    │ Global Gateway  │
                    │ (認証・監視)    │
                    └────────┬────────┘
                             │
    ┌────────────────────────┼────────────────────────┐
    ▼                        ▼                        ▼
┌─────────────┐        ┌─────────────┐        ┌─────────────┐
│ User Domain │        │Order Domain │        │Product      │
│   Gateway   │        │   Gateway   │        │Domain GW    │
└──────┬──────┘        └──────┬──────┘        └──────┬──────┘
       │                      │                      │
   ┌───┴───┐              ┌───┴───┐              ┌───┴───┐
   ▼       ▼              ▼       ▼              ▼       ▼
┌─────┐ ┌─────┐      ┌─────┐ ┌─────┐      ┌─────┐ ┌─────┐
│User │ │Auth │      │Order│ │Cart │      │Prod │ │Inv  │
│ Svc │ │ Svc │      │ Svc │ │ Svc │      │ Svc │ │ Svc │
└─────┘ └─────┘      └─────┘ └─────┘      └─────┘ └─────┘
```

### 4. サービスメッシュとの組み合わせ

API Gatewayとサービスメッシュ（Istio等）を組み合わせたパターン。

```
┌─────────────────────────────────────────────────────────────┐
│                       Kubernetes Cluster                    │
│                                                             │
│  ┌──────────────┐                                          │
│  │ API Gateway  │ ← 外部トラフィック                        │
│  │(Ingress)     │                                          │
│  └──────┬───────┘                                          │
│         │                                                   │
│         ▼                                                   │
│  ┌────────────────────────────────────────────────────┐    │
│  │              Service Mesh (Istio/Linkerd)          │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌────────────┐ │    │
│  │  │ Pod + Sidecar│  │Pod + Sidecar│  │Pod + Sidecar│ │   │
│  │  │ ┌─────────┐ │  │ ┌─────────┐ │  │ ┌────────┐ │ │    │
│  │  │ │Envoy    │ │  │ │Envoy    │ │  │ │Envoy   │ │ │    │
│  │  │ │Proxy    │ │  │ │Proxy    │ │  │ │Proxy   │ │ │    │
│  │  │ └─────────┘ │  │ └─────────┘ │  │ └────────┘ │ │    │
│  │  │ ┌─────────┐ │  │ ┌─────────┐ │  │ ┌────────┐ │ │    │
│  │  │ │User Svc │ │  │ │Order Svc│ │  │ │Product │ │ │    │
│  │  │ └─────────┘ │  │ └─────────┘ │  │ │  Svc   │ │ │    │
│  │  └─────────────┘  └─────────────┘  │ └────────┘ │ │    │
│  │                                     └────────────┘ │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

**役割分担**:
- **API Gateway**: 外部トラフィックの入口、認証、レート制限
- **Service Mesh**: 内部サービス間通信、mTLS、観測可能性

---

## 主要な機能の詳細

### API Composition（APIの集約）

複数のマイクロサービスからデータを集約して、1つのレスポンスを返します。

```javascript
// 従来（クライアント側で複数API呼び出し）
const user = await fetch('/api/users/123');
const orders = await fetch('/api/users/123/orders');
const recommendations = await fetch('/api/users/123/recommendations');

// API Gatewayでの集約
// クライアントは1回の呼び出しで済む
GET /api/users/123/dashboard
```

**API Gateway側の実装**:
```javascript
// API Gatewayでの集約処理
app.get('/api/users/:id/dashboard', async (req, res) => {
  const userId = req.params.id;
  
  // 並列でバックエンドを呼び出し
  const [user, orders, recommendations] = await Promise.all([
    fetch(`http://user-service/users/${userId}`),
    fetch(`http://order-service/users/${userId}/orders`),
    fetch(`http://recommendation-service/users/${userId}/recommendations`)
  ]);
  
  // 集約してレスポンス
  res.json({
    user: await user.json(),
    recentOrders: await orders.json(),
    recommendations: await recommendations.json()
  });
});
```

### プロトコル変換

異なるプロトコル間の変換を行います。

```
┌─────────────┐
│  クライアント │
│ (REST/HTTP) │
└──────┬──────┘
       │ HTTP/REST
       ▼
┌─────────────────────────────────────┐
│           API Gateway               │
│  ┌──────────────────────────────┐  │
│  │    Protocol Translator       │  │
│  │  REST ↔ gRPC ↔ GraphQL ↔ SOAP │ │
│  └──────────────────────────────┘  │
└─────────────────────────────────────┘
       │            │            │
       │ gRPC       │ REST       │ SOAP
       ▼            ▼            ▼
┌───────────┐ ┌───────────┐ ┌───────────┐
│   gRPC    │ │   REST    │ │   SOAP    │
│  Service  │ │  Service  │ │  Service  │
└───────────┘ └───────────┘ └───────────┘
```

### API バージョニング

複数のAPIバージョンを同時にサポートします。

```yaml
versioning:
  strategies:
    - type: path
      pattern: /api/v{version}/*
      
    - type: header
      header: X-API-Version
      
    - type: query
      param: api_version

routes:
  - path: /api/v1/users/*
    service: user-service-v1
    
  - path: /api/v2/users/*
    service: user-service-v2
    
  - path: /api/users/*
    default_version: v2
```

---

## 代表的なAPI Gateway製品

### クラウドサービス

| サービス | 提供元 | 特徴 |
|---------|-------|------|
| **Amazon API Gateway** | AWS | Lambda統合、サーバーレス対応 |
| **Azure API Management** | Microsoft | 開発者ポータル、ポリシー管理 |
| **Google Cloud Endpoints** | Google | gRPC対応、OpenAPI統合 |
| **Apigee** | Google | 高度な分析、マネタイズ機能 |

### オープンソース

| 製品 | 特徴 | 言語 |
|------|------|------|
| **Kong** | プラグイン豊富、Kubernetes対応 | Lua/Go |
| **NGINX** | 高パフォーマンス、広く普及 | C |
| **Traefik** | 自動設定、コンテナネイティブ | Go |
| **Express Gateway** | Node.js開発者向け | JavaScript |
| **Spring Cloud Gateway** | Spring Boot統合 | Java |
| **APISIX** | 高パフォーマンス、動的設定 | Lua |

### 選定基準

```
┌────────────────────────────────────────────────────────────┐
│                    API Gateway 選定基準                    │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ● パフォーマンス要件                                      │
│    - 想定リクエスト数/秒                                   │
│    - レイテンシ要件                                        │
│                                                            │
│  ● 機能要件                                                │
│    - 認証方式（OAuth, JWT, SAML等）                        │
│    - プロトコルサポート（REST, gRPC, WebSocket等）         │
│    - 変換・集約機能                                        │
│                                                            │
│  ● 運用要件                                                │
│    - 管理UI/ダッシュボード                                 │
│    - 監視・ロギング統合                                    │
│    - 開発者ポータル                                        │
│                                                            │
│  ● インフラ要件                                            │
│    - クラウド/オンプレミス                                 │
│    - Kubernetes対応                                        │
│    - 高可用性構成                                          │
│                                                            │
│  ● コスト                                                  │
│    - ライセンス費用                                        │
│    - 運用コスト                                            │
│    - 学習コスト                                            │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

## 実装例

### AWS API Gateway + Lambda

```yaml
# serverless.yml
service: my-api

provider:
  name: aws
  runtime: nodejs18.x
  stage: ${opt:stage, 'dev'}
  region: ap-northeast-1

functions:
  getUser:
    handler: handlers/users.get
    events:
      - http:
          path: users/{id}
          method: get
          cors: true
          authorizer:
            name: jwtAuthorizer
            type: COGNITO_USER_POOLS
            arn: arn:aws:cognito-idp:ap-northeast-1:xxx:userpool/xxx
            
  createUser:
    handler: handlers/users.create
    events:
      - http:
          path: users
          method: post
          cors: true
          authorizer: jwtAuthorizer
```

### Kong設定例

```yaml
# kong.yml
_format_version: "3.0"

services:
  - name: user-service
    url: http://user-service:3000
    routes:
      - name: user-routes
        paths:
          - /api/users
        strip_path: false
    plugins:
      - name: jwt
        config:
          secret_is_base64: false
          
      - name: rate-limiting
        config:
          minute: 100
          policy: local
          
      - name: cors
        config:
          origins:
            - https://example.com
          methods:
            - GET
            - POST
            - PUT
            - DELETE
          headers:
            - Authorization
            - Content-Type
            
      - name: request-transformer
        config:
          add:
            headers:
              - X-Request-ID:$(uuid)
```

### Spring Cloud Gateway

```java
// application.yml
spring:
  cloud:
    gateway:
      routes:
        - id: user-service
          uri: lb://user-service
          predicates:
            - Path=/api/users/**
          filters:
            - StripPrefix=1
            - AddRequestHeader=X-Request-Source, api-gateway
            - name: CircuitBreaker
              args:
                name: userServiceCircuitBreaker
                fallbackUri: forward:/fallback/users
            - name: RequestRateLimiter
              args:
                redis-rate-limiter.replenishRate: 10
                redis-rate-limiter.burstCapacity: 20
                
        - id: order-service
          uri: lb://order-service
          predicates:
            - Path=/api/orders/**
          filters:
            - StripPrefix=1
            - name: Retry
              args:
                retries: 3
                statuses: BAD_GATEWAY
```

```java
// GatewayConfig.java
@Configuration
public class GatewayConfig {
    
    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
        return builder.routes()
            .route("user-service", r -> r
                .path("/api/users/**")
                .filters(f -> f
                    .stripPrefix(1)
                    .addRequestHeader("X-Gateway-Request-Id", UUID.randomUUID().toString())
                    .circuitBreaker(config -> config
                        .setName("userServiceCB")
                        .setFallbackUri("forward:/fallback"))
                    .requestRateLimiter(config -> config
                        .setRateLimiter(redisRateLimiter())))
                .uri("lb://user-service"))
            .build();
    }
    
    @Bean
    public GlobalFilter customGlobalFilter() {
        return (exchange, chain) -> {
            // 全リクエストに対するログ記録
            long startTime = System.currentTimeMillis();
            
            return chain.filter(exchange).then(Mono.fromRunnable(() -> {
                long duration = System.currentTimeMillis() - startTime;
                log.info("Request {} {} completed in {} ms",
                    exchange.getRequest().getMethod(),
                    exchange.getRequest().getPath(),
                    duration);
            }));
        };
    }
}
```

### Express Gateway（Node.js）

```yaml
# gateway.config.yml
http:
  port: 8080
  
admin:
  port: 9876
  host: localhost

apiEndpoints:
  users:
    host: '*'
    paths: '/api/users/*'
    
  orders:
    host: '*'
    paths: '/api/orders/*'

serviceEndpoints:
  userService:
    url: 'http://localhost:3001'
    
  orderService:
    url: 'http://localhost:3002'

policies:
  - jwt
  - rate-limit
  - cors
  - proxy

pipelines:
  userPipeline:
    apiEndpoints:
      - users
    policies:
      - jwt:
          action:
            secretOrPublicKey: ${JWT_SECRET}
            checkCredentialExistence: true
      - rate-limit:
          action:
            max: 100
            windowMs: 60000
      - cors:
          action:
            origin: 'https://example.com'
            methods: 'GET,POST,PUT,DELETE'
      - proxy:
          action:
            serviceEndpoint: userService
            changeOrigin: true
```

---

## ベストプラクティス

### 1. 高可用性の確保

```
                    ┌─────────────────┐
                    │  Load Balancer  │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
        ┌──────────┐   ┌──────────┐   ┌──────────┐
        │Gateway 1 │   │Gateway 2 │   │Gateway 3 │
        │(Active)  │   │(Active)  │   │(Active)  │
        └──────────┘   └──────────┘   └──────────┘
```

**ポイント**:
- 複数インスタンスでの冗長構成
- ヘルスチェックの設定
- 自動スケーリングの設定

### 2. セキュリティの強化

```yaml
security:
  # TLS/SSL設定
  tls:
    enabled: true
    min_version: TLSv1.2
    
  # CORS設定
  cors:
    allowed_origins:
      - https://app.example.com
    allowed_methods:
      - GET
      - POST
      - PUT
      - DELETE
    allowed_headers:
      - Authorization
      - Content-Type
    max_age: 86400
    
  # セキュリティヘッダー
  headers:
    - X-Content-Type-Options: nosniff
    - X-Frame-Options: DENY
    - X-XSS-Protection: 1; mode=block
    - Strict-Transport-Security: max-age=31536000
    
  # IP制限
  ip_whitelist:
    - 192.168.1.0/24
    - 10.0.0.0/8
```

### 3. 監視とアラート

```yaml
monitoring:
  metrics:
    - request_count
    - request_latency_ms
    - error_rate
    - active_connections
    - upstream_response_time
    
  alerts:
    - name: high_error_rate
      condition: error_rate > 5%
      duration: 5m
      severity: critical
      
    - name: high_latency
      condition: p99_latency > 1000ms
      duration: 10m
      severity: warning
      
    - name: circuit_breaker_open
      condition: circuit_state == "open"
      severity: critical
```

### 4. API Gatewayを薄く保つ

```
✅ API Gatewayで行うべきこと:
・認証/認可
・レート制限
・ルーティング
・ロギング
・プロトコル変換

❌ API Gatewayで行うべきでないこと:
・ビジネスロジック
・データベースアクセス
・複雑な計算処理
・状態の保持
```

### 5. 適切なタイムアウト設定

```yaml
timeouts:
  # クライアント側タイムアウト
  client:
    connect: 5s
    read: 30s
    write: 30s
    
  # バックエンド側タイムアウト
  upstream:
    connect: 3s
    read: 15s
    write: 15s
    
  # サービスごとの設定
  services:
    user-service:
      timeout: 5s
    report-service:
      timeout: 60s  # レポート生成は時間がかかる
```

---

## まとめ

### API Gatewayのチェックリスト

- [ ] 認証/認可の一元管理ができている
- [ ] レート制限が適切に設定されている
- [ ] ルーティング設定が正しい
- [ ] ログ・監視が設定されている
- [ ] 高可用性構成になっている
- [ ] セキュリティヘッダーが設定されている
- [ ] タイムアウトが適切に設定されている
- [ ] サーキットブレーカーが設定されている
- [ ] バージョニング戦略が明確である
- [ ] ドキュメントが整備されている

### 学習のポイント

1. **まずは基本的なルーティングから始める**
   - 認証、ログ、ルーティングの3つを理解する

2. **実際に手を動かして構築してみる**
   - Kong、Traefik等をローカルで試す

3. **マイクロサービスアーキテクチャと合わせて学ぶ**
   - API Gatewayはマイクロサービスの文脈で重要

4. **クラウドサービスの特徴を理解する**
   - AWS/Azure/GCPそれぞれの違いを把握

---

## 参考資料

- [Kong Documentation](https://docs.konghq.com/)
- [AWS API Gateway Developer Guide](https://docs.aws.amazon.com/apigateway/)
- [Spring Cloud Gateway Reference](https://docs.spring.io/spring-cloud-gateway/docs/current/reference/html/)
- [NGINX API Gateway](https://www.nginx.com/solutions/api-gateway/)
- [Microsoft - API Design Guidelines](https://docs.microsoft.com/en-us/azure/architecture/best-practices/api-design)
