# Java入門 第4回：例外処理とコレクション

## 📚 この資料で学ぶこと
- 例外処理（try-catch-finally）
- 例外の種類と使い分け
- コレクションフレームワーク（List, Map, Set）
- ラムダ式の基本
- Stream API入門

> ⏰ 想定時間：1時間（全4回中の第4回）

---

## 1. 例外処理

### 1.1 例外とは

**例外（Exception）**は、プログラム実行中に発生する予期しないエラーのことです。

```java
// 例外が発生する例
int[] numbers = {1, 2, 3};
System.out.println(numbers[5]);  // ArrayIndexOutOfBoundsException

String str = null;
System.out.println(str.length());  // NullPointerException

int result = 10 / 0;  // ArithmeticException
```

### 1.2 try-catch

```java
try {
    // 例外が発生する可能性のある処理
    int result = 10 / 0;
    System.out.println(result);
} catch (ArithmeticException e) {
    // 例外が発生した場合の処理
    System.out.println("エラー：0で割ることはできません");
    System.out.println("詳細: " + e.getMessage());
}

System.out.println("プログラムは続行します");
```

### 1.3 複数のcatch

```java
try {
    String[] names = {"田中", "佐藤"};
    String input = "abc";
    int index = Integer.parseInt(input);  // NumberFormatException
    System.out.println(names[index]);     // ArrayIndexOutOfBoundsException
} catch (NumberFormatException e) {
    System.out.println("数値に変換できません: " + e.getMessage());
} catch (ArrayIndexOutOfBoundsException e) {
    System.out.println("配列の範囲外です: " + e.getMessage());
} catch (Exception e) {
    // 上で捕捉できなかったすべての例外
    System.out.println("予期しないエラー: " + e.getMessage());
}
```

### 1.4 finally

**finally**ブロックは、例外の有無にかかわらず**必ず実行**されます。

```java
Scanner scanner = null;
try {
    scanner = new Scanner(new File("data.txt"));
    // ファイル読み込み処理...
} catch (FileNotFoundException e) {
    System.out.println("ファイルが見つかりません");
} finally {
    // リソースの解放（必ず実行される）
    if (scanner != null) {
        scanner.close();
    }
}
```

### 1.5 try-with-resources（推奨）

```java
// リソースを自動的に閉じてくれる（Java 7以降）
try (Scanner scanner = new Scanner(new File("data.txt"))) {
    while (scanner.hasNextLine()) {
        System.out.println(scanner.nextLine());
    }
} catch (FileNotFoundException e) {
    System.out.println("ファイルが見つかりません");
}
// scanner は自動的に close される
```

### 1.6 例外の種類

```
               Throwable
              ┌────┴────┐
           Error      Exception
        (回復不能)      ┌────┴────┐
                       │         │
              検査例外           RuntimeException
         (コンパイル時に        (非検査例外 - 実行時)
          チェックされる)
          
例：                    例：
IOException            NullPointerException
SQLException           ArrayIndexOutOfBoundsException
FileNotFoundException  NumberFormatException
                      IllegalArgumentException
```

| 種類 | 特徴 | 対処 |
|------|------|------|
| **検査例外** | コンパイル時にチェック | try-catchまたはthrowsが必須 |
| **非検査例外** | 実行時に発生 | try-catchは任意（バグが原因が多い） |
| **Error** | 深刻なエラー | 通常はcatchしない |

### 1.7 throws と throw

```java
// throws：このメソッドは例外を投げる可能性があると宣言
public void readFile(String path) throws IOException {
    BufferedReader reader = new BufferedReader(new FileReader(path));
    // ...
}

// throw：例外を自分で投げる
public void setAge(int age) {
    if (age < 0) {
        throw new IllegalArgumentException("年齢は0以上である必要があります");
    }
    this.age = age;
}
```

### 1.8 独自例外クラス

```java
// 独自の例外クラスを定義
public class InsufficientBalanceException extends Exception {
    private int balance;
    private int amount;
    
    public InsufficientBalanceException(int balance, int amount) {
        super("残高不足です。残高: " + balance + "円, 要求額: " + amount + "円");
        this.balance = balance;
        this.amount = amount;
    }
}

// 使い方
public void withdraw(int amount) throws InsufficientBalanceException {
    if (amount > balance) {
        throw new InsufficientBalanceException(balance, amount);
    }
    balance -= amount;
}
```

---

## 2. コレクションフレームワーク

### 2.1 コレクションとは

配列の代わりに使える**柔軟なデータ構造**です。

```
配列 vs コレクション

配列：
├── サイズが固定
├── プリミティブ型を直接格納可能
└── 基本的な機能のみ

コレクション：
├── サイズが可変（自動拡張）
├── 参照型のみ格納（ラッパークラスを使用）
├── 検索、ソート、追加、削除が簡単
└── 豊富なメソッド群
```

```
主なコレクション：
┌─────────────────────────┐
│     Collection          │
│  ┌──────┐  ┌──────┐    │
│  │ List │  │ Set  │    │    ┌──────┐
│  │ 順序  │  │ 重複  │    │    │ Map  │
│  │ あり  │  │ なし  │    │    │ Key  │
│  │ 重複  │  │      │    │    │  ↓   │
│  │ あり  │  │      │    │    │Value │
│  └──────┘  └──────┘    │    └──────┘
└─────────────────────────┘
```

### 2.2 List（リスト）

**順序あり・重複あり**のコレクションです。

```java
import java.util.ArrayList;
import java.util.List;

public class ListExample {
    public static void main(String[] args) {
        // Listの作成
        List<String> fruits = new ArrayList<>();
        
        // 要素の追加
        fruits.add("りんご");
        fruits.add("バナナ");
        fruits.add("みかん");
        fruits.add("りんご");  // 重複OK
        
        System.out.println(fruits);  // [りんご, バナナ, みかん, りんご]
        
        // 要素の取得
        System.out.println(fruits.get(0));  // りんご
        
        // 要素の更新
        fruits.set(1, "ぶどう");  // バナナ → ぶどう
        
        // 要素の削除
        fruits.remove("みかん");
        fruits.remove(0);  // インデックスで削除
        
        // サイズ
        System.out.println(fruits.size());  // 2
        
        // 検索
        System.out.println(fruits.contains("ぶどう"));  // true
        
        // ループ
        for (String fruit : fruits) {
            System.out.println(fruit);
        }
        
        // 不変リストの作成（Java 9以降）
        List<String> colors = List.of("赤", "青", "緑");
        // colors.add("黄");  // UnsupportedOperationException
    }
}
```

### 2.3 Map（マップ）

**キーと値のペア**で管理するコレクションです。

```java
import java.util.HashMap;
import java.util.Map;

public class MapExample {
    public static void main(String[] args) {
        // Mapの作成
        Map<String, Integer> scores = new HashMap<>();
        
        // 要素の追加
        scores.put("田中", 85);
        scores.put("佐藤", 92);
        scores.put("鈴木", 78);
        
        System.out.println(scores);  // {田中=85, 佐藤=92, 鈴木=78}
        
        // 値の取得
        System.out.println(scores.get("田中"));  // 85
        
        // キーの存在確認
        System.out.println(scores.containsKey("佐藤"));  // true
        
        // デフォルト値付き取得
        int score = scores.getOrDefault("山田", 0);  // 0（存在しないキー）
        
        // 値の更新
        scores.put("田中", 90);  // 85 → 90
        
        // 要素の削除
        scores.remove("鈴木");
        
        // ループ
        for (Map.Entry<String, Integer> entry : scores.entrySet()) {
            System.out.println(entry.getKey() + ": " + entry.getValue());
        }
        
        // キーだけループ
        for (String name : scores.keySet()) {
            System.out.println(name);
        }
        
        // 値だけループ
        for (int s : scores.values()) {
            System.out.println(s);
        }
    }
}
```

### 2.4 Set（セット）

**重複なし**のコレクションです。

```java
import java.util.HashSet;
import java.util.Set;

public class SetExample {
    public static void main(String[] args) {
        Set<String> tags = new HashSet<>();
        
        tags.add("Java");
        tags.add("Spring");
        tags.add("Java");   // 重複は無視される
        tags.add("Docker");
        
        System.out.println(tags);  // [Java, Spring, Docker]（順序不定）
        System.out.println(tags.size());  // 3
        
        // 含まれるか確認
        System.out.println(tags.contains("Java"));  // true
        
        // 削除
        tags.remove("Docker");
    }
}
```

### 2.5 ラッパークラス

コレクションにプリミティブ型を入れるには**ラッパークラス**を使います。

```java
// プリミティブ型 → ラッパークラス
// int     → Integer
// double  → Double
// boolean → Boolean
// char    → Character

List<Integer> numbers = new ArrayList<>();
numbers.add(42);    // オートボクシング（int → Integer）
int num = numbers.get(0);  // オートアンボクシング（Integer → int）
```

---

## 3. ラムダ式（入門）

### 3.1 ラムダ式とは

**ラムダ式**は、メソッドを簡潔に記述する方法です（Java 8以降）。

```java
// 従来の書き方（匿名クラス）
List<String> names = Arrays.asList("田中", "佐藤", "鈴木");
Collections.sort(names, new Comparator<String>() {
    @Override
    public int compare(String a, String b) {
        return a.compareTo(b);
    }
});

// ラムダ式で書き換え
Collections.sort(names, (a, b) -> a.compareTo(b));
```

### 3.2 基本構文

```java
// 引数が複数
(a, b) -> a + b

// 引数が1つ（括弧省略可能）
x -> x * 2

// 引数なし
() -> System.out.println("Hello")

// 複数行の処理
(a, b) -> {
    int sum = a + b;
    return sum;
}
```

### 3.3 よく使うパターン

```java
List<String> names = List.of("田中", "佐藤", "鈴木", "高橋");

// forEach
names.forEach(name -> System.out.println("こんにちは、" + name + "さん"));

// ソート
List<String> sorted = new ArrayList<>(names);
sorted.sort((a, b) -> a.compareTo(b));

// removeIf
List<String> mutableList = new ArrayList<>(names);
mutableList.removeIf(name -> name.length() > 2);
```

---

## 4. Stream API（入門）

### 4.1 Stream APIとは

コレクションのデータを**パイプライン的に処理**する仕組みです。

```java
List<Integer> numbers = List.of(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);

// 偶数だけ抽出して2倍にして合計する
int result = numbers.stream()
    .filter(n -> n % 2 == 0)       // 偶数だけ [2, 4, 6, 8, 10]
    .map(n -> n * 2)                // 2倍 [4, 8, 12, 16, 20]
    .reduce(0, Integer::sum);       // 合計 60

System.out.println(result);  // 60
```

### 4.2 よく使う操作

```java
List<String> names = List.of("田中太郎", "佐藤花子", "鈴木一郎", "田中次郎", "高橋三郎");

// filter：条件で絞り込み
List<String> tanaka = names.stream()
    .filter(name -> name.startsWith("田中"))
    .toList();
System.out.println(tanaka);  // [田中太郎, 田中次郎]

// map：変換
List<Integer> nameLengths = names.stream()
    .map(String::length)
    .toList();
System.out.println(nameLengths);  // [4, 4, 4, 4, 4]

// sorted：ソート
List<String> sorted = names.stream()
    .sorted()
    .toList();

// count：件数
long count = names.stream()
    .filter(name -> name.length() > 3)
    .count();

// forEach：各要素に処理
names.stream()
    .filter(name -> name.startsWith("田中"))
    .forEach(System.out::println);

// anyMatch / allMatch：条件判定
boolean hasTanaka = names.stream()
    .anyMatch(name -> name.startsWith("田中"));  // true

// collect：結果をコレクションに変換
Map<Boolean, List<String>> grouped = names.stream()
    .collect(Collectors.partitioningBy(name -> name.startsWith("田中")));
```

### 4.3 処理の流れ

```
元データ  →  中間操作  →  中間操作  →  終端操作  →  結果
 stream()    filter()     map()       collect()   List

中間操作（何度でも繋げられる）：
  filter, map, sorted, distinct, limit, skip

終端操作（最後に1回だけ）：
  collect, forEach, count, reduce, toList, anyMatch
```

---

## 📝 練習問題

### 問題1：例外処理
ユーザーに数値を入力させ、0除算やフォーマットエラーを適切にハンドリングする計算機プログラムを作成してください。

### 問題2：社員管理
`List<Employee>` を使って社員を管理するプログラムを作成してください：
- 社員の追加、一覧表示、検索（名前で）、削除

### 問題3：Stream API
整数のリストから以下を求めてください：
1. 偶数のみのリスト
2. 全要素を2乗したリスト
3. 合計値
4. 最大値・最小値

---

## 📖 Java入門まとめ

```
全4回で学んだこと：
├── 第1回：基本構文とデータ型
│   基本的なプログラムの書き方、変数、型、演算子
├── 第2回：制御構文と配列
│   if/switch、for/while、配列、メソッド
├── 第3回：オブジェクト指向の基礎
│   クラス、継承、ポリモーフィズム、インターフェース
└── 第4回：例外処理とコレクション ← 今回
    try-catch、List/Map/Set、ラムダ式、Stream API
```

## ▶ 次のステップ
**フレームワーク入門（Spring Boot）**へ進みましょう！
