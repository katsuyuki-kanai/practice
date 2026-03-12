# Java入門 第2回：制御構文と配列

## 📚 この資料で学ぶこと
- 条件分岐（if文、switch文）
- 繰り返し（for文、while文、do-while文）
- 配列の基本操作
- 拡張for文

> ⏰ 想定時間：1時間（全4回中の第2回）

---

## 1. 条件分岐

### 1.1 if文

```java
int score = 85;

if (score >= 80) {
    System.out.println("合格です！");
}
```

### 1.2 if-else文

```java
int age = 17;

if (age >= 18) {
    System.out.println("成人です");
} else {
    System.out.println("未成年です");
}
```

### 1.3 if-else if-else文

```java
int score = 75;

if (score >= 90) {
    System.out.println("評価：A（優秀）");
} else if (score >= 80) {
    System.out.println("評価：B（良好）");
} else if (score >= 70) {
    System.out.println("評価：C（普通）");
} else if (score >= 60) {
    System.out.println("評価：D（要努力）");
} else {
    System.out.println("評価：F（不合格）");
}
// 出力：評価：C（普通）
```

### 1.4 三項演算子

```java
int age = 20;
String status = (age >= 18) ? "成人" : "未成年";
System.out.println(status);  // 成人

// if-elseを1行で書ける便利な書き方
int price = 1000;
int tax = (price > 500) ? (int)(price * 0.10) : 0;
```

### 1.5 switch文

```java
int dayOfWeek = 3;

switch (dayOfWeek) {
    case 1:
        System.out.println("月曜日");
        break;
    case 2:
        System.out.println("火曜日");
        break;
    case 3:
        System.out.println("水曜日");
        break;
    case 4:
        System.out.println("木曜日");
        break;
    case 5:
        System.out.println("金曜日");
        break;
    case 6:
        System.out.println("土曜日");
        break;
    case 7:
        System.out.println("日曜日");
        break;
    default:
        System.out.println("無効な値です");
        break;
}
```

> ⚠️ **`break`を忘れると、次の`case`も実行されてしまいます（フォールスルー）**

### 1.6 拡張switch文（Java 14以降）

```java
int dayOfWeek = 3;

String dayName = switch (dayOfWeek) {
    case 1 -> "月曜日";
    case 2 -> "火曜日";
    case 3 -> "水曜日";
    case 4 -> "木曜日";
    case 5 -> "金曜日";
    case 6, 7 -> "週末";  // 複数の値をまとめられる
    default -> "無効";
};

System.out.println(dayName);  // 水曜日
```

---

## 2. 繰り返し（ループ）

### 2.1 for文

```java
// 基本形：for (初期化; 条件; 更新) { 処理 }
for (int i = 0; i < 5; i++) {
    System.out.println("カウント: " + i);
}
// カウント: 0
// カウント: 1
// カウント: 2
// カウント: 3
// カウント: 4
```

```java
// 1から10までの合計を計算
int sum = 0;
for (int i = 1; i <= 10; i++) {
    sum += i;
}
System.out.println("合計: " + sum);  // 合計: 55
```

### 2.2 while文

**条件がtrueの間**繰り返します。

```java
int count = 0;

while (count < 5) {
    System.out.println("count: " + count);
    count++;
}
```

```java
// 実用例：入力が "quit" になるまで繰り返す
Scanner scanner = new Scanner(System.in);
String input = "";

while (!input.equals("quit")) {
    System.out.print("入力してください (quit で終了): ");
    input = scanner.nextLine();
    System.out.println("入力値: " + input);
}
```

### 2.3 do-while文

**最低1回は実行**してから条件を判定します。

```java
int count = 0;

do {
    System.out.println("count: " + count);
    count++;
} while (count < 5);
```

```
while と do-while の違い：

while：条件を先にチェック → 条件がfalseなら1回も実行しない
do-while：処理を先に実行 → 必ず1回は実行される
```

### 2.4 break と continue

```java
// break：ループを途中で抜ける
for (int i = 0; i < 10; i++) {
    if (i == 5) {
        break;  // i=5 でループを終了
    }
    System.out.println(i);
}
// 0, 1, 2, 3, 4

// continue：今のループをスキップして次へ
for (int i = 0; i < 10; i++) {
    if (i % 2 == 0) {
        continue;  // 偶数はスキップ
    }
    System.out.println(i);
}
// 1, 3, 5, 7, 9
```

### 2.5 多重ループ

```java
// 九九の表
for (int i = 1; i <= 9; i++) {
    for (int j = 1; j <= 9; j++) {
        System.out.printf("%3d", i * j);
    }
    System.out.println();  // 改行
}
```

```
出力：
  1  2  3  4  5  6  7  8  9
  2  4  6  8 10 12 14 16 18
  3  6  9 12 15 18 21 24 27
  ...
```

---

## 3. 配列

### 3.1 配列とは

**配列**は、同じ型のデータを**連続して格納**するデータ構造です。

```
配列のイメージ：
インデックス:  [0]    [1]    [2]    [3]    [4]
              ┌──────┬──────┬──────┬──────┬──────┐
scores:       │  85  │  92  │  78  │  90  │  65  │
              └──────┴──────┴──────┴──────┴──────┘
```

> 💡 **インデックスは 0 から始まります！**

### 3.2 配列の宣言と初期化

```java
// 方法1：サイズを指定して宣言
int[] scores = new int[5];  // 要素数5の配列（初期値は0）
scores[0] = 85;
scores[1] = 92;
scores[2] = 78;

// 方法2：初期値を指定して宣言
int[] scores2 = {85, 92, 78, 90, 65};

// 方法3：new と初期値を指定
int[] scores3 = new int[]{85, 92, 78, 90, 65};

// 文字列の配列
String[] names = {"田中", "佐藤", "鈴木"};
```

### 3.3 配列の操作

```java
int[] scores = {85, 92, 78, 90, 65};

// 要素の取得
System.out.println(scores[0]);  // 85
System.out.println(scores[4]);  // 65

// 要素の更新
scores[2] = 95;  // 78 → 95

// 配列の長さ
System.out.println(scores.length);  // 5

// ⚠️ 範囲外アクセスはエラー
// System.out.println(scores[5]);  // ArrayIndexOutOfBoundsException
```

### 3.4 配列とループ

```java
int[] scores = {85, 92, 78, 90, 65};

// for文で全要素を表示
for (int i = 0; i < scores.length; i++) {
    System.out.println("scores[" + i + "] = " + scores[i]);
}

// 合計と平均の計算
int sum = 0;
for (int i = 0; i < scores.length; i++) {
    sum += scores[i];
}
double average = (double) sum / scores.length;
System.out.println("合計: " + sum);      // 合計: 410
System.out.println("平均: " + average);  // 平均: 82.0
```

### 3.5 拡張for文（for-each）

配列やコレクションの全要素を順番に処理する場合に便利です。

```java
int[] scores = {85, 92, 78, 90, 65};

// 拡張for文（推奨）
for (int score : scores) {
    System.out.println(score);
}

// 通常のfor文と比較
// for (int i = 0; i < scores.length; i++) {
//     System.out.println(scores[i]);
// }
```

> 💡 **インデックスが不要な場合は拡張for文を使いましょう**

### 3.6 多次元配列

```java
// 2次元配列
int[][] matrix = {
    {1, 2, 3},
    {4, 5, 6},
    {7, 8, 9}
};

System.out.println(matrix[0][0]);  // 1
System.out.println(matrix[1][2]);  // 6

// 2次元配列のループ
for (int i = 0; i < matrix.length; i++) {
    for (int j = 0; j < matrix[i].length; j++) {
        System.out.printf("%3d", matrix[i][j]);
    }
    System.out.println();
}
```

---

## 4. メソッド（入門）

### 4.1 メソッドとは

**メソッド**は、処理をまとめて名前を付けたものです。

```java
public class MethodExample {
    public static void main(String[] args) {
        // メソッドの呼び出し
        greet("田中");
        greet("佐藤");
        
        int result = add(10, 20);
        System.out.println("合計: " + result);  // 合計: 30
    }
    
    // 戻り値なしのメソッド
    static void greet(String name) {
        System.out.println("こんにちは、" + name + "さん！");
    }
    
    // 戻り値ありのメソッド
    static int add(int a, int b) {
        return a + b;
    }
}
```

### 4.2 メソッドの構造

```java
// アクセス修飾子 static 戻り値の型 メソッド名(引数) { 処理 }
static int calculateArea(int width, int height) {
    int area = width * height;
    return area;  // 値を返す
}

// 戻り値がない場合は void
static void printMessage(String msg) {
    System.out.println("[INFO] " + msg);
    // return不要（書いても良い）
}
```

| 要素 | 説明 |
|------|------|
| `static` | インスタンスなしで呼び出せる（次回詳しく） |
| 戻り値の型 | `int`, `String`, `void` など |
| メソッド名 | キャメルケースで命名 |
| 引数 | メソッドに渡すデータ |
| `return` | 値を呼び出し元に返す |

### 4.3 メソッドのオーバーロード

**同じ名前で引数が異なるメソッド**を定義できます。

```java
static int add(int a, int b) {
    return a + b;
}

static double add(double a, double b) {
    return a + b;
}

static int add(int a, int b, int c) {
    return a + b + c;
}

// 呼び出し
add(1, 2);        // int版が呼ばれる → 3
add(1.5, 2.5);    // double版が呼ばれる → 4.0
add(1, 2, 3);     // 3引数版が呼ばれる → 6
```

---

## 📝 練習問題

### 問題1：FizzBuzz
1から30までの数を表示するプログラムを作成してください。ただし：
- 3の倍数のときは「Fizz」
- 5の倍数のときは「Buzz」
- 3と5の両方の倍数のときは「FizzBuzz」
- それ以外は数字をそのまま表示

### 問題2：最大値と最小値
int型の配列 `{45, 78, 12, 89, 34, 56}` から最大値と最小値を見つけて表示するプログラムを作成してください。

### 問題3：文字列の逆転
文字列を受け取り、逆順にした文字列を返すメソッド `reverse(String str)` を作成してください。

```
入力: "Hello" → 出力: "olleH"
```

### 問題4：簡易電卓
2つの数値と演算子（+, -, *, /）を受け取り、計算結果を返すメソッドを作成してください。

---

## ▶ 次回予告
**第3回：オブジェクト指向の基礎**
- クラスとオブジェクト
- コンストラクタ
- カプセル化
- 継承
