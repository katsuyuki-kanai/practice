# Java入門 第1回：基本構文とデータ型

## 📚 この資料で学ぶこと
- Javaの特徴と開発環境
- プログラムの基本構造
- 変数とデータ型
- 演算子
- 型変換

> ⏰ 想定時間：1時間（全4回中の第1回）

---

## 1. Javaとは

### 1.1 Javaの特徴

```
Javaの主な特徴：
├── プラットフォーム非依存（Write Once, Run Anywhere）
├── オブジェクト指向プログラミング言語
├── 強い型付け（型安全）
├── 自動メモリ管理（ガベージコレクション）
├── 豊富な標準ライブラリ
└── 企業システムで広く採用
```

### 1.2 Javaの動作の仕組み

```
ソースコード(.java)
      │
      ▼ コンパイル（javac）
バイトコード(.class)
      │
      ▼ JVM（Java Virtual Machine）が実行
各OS上で動作
┌─────────┬─────────┬─────────┐
│ Windows │  macOS  │  Linux  │
└─────────┴─────────┴─────────┘
```

> 💡 C言語は各OS向けにコンパイルが必要ですが、Javaは一度コンパイルすればどのOSでも動きます

### 1.3 開発環境の準備

```
必要なもの：
├── JDK（Java Development Kit）← Java 17 LTS 推奨
├── IDE（統合開発環境）
│   ├── IntelliJ IDEA（推奨）
│   ├── Eclipse
│   └── VS Code + Extension Pack for Java
└── ビルドツール（後の回で学習）
    ├── Maven
    └── Gradle
```

---

## 2. はじめてのJavaプログラム

### 2.1 Hello World

```java
// ファイル名: HelloWorld.java（クラス名と一致させる）
public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}
```

### 2.2 プログラムの構造を理解する

```java
public class HelloWorld {          // クラス宣言（ファイル名と一致）
    public static void main(String[] args) {  // エントリーポイント
        System.out.println("Hello, World!");   // 文（セミコロンで終わる）
    }
}
```

| 要素 | 説明 |
|------|------|
| `public class HelloWorld` | クラスの宣言。ファイル名と同じにする |
| `public static void main(String[] args)` | プログラムの開始地点（メインメソッド） |
| `System.out.println()` | 標準出力に文字列を表示（改行あり） |
| `System.out.print()` | 標準出力に文字列を表示（改行なし） |
| `;` | 文の終わりを示すセミコロン |

### 2.3 コンパイルと実行

```bash
# コンパイル
javac HelloWorld.java

# 実行
java HelloWorld

# 出力
Hello, World!
```

### 2.4 コメント

```java
// 一行コメント：この行はプログラムに影響しない

/*
 * 複数行コメント
 * 複数行にわたる説明に使う
 */

/**
 * Javadocコメント
 * クラスやメソッドの説明に使う
 * ドキュメント自動生成に利用される
 * @param args コマンドライン引数
 */
```

---

## 3. 変数とデータ型

### 3.1 変数とは

**変数**はデータを格納する「箱」です。

```java
// 変数の宣言と代入
int age;          // 宣言：int型の変数ageを作る
age = 25;         // 代入：ageに25を入れる

int height = 170; // 宣言と代入を同時に行う

// 変数の利用
System.out.println(age);    // 25
System.out.println(height); // 170
```

### 3.2 プリミティブ型（基本データ型）

Javaには**8つのプリミティブ型**があります。

| 型 | サイズ | 範囲 | 用途 | 例 |
|----|--------|------|------|----|
| `byte` | 1バイト | -128 〜 127 | 小さい整数 | `byte b = 100;` |
| `short` | 2バイト | -32,768 〜 32,767 | 小さい整数 | `short s = 30000;` |
| `int` | 4バイト | 約±21億 | **整数（標準）** | `int i = 100000;` |
| `long` | 8バイト | 非常に大きい整数 | 大きい整数 | `long l = 100000L;` |
| `float` | 4バイト | 小数点（単精度） | 小数 | `float f = 3.14f;` |
| `double` | 8バイト | 小数点（倍精度） | **小数（標準）** | `double d = 3.14;` |
| `boolean` | - | true / false | 真偽値 | `boolean flag = true;` |
| `char` | 2バイト | Unicode 1文字 | 文字 | `char c = 'A';` |

> 💡 **よく使うのは `int`、`double`、`boolean`、`char` の4つ**です

```java
public class DataTypes {
    public static void main(String[] args) {
        // 整数型
        int age = 25;
        long population = 126000000L;  // Lサフィックスが必要
        
        // 小数型
        double price = 1980.5;
        float rate = 0.08f;            // fサフィックスが必要
        
        // 真偽型
        boolean isStudent = true;
        boolean isWorking = false;
        
        // 文字型
        char grade = 'A';
        char initial = '田';           // Unicode文字も可
        
        System.out.println("年齢: " + age);
        System.out.println("人口: " + population);
        System.out.println("価格: " + price);
        System.out.println("学生: " + isStudent);
        System.out.println("成績: " + grade);
    }
}
```

### 3.3 参照型

プリミティブ型以外はすべて**参照型**です。

```java
// String（文字列）は最もよく使う参照型
String name = "田中太郎";
String greeting = "こんにちは";

// 文字列の結合
String message = greeting + "、" + name + "さん";
System.out.println(message);  // こんにちは、田中太郎さん

// 文字列の長さ
System.out.println(name.length());  // 4

// 配列（次回詳しく学習）
int[] numbers = {1, 2, 3, 4, 5};
```

### 3.4 プリミティブ型と参照型の違い

```
プリミティブ型：値そのものを格納
┌────────────┐
│  age = 25  │  ← 値そのもの
└────────────┘

参照型：オブジェクトの参照（アドレス）を格納
┌──────────────────┐     ┌──────────────┐
│ name = 0x1234    │ ──> │ "田中太郎"    │  ← 実際のデータ
└──────────────────┘     └──────────────┘
  変数（参照）              ヒープ領域のオブジェクト
```

### 3.5 定数（final）

```java
// finalをつけると値を変更できない定数になる
final double TAX_RATE = 0.10;
final int MAX_RETRY = 3;
final String COMPANY_NAME = "株式会社サンプル";

// TAX_RATE = 0.08;  // コンパイルエラー！変更不可
```

> 💡 定数名は**大文字のスネークケース**（`MAX_RETRY`）で命名するのが慣習です

---

## 4. 演算子

### 4.1 算術演算子

```java
int a = 10;
int b = 3;

System.out.println(a + b);   // 13（加算）
System.out.println(a - b);   // 7 （減算）
System.out.println(a * b);   // 30（乗算）
System.out.println(a / b);   // 3 （除算 ※整数同士は小数点以下切り捨て）
System.out.println(a % b);   // 1 （剰余・余り）

// 注意：整数同士の除算
System.out.println(10 / 3);      // 3  （小数点以下が消える！）
System.out.println(10.0 / 3);    // 3.3333...（どちらかがdoubleなら小数）
System.out.println((double) 10 / 3); // 3.3333...（キャストで対応）
```

### 4.2 代入演算子

```java
int x = 10;

x += 5;   // x = x + 5;  → 15
x -= 3;   // x = x - 3;  → 12
x *= 2;   // x = x * 2;  → 24
x /= 4;   // x = x / 4;  → 6
x %= 4;   // x = x % 4;  → 2
```

### 4.3 インクリメント・デクリメント

```java
int count = 10;

count++;  // count = count + 1; → 11（後置）
count--;  // count = count - 1; → 10（後置）
++count;  // count = count + 1; → 11（前置）

// 前置と後置の違い（式の中で使う場合）
int a = 5;
int b = a++;  // b = 5, a = 6 （先に代入してからインクリメント）
int c = ++a;  // c = 7, a = 7 （先にインクリメントしてから代入）
```

### 4.4 比較演算子

```java
int a = 10;
int b = 20;

System.out.println(a == b);  // false（等しい）
System.out.println(a != b);  // true （等しくない）
System.out.println(a > b);   // false（より大きい）
System.out.println(a < b);   // true （より小さい）
System.out.println(a >= b);  // false（以上）
System.out.println(a <= b);  // true （以下）
```

### 4.5 論理演算子

```java
boolean x = true;
boolean y = false;

System.out.println(x && y);  // false（AND：両方trueならtrue）
System.out.println(x || y);  // true （OR：どちらかtrueならtrue）
System.out.println(!x);      // false（NOT：反転）
```

```java
// 実用例
int age = 25;
boolean hasLicense = true;

// 20歳以上 かつ 免許を持っている
if (age >= 20 && hasLicense) {
    System.out.println("運転できます");
}
```

### 4.6 文字列の比較

```java
// ⚠️ 重要：文字列の比較は == ではなく equals() を使う！
String s1 = "hello";
String s2 = "hello";
String s3 = new String("hello");

System.out.println(s1 == s2);        // true （たまたま同じ参照）
System.out.println(s1 == s3);        // false（参照が異なる）
System.out.println(s1.equals(s3));   // true （値が同じ）✅

// 常に equals() を使うこと！
if (s1.equals(s3)) {
    System.out.println("同じ文字列です");
}
```

> ⚠️ **文字列の比較は必ず `equals()` メソッドを使いましょう。`==` は参照の比較になってしまいます。**

---

## 5. 型変換

### 5.1 暗黙的な型変換（自動変換）

小さい型から大きい型への変換は**自動的**に行われます。

```java
// 暗黙的型変換（データが失われない方向）
byte → short → int → long → float → double

int intValue = 100;
double doubleValue = intValue;  // int → double（自動変換）
System.out.println(doubleValue);  // 100.0
```

### 5.2 明示的な型変換（キャスト）

大きい型から小さい型への変換は**キャスト**が必要です。

```java
double price = 1980.7;
int rounded = (int) price;  // double → int（小数部分が切り捨て）
System.out.println(rounded);  // 1980

long bigNumber = 100L;
int normalNumber = (int) bigNumber;  // long → int
```

> ⚠️ **キャストするとデータが失われる可能性があります。注意して使いましょう。**

### 5.3 文字列との変換

```java
// 数値 → 文字列
int num = 42;
String str1 = String.valueOf(num);     // "42"
String str2 = Integer.toString(num);   // "42"
String str3 = "" + num;               // "42"（文字列結合を利用）

// 文字列 → 数値
String numStr = "123";
int parsed = Integer.parseInt(numStr);       // 123
double parsed2 = Double.parseDouble("3.14"); // 3.14

// ⚠️ 数値に変換できない文字列はエラーになる
// int error = Integer.parseInt("abc"); // NumberFormatException
```

---

## 6. 標準入力

### 6.1 Scannerクラスを使った入力の受け取り

```java
import java.util.Scanner;  // インポートが必要

public class InputExample {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        
        System.out.print("名前を入力してください: ");
        String name = scanner.nextLine();   // 文字列を読み取り
        
        System.out.print("年齢を入力してください: ");
        int age = scanner.nextInt();        // 整数を読み取り
        
        System.out.println(name + "さんは" + age + "歳です");
        
        scanner.close();  // Scanner を閉じる
    }
}
```

| メソッド | 読み取る内容 |
|---------|-------------|
| `nextLine()` | 1行の文字列 |
| `next()` | 空白までの文字列 |
| `nextInt()` | 整数 |
| `nextDouble()` | 小数 |
| `nextBoolean()` | 真偽値 |

---

## 7. 命名規則

Javaには一般的な**命名規則**があります。

| 対象 | 規則 | 例 |
|------|------|-----|
| **クラス名** | パスカルケース（大文字始まり） | `UserService`, `HelloWorld` |
| **メソッド名** | キャメルケース（小文字始まり） | `getUserName()`, `calculateTotal()` |
| **変数名** | キャメルケース（小文字始まり） | `userName`, `totalPrice` |
| **定数名** | 大文字スネークケース | `MAX_SIZE`, `TAX_RATE` |
| **パッケージ名** | すべて小文字 | `com.example.myapp` |

---

## 📝 練習問題

### 問題1：自己紹介プログラム
名前、年齢、出身地を変数に格納し、自己紹介文を表示するプログラムを作成してください。

```
出力例：
私の名前は田中太郎です。
年齢は25歳で、東京都出身です。
```

### 問題2：BMI計算機
身長（cm）と体重（kg）からBMIを計算して表示するプログラムを作成してください。

```
BMI = 体重(kg) / (身長(m))²
出力例：
身長: 170cm, 体重: 65kg
BMI: 22.49
```

### 問題3：温度変換
華氏温度を摂氏温度に変換するプログラムを作成してください。

```
摂氏 = (華氏 - 32) × 5/9
出力例：
華氏: 98.6°F
摂氏: 37.0°C
```

---

## ▶ 次回予告
**第2回：制御構文と配列**
- if文、switch文
- for文、while文
- 配列の基本
