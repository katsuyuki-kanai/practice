# フレームワーク入門 第1回：Spring Boot 入門

## 📚 この資料で学ぶこと
- フレームワークとは何か
- Spring / Spring Boot の概要
- プロジェクトの作成方法
- DI（依存性の注入）の基本
- はじめてのSpring Bootアプリケーション

> ⏰ 想定時間：1時間（全4回中の第1回）

---

## 1. フレームワークとは

### 1.1 フレームワークの定義

**フレームワーク**は、アプリケーション開発の**骨組み（枠組み）**を提供するソフトウェアです。

```
ライブラリ vs フレームワーク

ライブラリ：
  あなたのコード → ライブラリを呼び出す
  例：自分でケーキを作り、材料（ライブラリ）を使う

フレームワーク：
  フレームワーク → あなたのコードを呼び出す（制御の反転）
  例：ケーキ工場の製造ライン（フレームワーク）に従って作業する
```

### 1.2 フレームワークを使うメリット

| メリット | 説明 |
|---------|------|
| **開発効率の向上** | よくある処理が最初から用意されている |
| **品質の統一** | チーム開発でコードの書き方が揃う |
| **セキュリティ** | セキュリティ対策が組み込まれている |
| **保守性** | 構造が統一されており、保守しやすい |
| **エコシステム** | 豊富なプラグインやライブラリが利用可能 |

### 1.3 Javaの主要フレームワーク

| フレームワーク | 特徴 |
|-------------|------|
| **Spring Boot** | 最も人気。自動設定で簡単に始められる |
| Spring MVC | Webアプリ用（Spring Boot に含まれる） |
| Spring Security | 認証・認可 |
| MyBatis | SQLマッピング |
| Hibernate / JPA | ORM（Object-Relational Mapping） |

---

## 2. Spring Boot とは

### 2.1 Spring と Spring Boot の関係

```
Spring Framework（2003年〜）
├── 非常に多機能だが設定が複雑（XML地獄）
└── 学習コストが高い

    ↓ もっと簡単に使いたい！

Spring Boot（2014年〜）
├── Springの機能をそのまま使える
├── 自動設定（Auto-configuration）で設定不要
├── 内蔵サーバー（Tomcat）で即実行可能
└── スターター（依存関係の自動管理）
```

### 2.2 Spring Boot の特徴

```
Spring Boot のメリット：
├── 🚀 すぐに動く：設定ファイルほぼ不要
├── 📦 内蔵サーバー：Tomcatが組み込まれている
├── 🔧 自動設定：クラスパスの内容に応じて自動設定
├── 📋 スターター：spring-boot-starter-web で必要なものが全部入る
└── 🏥 Actuator：アプリの状態監視機能
```

---

## 3. プロジェクトの作成

### 3.1 Spring Initializr

[Spring Initializr](https://start.spring.io/) でプロジェクトを生成します。

```
設定値（推奨）：
├── Project: Maven（または Gradle）
├── Language: Java
├── Spring Boot: 3.x（最新安定版）
├── Group: com.example
├── Artifact: demo
├── Packaging: Jar
├── Java: 17
└── Dependencies:
    ├── Spring Web
    ├── Spring Boot DevTools
    └── Lombok（オプション）
```

### 3.2 プロジェクト構造

```
demo/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/example/demo/
│   │   │       └── DemoApplication.java    ← エントリーポイント
│   │   └── resources/
│   │       ├── application.properties       ← 設定ファイル
│   │       ├── static/                      ← 静的ファイル（CSS, JS）
│   │       └── templates/                   ← テンプレート（HTML）
│   └── test/
│       └── java/
│           └── com/example/demo/
│               └── DemoApplicationTests.java
├── pom.xml                                  ← Maven設定（依存関係）
└── README.md
```

### 3.3 pom.xml（Maven設定）

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project>
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.2.0</version>
    </parent>
    
    <groupId>com.example</groupId>
    <artifactId>demo</artifactId>
    <version>0.0.1-SNAPSHOT</version>
    
    <properties>
        <java.version>17</java.version>
    </properties>
    
    <dependencies>
        <!-- Web開発用スターター -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        
        <!-- 開発ツール（ホットリロード） -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-devtools</artifactId>
            <scope>runtime</scope>
        </dependency>
        
        <!-- テスト -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>
</project>
```

---

## 4. はじめてのSpring Bootアプリ

### 4.1 メインクラス

```java
package com.example.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication  // Spring Boot の起動アノテーション
public class DemoApplication {
    public static void main(String[] args) {
        SpringApplication.run(DemoApplication.class, args);
    }
}
```

### 4.2 最初のコントローラー

```java
package com.example.demo.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController  // このクラスはREST APIのコントローラー
public class HelloController {

    @GetMapping("/hello")  // GET /hello にマッピング
    public String hello() {
        return "Hello, Spring Boot!";
    }
    
    @GetMapping("/")
    public String home() {
        return "Welcome to Spring Boot Application!";
    }
}
```

### 4.3 起動と確認

```bash
# Maven で起動
./mvnw spring-boot:run

# または IDEからメインクラスを実行
```

```
ブラウザで確認：
http://localhost:8080/       → Welcome to Spring Boot Application!
http://localhost:8080/hello  → Hello, Spring Boot!
```

---

## 5. DI（依存性の注入）

### 5.1 DIとは

**DI（Dependency Injection：依存性の注入）**は、オブジェクト同士の依存関係をフレームワークが管理する仕組みです。

```
❌ DIなし（自分でオブジェクトを生成）
public class OrderService {
    private OrderRepository repository = new OrderRepository(); // 直接生成
    private EmailService emailService = new EmailService();      // 直接生成
}

問題点：
├── テストしにくい（モックに差し替えられない）
├── クラス同士が密結合
└── 変更の影響が大きい
```

```
✅ DIあり（フレームワークが注入）
public class OrderService {
    private final OrderRepository repository;  // フレームワークが注入
    private final EmailService emailService;    // フレームワークが注入
    
    public OrderService(OrderRepository repository, EmailService emailService) {
        this.repository = repository;
        this.emailService = emailService;
    }
}

メリット：
├── テストしやすい（モックを注入可能）
├── クラス同士が疎結合
└── 変更の影響が小さい
```

### 5.2 Spring の DI を使う

```java
// ① Serviceクラスを定義
@Service  // Spring が管理するコンポーネントとして登録
public class GreetingService {
    
    public String greet(String name) {
        return "こんにちは、" + name + "さん！";
    }
}
```

```java
// ② Controllerで利用（コンストラクタインジェクション）
@RestController
public class GreetingController {
    
    private final GreetingService greetingService;
    
    // コンストラクタで注入（推奨方法）
    public GreetingController(GreetingService greetingService) {
        this.greetingService = greetingService;
    }
    
    @GetMapping("/greet")
    public String greet(@RequestParam String name) {
        return greetingService.greet(name);
    }
}
```

```
GET /greet?name=田中
→ こんにちは、田中さん！
```

### 5.3 主要なアノテーション

| アノテーション | 用途 |
|-------------|------|
| `@SpringBootApplication` | メインクラスに付与。自動設定を有効化 |
| `@RestController` | REST APIコントローラー |
| `@Controller` | Webページ用コントローラー |
| `@Service` | ビジネスロジック層 |
| `@Repository` | データアクセス層 |
| `@Component` | 汎用的なコンポーネント |
| `@GetMapping` | HTTP GET リクエストのマッピング |
| `@PostMapping` | HTTP POST リクエストのマッピング |
| `@RequestParam` | クエリパラメータを受け取る |
| `@PathVariable` | URLパスの一部を受け取る |

### 5.4 アプリケーションの層構造

```
┌─────────────────────────────────────────┐
│           Controller 層                  │ ← リクエスト受付・レスポンス返却
│     @RestController / @Controller        │
├─────────────────────────────────────────┤
│           Service 層                     │ ← ビジネスロジック
│     @Service                            │
├─────────────────────────────────────────┤
│          Repository 層                   │ ← データアクセス
│     @Repository                         │
├─────────────────────────────────────────┤
│          データベース                     │
└─────────────────────────────────────────┘
```

---

## 6. 設定ファイル

### 6.1 application.properties

```properties
# サーバーポート
server.port=8080

# アプリケーション名
spring.application.name=demo

# ログレベル
logging.level.root=INFO
logging.level.com.example.demo=DEBUG
```

### 6.2 application.yml（YAML形式）

```yaml
server:
  port: 8080

spring:
  application:
    name: demo

logging:
  level:
    root: INFO
    com.example.demo: DEBUG
```

---

## 📝 練習問題

### 問題1：Spring Initializrでプロジェクト作成
Spring Initializrを使ってプロジェクトを作成し、起動してみましょう。

### 問題2：簡単なAPIの作成
以下のエンドポイントを持つコントローラーを作成してください：
- `GET /api/time` → 現在時刻を返す
- `GET /api/greet?name=xxx` → 「こんにちは、xxxさん」を返す
- `GET /api/calc?a=10&b=5&op=add` → 計算結果を返す

### 問題3：ServiceとControllerの分離
問題2の計算ロジックを`CalculatorService`クラスに分離してください。

---

## ▶ 次回予告
**第2回：REST API開発**
- RESTfulなAPI設計
- リクエスト/レスポンスの処理
- バリデーション
- エラーハンドリング
