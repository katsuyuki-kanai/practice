# フレームワーク入門 第4回：Webアプリケーション開発

## 📚 この資料で学ぶこと
- Thymeleafテンプレートエンジン
- フォーム処理
- ToDoアプリの実装（総合演習）
- Spring Bootのテスト基礎

> ⏰ 想定時間：1時間（全4回中の第4回）

---

## 1. Thymeleaf テンプレートエンジン

### 1.1 Thymeleafとは

**Thymeleaf**は、Spring Bootで最も使われるHTMLテンプレートエンジンです。

```
Controller → データをセット → Thymeleaf → HTMLを生成 → ブラウザに返す
```

### 1.2 依存関係

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-thymeleaf</artifactId>
</dependency>
```

### 1.3 基本構文

```html
<!-- src/main/resources/templates/hello.html -->
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org">
<head>
    <meta charset="UTF-8">
    <title th:text="${title}">デフォルトタイトル</title>
</head>
<body>
    <!-- テキスト表示 -->
    <h1 th:text="${message}">デフォルトメッセージ</h1>
    
    <!-- 条件分岐 -->
    <p th:if="${isLoggedIn}">ログイン中です</p>
    <p th:unless="${isLoggedIn}">未ログインです</p>
    
    <!-- 繰り返し -->
    <ul>
        <li th:each="user : ${users}" th:text="${user.name}">名前</li>
    </ul>
    
    <!-- リンク -->
    <a th:href="@{/users/{id}(id=${user.id})}">詳細</a>
    
    <!-- 属性の設定 -->
    <input type="text" th:value="${name}" />
    <div th:class="${isActive} ? 'active' : 'inactive'">状態</div>
</body>
</html>
```

### 1.4 コントローラー（画面用）

```java
@Controller  // ※ @RestController ではなく @Controller を使う
public class PageController {
    
    @GetMapping("/hello")
    public String hello(Model model) {
        model.addAttribute("title", "Hello Page");
        model.addAttribute("message", "こんにちは！");
        model.addAttribute("isLoggedIn", true);
        
        List<User> users = List.of(
            new User("田中", "tanaka@example.com", 25),
            new User("佐藤", "sato@example.com", 30)
        );
        model.addAttribute("users", users);
        
        return "hello";  // → templates/hello.html を返す
    }
}
```

> 💡 `@Controller` はHTMLを返し、`@RestController` はJSON/テキストを返します

---

## 2. フォーム処理

### 2.1 フォームの作成

```html
<!-- templates/user/form.html -->
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org">
<head>
    <meta charset="UTF-8">
    <title>ユーザー登録</title>
</head>
<body>
    <h1>ユーザー登録</h1>
    
    <form th:action="@{/users}" th:object="${userForm}" method="post">
        <div>
            <label>名前：</label>
            <input type="text" th:field="*{name}" />
            <span th:if="${#fields.hasErrors('name')}" 
                  th:errors="*{name}" style="color: red;"></span>
        </div>
        <div>
            <label>メール：</label>
            <input type="email" th:field="*{email}" />
            <span th:if="${#fields.hasErrors('email')}" 
                  th:errors="*{email}" style="color: red;"></span>
        </div>
        <div>
            <label>年齢：</label>
            <input type="number" th:field="*{age}" />
        </div>
        <button type="submit">登録</button>
    </form>
</body>
</html>
```

### 2.2 フォーム用コントローラー

```java
@Controller
@RequestMapping("/users")
public class UserPageController {
    
    private final UserService userService;
    
    public UserPageController(UserService userService) {
        this.userService = userService;
    }
    
    // 一覧画面
    @GetMapping
    public String list(Model model) {
        model.addAttribute("users", userService.findAll());
        return "user/list";
    }
    
    // 登録フォーム表示
    @GetMapping("/new")
    public String newForm(Model model) {
        model.addAttribute("userForm", new UserForm());
        return "user/form";
    }
    
    // 登録処理
    @PostMapping
    public String create(@Valid @ModelAttribute("userForm") UserForm form,
                         BindingResult result) {
        if (result.hasErrors()) {
            return "user/form";  // バリデーションエラー → フォームに戻る
        }
        userService.create(form.toEntity());
        return "redirect:/users";  // 一覧にリダイレクト
    }
}
```

---

## 3. ToDoアプリの実装（総合演習）

これまで学んだ内容を使って、**ToDoアプリ**を作成しましょう。

### 3.1 プロジェクト構成

```
src/main/java/com/example/todo/
├── TodoApplication.java
├── entity/
│   └── Todo.java
├── repository/
│   └── TodoRepository.java
├── service/
│   └── TodoService.java
├── controller/
│   └── TodoController.java
└── form/
    └── TodoForm.java

src/main/resources/
├── templates/
│   └── todo/
│       ├── list.html
│       └── form.html
├── static/
│   └── css/
│       └── style.css
└── application.properties
```

### 3.2 エンティティ

```java
@Entity
@Table(name = "todos")
public class Todo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, length = 200)
    private String title;
    
    @Column(length = 1000)
    private String description;
    
    @Column(nullable = false)
    private boolean completed = false;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
    
    // コンストラクタ、getter/setter 省略
    public Todo() {}
    
    public Todo(String title, String description) {
        this.title = title;
        this.description = description;
    }
    
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public boolean isCompleted() { return completed; }
    public void setCompleted(boolean completed) { this.completed = completed; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
```

### 3.3 リポジトリ

```java
@Repository
public interface TodoRepository extends JpaRepository<Todo, Long> {
    List<Todo> findByCompletedOrderByCreatedAtDesc(boolean completed);
    List<Todo> findAllByOrderByCreatedAtDesc();
}
```

### 3.4 サービス

```java
@Service
@Transactional
public class TodoService {
    
    private final TodoRepository todoRepository;
    
    public TodoService(TodoRepository todoRepository) {
        this.todoRepository = todoRepository;
    }
    
    public List<Todo> findAll() {
        return todoRepository.findAllByOrderByCreatedAtDesc();
    }
    
    public Todo findById(Long id) {
        return todoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Todo not found: " + id));
    }
    
    public Todo create(String title, String description) {
        return todoRepository.save(new Todo(title, description));
    }
    
    public Todo toggleComplete(Long id) {
        Todo todo = findById(id);
        todo.setCompleted(!todo.isCompleted());
        return todoRepository.save(todo);
    }
    
    public void delete(Long id) {
        todoRepository.deleteById(id);
    }
}
```

### 3.5 フォームクラス

```java
public class TodoForm {
    @NotBlank(message = "タイトルは必須です")
    @Size(max = 200, message = "タイトルは200文字以内で入力してください")
    private String title;
    
    @Size(max = 1000, message = "説明は1000文字以内で入力してください")
    private String description;
    
    // getter/setter
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
```

### 3.6 コントローラー

```java
@Controller
@RequestMapping("/todos")
public class TodoController {
    
    private final TodoService todoService;
    
    public TodoController(TodoService todoService) {
        this.todoService = todoService;
    }
    
    // 一覧表示
    @GetMapping
    public String list(Model model) {
        model.addAttribute("todos", todoService.findAll());
        model.addAttribute("todoForm", new TodoForm());
        return "todo/list";
    }
    
    // 作成
    @PostMapping
    public String create(@Valid @ModelAttribute TodoForm form, 
                         BindingResult result, Model model) {
        if (result.hasErrors()) {
            model.addAttribute("todos", todoService.findAll());
            return "todo/list";
        }
        todoService.create(form.getTitle(), form.getDescription());
        return "redirect:/todos";
    }
    
    // 完了/未完了の切り替え
    @PostMapping("/{id}/toggle")
    public String toggle(@PathVariable Long id) {
        todoService.toggleComplete(id);
        return "redirect:/todos";
    }
    
    // 削除
    @PostMapping("/{id}/delete")
    public String delete(@PathVariable Long id) {
        todoService.delete(id);
        return "redirect:/todos";
    }
}
```

### 3.7 テンプレート（一覧画面）

```html
<!-- templates/todo/list.html -->
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org">
<head>
    <meta charset="UTF-8">
    <title>ToDo リスト</title>
    <link rel="stylesheet" th:href="@{/css/style.css}">
</head>
<body>
    <div class="container">
        <h1>📝 ToDo リスト</h1>
        
        <!-- 新規作成フォーム -->
        <form th:action="@{/todos}" th:object="${todoForm}" method="post" class="form">
            <div>
                <input type="text" th:field="*{title}" placeholder="やることを入力..." />
                <span th:if="${#fields.hasErrors('title')}" th:errors="*{title}" 
                      class="error"></span>
            </div>
            <div>
                <textarea th:field="*{description}" placeholder="詳細（任意）"></textarea>
            </div>
            <button type="submit">追加</button>
        </form>
        
        <!-- ToDo一覧 -->
        <div th:if="${#lists.isEmpty(todos)}">
            <p>まだToDoがありません。</p>
        </div>
        
        <ul class="todo-list">
            <li th:each="todo : ${todos}" 
                th:class="${todo.completed} ? 'completed' : ''">
                <div class="todo-content">
                    <strong th:text="${todo.title}"></strong>
                    <p th:text="${todo.description}" th:if="${todo.description}"></p>
                    <small th:text="${#temporals.format(todo.createdAt, 
                           'yyyy/MM/dd HH:mm')}"></small>
                </div>
                <div class="todo-actions">
                    <form th:action="@{/todos/{id}/toggle(id=${todo.id})}" 
                          method="post" style="display:inline">
                        <button type="submit" 
                                th:text="${todo.completed} ? '未完了に戻す' : '完了'">
                        </button>
                    </form>
                    <form th:action="@{/todos/{id}/delete(id=${todo.id})}" 
                          method="post" style="display:inline">
                        <button type="submit" class="btn-danger">削除</button>
                    </form>
                </div>
            </li>
        </ul>
    </div>
</body>
</html>
```

---

## 4. テストの基礎

### 4.1 ユニットテスト

```java
@SpringBootTest
class TodoServiceTest {
    
    @Autowired
    private TodoService todoService;
    
    @Test
    void ToDoを作成できる() {
        Todo todo = todoService.create("テスト", "テストの説明");
        
        assertNotNull(todo.getId());
        assertEquals("テスト", todo.getTitle());
        assertFalse(todo.isCompleted());
    }
    
    @Test
    void 完了状態を切り替えられる() {
        Todo todo = todoService.create("テスト", null);
        assertFalse(todo.isCompleted());
        
        Todo toggled = todoService.toggleComplete(todo.getId());
        assertTrue(toggled.isCompleted());
    }
}
```

### 4.2 APIテスト

```java
@SpringBootTest
@AutoConfigureMockMvc
class TodoControllerTest {
    
    @Autowired
    private MockMvc mockMvc;
    
    @Test
    void 一覧画面が表示される() throws Exception {
        mockMvc.perform(get("/todos"))
                .andExpect(status().isOk())
                .andExpect(view().name("todo/list"));
    }
}
```

---

## 📝 総合演習

### ToDoアプリを完成させよう
上記のコードを参考に、以下の機能を持つToDoアプリを完成させてください：

1. **基本CRUD**：作成、一覧表示、完了/未完了の切り替え、削除
2. **バリデーション**：タイトル必須、文字数制限
3. **スタイル**：CSSで見た目を整える
4. **追加機能（チャレンジ）**：
   - 優先度（高・中・低）の設定
   - 締切日の設定
   - カテゴリ別フィルタリング

---

## 📖 フレームワーク入門まとめ

```
全4回で学んだこと：
├── 第1回：Spring Boot 入門
│   フレームワークの基本、DI、アノテーション
├── 第2回：REST API 開発
│   CRUD API、バリデーション、エラーハンドリング
├── 第3回：データベース連携
│   JPA、エンティティ、リポジトリ
└── 第4回：Webアプリケーション開発 ← 今回
    Thymeleaf、フォーム、ToDoアプリ

次のステップ：
├── Spring Security（認証・認可）
├── Spring Data REST
├── マイクロサービスアーキテクチャ
└── Docker / Kubernetes でのデプロイ
```

---

## 📖 参考資料
- [Spring Boot 公式ドキュメント](https://spring.io/projects/spring-boot)
- [Spring Guides](https://spring.io/guides)
- [Thymeleaf 公式](https://www.thymeleaf.org/)
- [Baeldung - Spring Boot Tutorials](https://www.baeldung.com/spring-boot)
