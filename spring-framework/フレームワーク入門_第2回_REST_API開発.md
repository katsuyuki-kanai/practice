# フレームワーク入門 第2回：REST API開発

## 📚 この資料で学ぶこと
- RESTful API の設計原則
- リクエスト/レスポンスの処理
- JSON の扱い
- バリデーション
- エラーハンドリング

> ⏰ 想定時間：1時間（全4回中の第2回）

---

## 1. REST API の基本

### 1.1 RESTful API とは

**REST（Representational State Transfer）**は、Web APIの設計スタイルです。

```
RESTful API の原則：
├── リソース指向：URLはリソース（名詞）を表す
├── HTTPメソッド：操作はHTTPメソッドで表現
├── ステートレス：各リクエストは独立
└── 統一的なインターフェース：一貫した設計
```

### 1.2 HTTPメソッドとCRUD操作

| HTTPメソッド | CRUD操作 | URL例 | 説明 |
|-------------|---------|-------|------|
| `GET` | Read | `/api/users` | 全ユーザー取得 |
| `GET` | Read | `/api/users/1` | ID=1のユーザー取得 |
| `POST` | Create | `/api/users` | ユーザー作成 |
| `PUT` | Update | `/api/users/1` | ユーザー全体更新 |
| `PATCH` | Update | `/api/users/1` | ユーザー部分更新 |
| `DELETE` | Delete | `/api/users/1` | ユーザー削除 |

### 1.3 レスポンスのステータスコード

| コード | 意味 | 用途 |
|--------|------|------|
| `200 OK` | 成功 | GET, PUT, PATCH |
| `201 Created` | 作成成功 | POST |
| `204 No Content` | 成功（レスポンスなし） | DELETE |
| `400 Bad Request` | リクエスト不正 | バリデーションエラー |
| `404 Not Found` | リソースなし | 存在しないID |
| `500 Internal Server Error` | サーバーエラー | 予期しないエラー |

---

## 2. REST API の実装

### 2.1 DTO（Data Transfer Object）の定義

```java
package com.example.demo.dto;

// リクエスト/レスポンス用のデータクラス
public class UserDto {
    private Long id;
    private String name;
    private String email;
    private int age;
    
    // デフォルトコンストラクタ（JSON変換に必要）
    public UserDto() {}
    
    public UserDto(Long id, String name, String email, int age) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.age = age;
    }
    
    // getter / setter（省略せず全フィールド分用意する）
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public int getAge() { return age; }
    public void setAge(int age) { this.age = age; }
}
```

### 2.2 Service層の実装

```java
package com.example.demo.service;

import com.example.demo.dto.UserDto;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class UserService {
    
    // 簡易的にメモリ上でデータを管理（本来はDBを使う）
    private final Map<Long, UserDto> users = new HashMap<>();
    private long nextId = 1;
    
    // 初期データ
    public UserService() {
        create(new UserDto(null, "田中太郎", "tanaka@example.com", 25));
        create(new UserDto(null, "佐藤花子", "sato@example.com", 30));
    }
    
    // 全件取得
    public List<UserDto> findAll() {
        return new ArrayList<>(users.values());
    }
    
    // 1件取得
    public Optional<UserDto> findById(Long id) {
        return Optional.ofNullable(users.get(id));
    }
    
    // 作成
    public UserDto create(UserDto user) {
        user.setId(nextId++);
        users.put(user.getId(), user);
        return user;
    }
    
    // 更新
    public Optional<UserDto> update(Long id, UserDto user) {
        if (!users.containsKey(id)) {
            return Optional.empty();
        }
        user.setId(id);
        users.put(id, user);
        return Optional.of(user);
    }
    
    // 削除
    public boolean delete(Long id) {
        return users.remove(id) != null;
    }
}
```

### 2.3 Controller層の実装

```java
package com.example.demo.controller;

import com.example.demo.dto.UserDto;
import com.example.demo.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/users")  // ベースURL
public class UserController {
    
    private final UserService userService;
    
    public UserController(UserService userService) {
        this.userService = userService;
    }
    
    // GET /api/users - 全ユーザー取得
    @GetMapping
    public List<UserDto> getAllUsers() {
        return userService.findAll();
    }
    
    // GET /api/users/{id} - 1件取得
    @GetMapping("/{id}")
    public ResponseEntity<UserDto> getUserById(@PathVariable Long id) {
        return userService.findById(id)
                .map(ResponseEntity::ok)                        // 200 OK
                .orElse(ResponseEntity.notFound().build());     // 404 Not Found
    }
    
    // POST /api/users - 作成
    @PostMapping
    public ResponseEntity<UserDto> createUser(@RequestBody UserDto user) {
        UserDto created = userService.create(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);  // 201 Created
    }
    
    // PUT /api/users/{id} - 更新
    @PutMapping("/{id}")
    public ResponseEntity<UserDto> updateUser(@PathVariable Long id, 
                                               @RequestBody UserDto user) {
        return userService.update(id, user)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    // DELETE /api/users/{id} - 削除
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        if (userService.delete(id)) {
            return ResponseEntity.noContent().build();  // 204 No Content
        }
        return ResponseEntity.notFound().build();        // 404 Not Found
    }
}
```

### 2.4 動作確認（curlコマンド）

```bash
# 全ユーザー取得
curl http://localhost:8080/api/users

# 1件取得
curl http://localhost:8080/api/users/1

# ユーザー作成
curl -X POST http://localhost:8080/api/users \
  -H "Content-Type: application/json" \
  -d '{"name": "鈴木一郎", "email": "suzuki@example.com", "age": 28}'

# ユーザー更新
curl -X PUT http://localhost:8080/api/users/1 \
  -H "Content-Type: application/json" \
  -d '{"name": "田中太郎", "email": "tanaka@new.com", "age": 26}'

# ユーザー削除
curl -X DELETE http://localhost:8080/api/users/1
```

---

## 3. リクエストの受け取り方

### 3.1 パスパラメータ（@PathVariable）

```java
// /api/users/1
@GetMapping("/{id}")
public UserDto getUser(@PathVariable Long id) { ... }

// /api/users/1/orders/5
@GetMapping("/{userId}/orders/{orderId}")
public OrderDto getOrder(@PathVariable Long userId, 
                          @PathVariable Long orderId) { ... }
```

### 3.2 クエリパラメータ（@RequestParam）

```java
// /api/users?name=田中&age=25
@GetMapping
public List<UserDto> searchUsers(
        @RequestParam(required = false) String name,
        @RequestParam(defaultValue = "0") int age) {
    // ...
}

// /api/users?page=0&size=10&sort=name
@GetMapping
public List<UserDto> getUsers(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size,
        @RequestParam(defaultValue = "id") String sort) {
    // ...
}
```

### 3.3 リクエストボディ（@RequestBody）

```java
// POST /api/users
// Content-Type: application/json
// {"name": "田中", "email": "tanaka@example.com", "age": 25}

@PostMapping
public UserDto createUser(@RequestBody UserDto user) {
    return userService.create(user);
}
```

---

## 4. バリデーション

### 4.1 依存関係の追加

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-validation</artifactId>
</dependency>
```

### 4.2 バリデーションアノテーション

```java
import jakarta.validation.constraints.*;

public class UserCreateRequest {
    
    @NotBlank(message = "名前は必須です")
    @Size(max = 100, message = "名前は100文字以内で入力してください")
    private String name;
    
    @NotBlank(message = "メールアドレスは必須です")
    @Email(message = "正しいメールアドレス形式で入力してください")
    private String email;
    
    @Min(value = 0, message = "年齢は0以上で入力してください")
    @Max(value = 150, message = "年齢は150以下で入力してください")
    private int age;
    
    // getter / setter 省略
}
```

### 4.3 コントローラーでバリデーション適用

```java
@PostMapping
public ResponseEntity<UserDto> createUser(
        @Valid @RequestBody UserCreateRequest request) {  // @Valid で有効化
    UserDto user = userService.create(request);
    return ResponseEntity.status(HttpStatus.CREATED).body(user);
}
```

### 4.4 主なバリデーションアノテーション

| アノテーション | 説明 |
|-------------|------|
| `@NotNull` | nullでないこと |
| `@NotBlank` | null・空文字・空白でないこと |
| `@NotEmpty` | null・空でないこと |
| `@Size(min, max)` | 文字列・コレクションのサイズ |
| `@Min(value)` | 最小値 |
| `@Max(value)` | 最大値 |
| `@Email` | メールアドレス形式 |
| `@Pattern(regexp)` | 正規表現パターン |
| `@Past` / `@Future` | 過去の日付 / 未来の日付 |

---

## 5. エラーハンドリング

### 5.1 グローバルエラーハンドラー

```java
package com.example.demo.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import java.util.*;

@RestControllerAdvice  // 全コントローラーのエラーを捕捉
public class GlobalExceptionHandler {
    
    // バリデーションエラー
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(
            MethodArgumentNotValidException ex) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("status", 400);
        body.put("error", "Validation Error");
        
        List<String> errors = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(e -> e.getField() + ": " + e.getDefaultMessage())
                .toList();
        body.put("messages", errors);
        
        return ResponseEntity.badRequest().body(body);
    }
    
    // リソースが見つからない
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleNotFound(
            ResourceNotFoundException ex) {
        Map<String, Object> body = Map.of(
            "status", 404,
            "error", "Not Found",
            "message", ex.getMessage()
        );
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(body);
    }
    
    // その他のエラー
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGeneral(Exception ex) {
        Map<String, Object> body = Map.of(
            "status", 500,
            "error", "Internal Server Error",
            "message", "予期しないエラーが発生しました"
        );
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
    }
}
```

### 5.2 カスタム例外クラス

```java
package com.example.demo.exception;

public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String resource, Long id) {
        super(resource + " が見つかりません (ID: " + id + ")");
    }
}
```

### 5.3 エラーレスポンスの例

```json
// バリデーションエラー（400）
{
    "status": 400,
    "error": "Validation Error",
    "messages": [
        "name: 名前は必須です",
        "email: 正しいメールアドレス形式で入力してください"
    ]
}

// リソースが見つからない（404）
{
    "status": 404,
    "error": "Not Found",
    "message": "User が見つかりません (ID: 99)"
}
```

---

## 📝 練習問題

### 問題1：商品管理API
以下のCRUD APIを作成してください：
- `GET /api/products` - 全商品取得
- `GET /api/products/{id}` - 1件取得
- `POST /api/products` - 商品作成（name, price, category）
- `PUT /api/products/{id}` - 商品更新
- `DELETE /api/products/{id}` - 商品削除

### 問題2：バリデーション追加
商品作成APIに以下のバリデーションを追加してください：
- 商品名：必須、50文字以内
- 価格：0以上
- カテゴリ：必須

### 問題3：検索機能
商品をカテゴリや価格帯で検索できるAPIを追加してください：
- `GET /api/products?category=家電&minPrice=1000&maxPrice=50000`

---

## ▶ 次回予告
**第3回：データベース連携**
- Spring Data JPA
- エンティティの定義
- リポジトリの作成
- CRUD操作とデータベース
