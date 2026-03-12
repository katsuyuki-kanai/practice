# Java入門 第3回：オブジェクト指向の基礎

## 📚 この資料で学ぶこと
- クラスとオブジェクトの概念
- フィールドとメソッド
- コンストラクタ
- カプセル化（アクセス修飾子、getter/setter）
- 継承とポリモーフィズム

> ⏰ 想定時間：1時間（全4回中の第3回）

---

## 1. オブジェクト指向とは

### 1.1 考え方

**オブジェクト指向**は、現実世界の「モノ（オブジェクト）」をプログラムで表現する考え方です。

```
現実世界                    プログラムの世界
┌──────────┐               ┌──────────────┐
│  自動車    │               │ class Car     │
│          │               │              │
│ 特徴：    │     →         │ フィールド：    │
│  色       │               │  color       │
│  速度     │               │  speed       │
│          │               │              │
│ 動作：    │     →         │ メソッド：     │
│  走る     │               │  run()       │
│  止まる   │               │  stop()      │
└──────────┘               └──────────────┘
```

### 1.2 クラスとオブジェクトの関係

```
クラス = 設計図        オブジェクト = 実体（インスタンス）

  ┌──────────┐          ┌──────────┐
  │ Car      │          │ myCar    │
  │ (設計図)  │   生成→   │ 赤い車    │
  │          │   ──→    │ 速度: 60  │
  │ color    │   ──→    ├──────────┤
  │ speed    │          │ yourCar  │
  │ run()    │   生成→   │ 青い車    │
  │ stop()   │          │ 速度: 80  │
  └──────────┘          └──────────┘
  1つの設計図から        複数の実体を作れる
```

---

## 2. クラスの基本

### 2.1 クラスの定義

```java
// ファイル名: Car.java
public class Car {
    // フィールド（属性・データ）
    String color;
    int speed;
    String model;
    
    // メソッド（動作・振る舞い）
    void run() {
        speed = 60;
        System.out.println(model + "が走り始めました。速度: " + speed + "km/h");
    }
    
    void stop() {
        speed = 0;
        System.out.println(model + "が停止しました。");
    }
    
    void accelerate(int amount) {
        speed += amount;
        System.out.println("加速！現在の速度: " + speed + "km/h");
    }
}
```

### 2.2 オブジェクトの生成と利用

```java
public class Main {
    public static void main(String[] args) {
        // オブジェクトの生成（インスタンス化）
        Car myCar = new Car();
        myCar.color = "赤";
        myCar.model = "プリウス";
        
        Car yourCar = new Car();
        yourCar.color = "青";
        yourCar.model = "カローラ";
        
        // メソッドの呼び出し
        myCar.run();          // プリウスが走り始めました。速度: 60km/h
        myCar.accelerate(20); // 加速！現在の速度: 80km/h
        
        yourCar.run();        // カローラが走り始めました。速度: 60km/h
        yourCar.stop();       // カローラが停止しました。
    }
}
```

---

## 3. コンストラクタ

### 3.1 コンストラクタとは

**コンストラクタ**は、オブジェクト生成時に自動的に呼ばれる特別なメソッドです。

```java
public class User {
    String name;
    int age;
    
    // コンストラクタ（クラス名と同じ名前、戻り値なし）
    public User(String name, int age) {
        this.name = name;  // this = このオブジェクト自身
        this.age = age;
    }
    
    void introduce() {
        System.out.println("名前: " + name + ", 年齢: " + age + "歳");
    }
}
```

```java
// 使い方
User user1 = new User("田中太郎", 25);
User user2 = new User("佐藤花子", 30);

user1.introduce();  // 名前: 田中太郎, 年齢: 25歳
user2.introduce();  // 名前: 佐藤花子, 年齢: 30歳
```

### 3.2 コンストラクタのオーバーロード

```java
public class Product {
    String name;
    int price;
    String category;
    
    // 全引数コンストラクタ
    public Product(String name, int price, String category) {
        this.name = name;
        this.price = price;
        this.category = category;
    }
    
    // 引数2つのコンストラクタ
    public Product(String name, int price) {
        this(name, price, "未分類");  // 上のコンストラクタを呼ぶ
    }
    
    // デフォルトコンストラクタ
    public Product() {
        this("不明", 0, "未分類");
    }
}
```

```java
Product p1 = new Product("ノートPC", 80000, "家電");
Product p2 = new Product("ペン", 100);           // category="未分類"
Product p3 = new Product();                       // すべてデフォルト値
```

### 3.3 this キーワード

```java
public class Employee {
    String name;
    int salary;
    
    public Employee(String name, int salary) {
        this.name = name;      // this.name = フィールド
        this.salary = salary;  // name = 引数
    }
    
    // thisは「このオブジェクト自身」を指す
    void showInfo() {
        System.out.println(this.name + ": " + this.salary + "円");
    }
}
```

---

## 4. カプセル化

### 4.1 なぜカプセル化が必要か

```java
// ❌ カプセル化なし：外部から自由にアクセスできる
public class BankAccount {
    int balance = 10000;
}

BankAccount account = new BankAccount();
account.balance = -5000;  // マイナスに設定できてしまう！
```

### 4.2 アクセス修飾子

| 修飾子 | クラス内 | パッケージ内 | サブクラス | 全体 |
|--------|---------|------------|----------|------|
| `private` | ✅ | ❌ | ❌ | ❌ |
| なし（デフォルト） | ✅ | ✅ | ❌ | ❌ |
| `protected` | ✅ | ✅ | ✅ | ❌ |
| `public` | ✅ | ✅ | ✅ | ✅ |

### 4.3 getter / setter

```java
public class BankAccount {
    // フィールドをprivateにする
    private String owner;
    private int balance;
    
    public BankAccount(String owner, int initialBalance) {
        this.owner = owner;
        this.balance = initialBalance;
    }
    
    // getter：値を取得する
    public int getBalance() {
        return balance;
    }
    
    public String getOwner() {
        return owner;
    }
    
    // setter：値を設定する（バリデーション付き）
    public void setBalance(int balance) {
        if (balance < 0) {
            System.out.println("エラー：残高はマイナスにできません");
            return;
        }
        this.balance = balance;
    }
    
    // ビジネスロジックを含むメソッド
    public void deposit(int amount) {
        if (amount > 0) {
            balance += amount;
            System.out.println(amount + "円を入金しました。残高: " + balance + "円");
        }
    }
    
    public void withdraw(int amount) {
        if (amount > 0 && amount <= balance) {
            balance -= amount;
            System.out.println(amount + "円を出金しました。残高: " + balance + "円");
        } else {
            System.out.println("出金できません。残高不足です。");
        }
    }
}
```

```java
BankAccount account = new BankAccount("田中", 10000);

// account.balance = -5000;  // ❌ コンパイルエラー！
account.deposit(5000);       // ✅ 5000円を入金しました。残高: 15000円
account.withdraw(3000);      // ✅ 3000円を出金しました。残高: 12000円
account.withdraw(50000);     // ✅ 出金できません。残高不足です。
```

---

## 5. 継承

### 5.1 継承とは

**継承**により、既存のクラスの機能を受け継いで新しいクラスを作れます。

```
        ┌──────────┐
        │  Animal   │  ← 親クラス（スーパークラス）
        │  name     │
        │  eat()    │
        │  sleep()  │
        └─────┬────┘
              │ extends（継承）
      ┌───────┴───────┐
      ▼               ▼
┌──────────┐   ┌──────────┐
│   Dog    │   │   Cat    │  ← 子クラス（サブクラス）
│  bark()  │   │  meow()  │
└──────────┘   └──────────┘
  name, eat(), sleep() も使える
```

### 5.2 継承の実装

```java
// 親クラス
public class Animal {
    protected String name;
    protected int age;
    
    public Animal(String name, int age) {
        this.name = name;
        this.age = age;
    }
    
    public void eat() {
        System.out.println(name + "が食事をしています");
    }
    
    public void sleep() {
        System.out.println(name + "が眠っています");
    }
    
    public void showInfo() {
        System.out.println("名前: " + name + ", 年齢: " + age + "歳");
    }
}
```

```java
// 子クラス（Animalを継承）
public class Dog extends Animal {
    private String breed;  // 犬種（Dog固有のフィールド）
    
    public Dog(String name, int age, String breed) {
        super(name, age);  // 親クラスのコンストラクタを呼ぶ
        this.breed = breed;
    }
    
    // Dog固有のメソッド
    public void bark() {
        System.out.println(name + "「ワン！」");
    }
    
    // メソッドのオーバーライド（親クラスのメソッドを上書き）
    @Override
    public void showInfo() {
        super.showInfo();  // 親のshowInfo()を呼ぶ
        System.out.println("犬種: " + breed);
    }
}
```

```java
// 子クラス
public class Cat extends Animal {
    private boolean isIndoor;
    
    public Cat(String name, int age, boolean isIndoor) {
        super(name, age);
        this.isIndoor = isIndoor;
    }
    
    public void meow() {
        System.out.println(name + "「ニャー！」");
    }
    
    @Override
    public void showInfo() {
        super.showInfo();
        System.out.println(isIndoor ? "室内飼い" : "外飼い");
    }
}
```

```java
// 使い方
Dog dog = new Dog("ポチ", 3, "柴犬");
Cat cat = new Cat("タマ", 5, true);

dog.eat();       // ポチが食事をしています（親のメソッド）
dog.bark();      // ポチ「ワン！」（Dog固有）
dog.showInfo();  // 名前: ポチ, 年齢: 3歳 / 犬種: 柴犬（オーバーライド）

cat.eat();       // タマが食事をしています
cat.meow();      // タマ「ニャー！」
```

### 5.3 super キーワード

```java
// super の使い方
public class Dog extends Animal {
    public Dog(String name, int age, String breed) {
        super(name, age);  // 1. 親のコンストラクタを呼ぶ（必ず最初の行）
    }
    
    @Override
    public void showInfo() {
        super.showInfo();  // 2. 親のメソッドを呼ぶ
        // 追加の処理...
    }
}
```

---

## 6. ポリモーフィズム（多態性）

### 6.1 ポリモーフィズムとは

**同じ操作でも、オブジェクトの型によって異なる動作をする**仕組みです。

```java
// 親クラスの型で子クラスのオブジェクトを扱える
Animal animal1 = new Dog("ポチ", 3, "柴犬");
Animal animal2 = new Cat("タマ", 5, true);

// 同じshowInfo()メソッドでも、実際のオブジェクトに応じた動作をする
animal1.showInfo();  // Dog の showInfo() が呼ばれる
animal2.showInfo();  // Cat の showInfo() が呼ばれる
```

```java
// 配列で複数のオブジェクトをまとめて扱える
Animal[] animals = {
    new Dog("ポチ", 3, "柴犬"),
    new Cat("タマ", 5, true),
    new Dog("ハチ", 7, "秋田犬"),
    new Cat("ミケ", 2, false)
};

for (Animal animal : animals) {
    animal.eat();       // 全動物に対して同じ操作
    animal.showInfo();  // それぞれ異なる表示
    System.out.println("---");
}
```

### 6.2 instanceof 演算子

```java
for (Animal animal : animals) {
    if (animal instanceof Dog) {
        Dog dog = (Dog) animal;  // ダウンキャスト
        dog.bark();
    } else if (animal instanceof Cat) {
        Cat cat = (Cat) animal;
        cat.meow();
    }
}

// Java 16以降：パターンマッチング
for (Animal animal : animals) {
    if (animal instanceof Dog dog) {  // キャストも同時に行う
        dog.bark();
    } else if (animal instanceof Cat cat) {
        cat.meow();
    }
}
```

---

## 7. インターフェース

### 7.1 インターフェースとは

**インターフェース**はメソッドの「契約」を定義します。**「何ができるか」**を宣言しますが、**「どうやるか」**は実装クラスに任せます。

```java
// インターフェースの定義
public interface Printable {
    void print();  // 抽象メソッド（実装なし）
}

public interface Exportable {
    void exportToFile(String filename);
}
```

```java
// インターフェースの実装
public class Report implements Printable, Exportable {
    private String title;
    private String content;
    
    public Report(String title, String content) {
        this.title = title;
        this.content = content;
    }
    
    @Override
    public void print() {
        System.out.println("=== " + title + " ===");
        System.out.println(content);
    }
    
    @Override
    public void exportToFile(String filename) {
        System.out.println(title + " を " + filename + " に出力しました");
    }
}
```

### 7.2 インターフェースの利点

```java
// インターフェースの型で扱える
Printable doc1 = new Report("月次報告", "売上は順調です");
Printable doc2 = new Invoice("請求書", 100000);  // Invoiceも Printable を実装

// 異なるクラスでも同じ操作ができる
List<Printable> documents = List.of(doc1, doc2);
for (Printable doc : documents) {
    doc.print();  // それぞれの print() が呼ばれる
}
```

---

## 8. static メンバー

### 8.1 static フィールドとメソッド

```java
public class Counter {
    // staticフィールド：クラスに1つだけ（全インスタンスで共有）
    private static int count = 0;
    
    // インスタンスフィールド：各オブジェクトごとに持つ
    private String name;
    
    public Counter(String name) {
        this.name = name;
        count++;  // オブジェクト生成のたびにカウントアップ
    }
    
    // staticメソッド：インスタンスなしで呼べる
    public static int getCount() {
        return count;
    }
}
```

```java
System.out.println(Counter.getCount());  // 0
Counter c1 = new Counter("A");
Counter c2 = new Counter("B");
Counter c3 = new Counter("C");
System.out.println(Counter.getCount());  // 3
```

---

## 📝 練習問題

### 問題1：社員クラス
以下の仕様で`Employee`クラスを作成してください：
- フィールド：名前、部署、給与（すべてprivate）
- コンストラクタ：全フィールドを初期化
- getter/setter（給与のsetterには0以上のバリデーション）
- `showInfo()`メソッド：社員情報を表示

### 問題2：図形の継承
`Shape`クラスを親クラスとし、`Circle`と`Rectangle`クラスを作成してください。
- `Shape`：`getArea()`メソッド（面積を返す）
- `Circle`：半径を持ち、円の面積を計算
- `Rectangle`：幅と高さを持ち、長方形の面積を計算

### 問題3：インターフェースの活用
`Calculatable`インターフェース（`calculate()`メソッド）を定義し、
`Tax`（税金計算）と`Discount`（割引計算）クラスで実装してください。

---

## ▶ 次回予告
**第4回：例外処理とコレクション**
- try-catch-finally
- List, Map, Set
- ラムダ式入門
- Stream API入門
