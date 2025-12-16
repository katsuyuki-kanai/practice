# SOAP設計原則

## 目次
1. [SOAPとは](#soapとは)
2. [SOAPの基本構造](#soapの基本構造)
3. [SOAP vs REST](#soap-vs-rest)
4. [SOAPの設計原則](#soapの設計原則)
5. [WSDLの理解](#wsdlの理解)
6. [セキュリティとトランザクション](#セキュリティとトランザクション)
7. [実践例](#実践例)

---

## SOAPとは

**SOAP (Simple Object Access Protocol)** は、XMLベースの通信プロトコルです。主に企業向けのWebサービスで使用されます。

### SOAPの特徴
- **プロトコル**: 厳密な仕様に基づいた通信プロトコル
- **XML形式**: すべてのメッセージはXMLで表現
- **標準化**: W3Cによって標準化されている
- **エンタープライズ向け**: 高度なセキュリティ、トランザクション機能を提供

### SOAPが使われる場面
- 金融システム（銀行間取引など）
- 決済処理システム
- 企業間取引（EDI: Electronic Data Interchange）
- レガシーシステムとの統合
- 高度なセキュリティが必要な場面

---

## SOAPの基本構造

### SOAPメッセージの構成要素

SOAPメッセージは以下の4つの部分から構成されます：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  
  <!-- 1. Envelope（必須）: メッセージ全体を包む -->
  
  <!-- 2. Header（オプション）: メタ情報 -->
  <soap:Header>
    <auth:Authentication xmlns:auth="http://example.com/auth">
      <auth:Username>user123</auth:Username>
      <auth:Password>pass456</auth:Password>
    </auth:Authentication>
  </soap:Header>
  
  <!-- 3. Body（必須）: 実際のデータ -->
  <soap:Body>
    <m:GetUserInfo xmlns:m="http://example.com/users">
      <m:UserId>123</m:UserId>
    </m:GetUserInfo>
  </soap:Body>
  
  <!-- 4. Fault（オプション）: エラー情報 -->
  
</soap:Envelope>
```

### 1. Envelope（エンベロープ）
- SOAPメッセージのルート要素
- すべてのSOAPメッセージに必須
- 名前空間を定義

### 2. Header（ヘッダー）
- 認証情報
- トランザクションID
- ルーティング情報
- メタデータ

### 3. Body（ボディ）
- 実際の処理データ
- メソッド呼び出しとパラメータ
- レスポンスデータ

### 4. Fault（フォールト）
- エラー情報
- Bodyの中に配置される

---

## SOAP vs REST

### 比較表

| 項目 | SOAP | REST |
|------|------|------|
| **タイプ** | プロトコル | アーキテクチャスタイル |
| **データ形式** | XMLのみ | JSON, XML, HTML, テキストなど |
| **複雑さ** | 複雑（学習コスト高） | シンプル（学習コスト低） |
| **標準化** | 厳密な標準 | 緩やかなガイドライン |
| **セキュリティ** | WS-Security（高度） | HTTPS, OAuth（標準的） |
| **トランザクション** | WS-AtomicTransaction（組込） | アプリケーション層で実装 |
| **状態管理** | ステートフル可能 | ステートレス |
| **帯域幅** | 重い（XMLオーバーヘッド） | 軽い（JSONなど） |
| **キャッシュ** | 難しい | 容易 |
| **エラーハンドリング** | 標準化されたFault | HTTPステータスコード |

### SOAPを選ぶべき場合

✅ **SOAP推奨**
- 金融取引など、ACIDトランザクションが必要
- 高度なセキュリティ要件（WS-Security）
- 企業間の正式な契約に基づく通信
- レガシーシステムとの統合
- 非同期処理、リトライ、メッセージキューイングが必要

❌ **SOAP非推奨**
- モバイルアプリ向けAPI
- パブリックAPI
- リアルタイム性が重視される
- 軽量・高速な通信が必要

---

## SOAPの設計原則

### 1. 契約優先設計 (Contract-First Design)

WSDLを先に定義してから実装を行う。

**手順:**
1. WSDLを設計
2. WSDLからコード生成
3. ビジネスロジックを実装

**メリット:**
- クライアントとサーバーの契約が明確
- 型安全性の確保
- 自動コード生成が可能

### 2. メッセージ指向

- データではなく「メッセージ」を交換する概念
- メッセージには意図（オペレーション）が含まれる

```xml
<!-- Document Style（推奨） -->
<soap:Body>
  <GetUserRequest>
    <UserId>123</UserId>
  </GetUserRequest>
</soap:Body>

<!-- RPC Style（非推奨） -->
<soap:Body>
  <m:GetUser>
    <m:userId>123</m:userId>
  </m:GetUser>
</soap:Body>
```

### 3. Document/Literalスタイルの採用

SOAPには複数のスタイルがありますが、**Document/Literal Wrapped**が推奨されます。

**理由:**
- 相互運用性が高い
- WS-I (Web Services Interoperability) に準拠
- XMLスキーマで検証可能

### 4. 名前空間の適切な管理

```xml
<soap:Envelope 
  xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"
  xmlns:user="http://example.com/users/v1"
  xmlns:common="http://example.com/common/v1">
  
  <soap:Body>
    <user:GetUserInfo>
      <common:RequestId>req-12345</common:RequestId>
      <user:UserId>123</user:UserId>
    </user:GetUserInfo>
  </soap:Body>
  
</soap:Envelope>
```

### 5. バージョニング戦略

**方法1: 名前空間でバージョン管理（推奨）**
```xml
xmlns:v1="http://example.com/users/v1"
xmlns:v2="http://example.com/users/v2"
```

**方法2: エンドポイントでバージョン管理**
```
http://example.com/services/v1/UserService
http://example.com/services/v2/UserService
```

### 6. エラーハンドリング

SOAPでは`Fault`要素を使用してエラーを表現します。

```xml
<soap:Fault>
  <faultcode>soap:Client</faultcode>
  <faultstring>Invalid User ID</faultstring>
  <faultactor>http://example.com/users</faultactor>
  <detail>
    <error xmlns="http://example.com/errors">
      <code>USER_NOT_FOUND</code>
      <message>指定されたユーザーが見つかりません</message>
      <userId>999</userId>
    </error>
  </detail>
</soap:Fault>
```

**Fault Code の種類:**
- `soap:VersionMismatch`: SOAPバージョン不一致
- `soap:MustUnderstand`: 必須ヘッダーが理解できない
- `soap:Client`: クライアント側エラー
- `soap:Server`: サーバー側エラー

---

## WSDLの理解

**WSDL (Web Services Description Language)** は、SOAPサービスの仕様を記述するXMLベースの言語です。

### WSDLの構造

```xml
<?xml version="1.0" encoding="UTF-8"?>
<definitions 
  name="UserService"
  targetNamespace="http://example.com/users"
  xmlns="http://schemas.xmlsoap.org/wsdl/"
  xmlns:soap="http://schemas.xmlsoap.org/wsdl/soap/"
  xmlns:tns="http://example.com/users"
  xmlns:xsd="http://www.w3.org/2001/XMLSchema">

  <!-- 1. Types: データ型の定義 -->
  <types>
    <xsd:schema targetNamespace="http://example.com/users">
      <xsd:element name="GetUserRequest">
        <xsd:complexType>
          <xsd:sequence>
            <xsd:element name="UserId" type="xsd:int"/>
          </xsd:sequence>
        </xsd:complexType>
      </xsd:element>
      
      <xsd:element name="GetUserResponse">
        <xsd:complexType>
          <xsd:sequence>
            <xsd:element name="User" type="tns:UserType"/>
          </xsd:sequence>
        </xsd:complexType>
      </xsd:element>
      
      <xsd:complexType name="UserType">
        <xsd:sequence>
          <xsd:element name="Id" type="xsd:int"/>
          <xsd:element name="Name" type="xsd:string"/>
          <xsd:element name="Email" type="xsd:string"/>
        </xsd:sequence>
      </xsd:complexType>
    </xsd:schema>
  </types>

  <!-- 2. Message: メッセージの定義 -->
  <message name="GetUserRequestMessage">
    <part name="parameters" element="tns:GetUserRequest"/>
  </message>
  
  <message name="GetUserResponseMessage">
    <part name="parameters" element="tns:GetUserResponse"/>
  </message>

  <!-- 3. PortType: オペレーションの定義 -->
  <portType name="UserPortType">
    <operation name="GetUser">
      <input message="tns:GetUserRequestMessage"/>
      <output message="tns:GetUserResponseMessage"/>
    </operation>
  </portType>

  <!-- 4. Binding: プロトコルとデータ形式 -->
  <binding name="UserSoapBinding" type="tns:UserPortType">
    <soap:binding style="document" transport="http://schemas.xmlsoap.org/soap/http"/>
    <operation name="GetUser">
      <soap:operation soapAction="http://example.com/users/GetUser"/>
      <input>
        <soap:body use="literal"/>
      </input>
      <output>
        <soap:body use="literal"/>
      </output>
    </operation>
  </binding>

  <!-- 5. Service: エンドポイントの定義 -->
  <service name="UserService">
    <port name="UserPort" binding="tns:UserSoapBinding">
      <soap:address location="http://example.com/services/UserService"/>
    </port>
  </service>

</definitions>
```

### WSDLの主要要素

1. **Types**: データ型をXMLスキーマで定義
2. **Message**: 送受信するメッセージ
3. **PortType**: 提供する操作（オペレーション）
4. **Binding**: 具体的なプロトコル（SOAP/HTTP）
5. **Service**: 実際のエンドポイントURL

---

## セキュリティとトランザクション

### WS-Security

SOAPの高度なセキュリティ機能。

```xml
<soap:Header>
  <wsse:Security xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/...">
    
    <!-- ユーザー名トークン -->
    <wsse:UsernameToken>
      <wsse:Username>user123</wsse:Username>
      <wsse:Password Type="PasswordDigest">...</wsse:Password>
      <wsse:Nonce>...</wsse:Nonce>
      <wsu:Created>2025-12-16T10:00:00Z</wsu:Created>
    </wsse:UsernameToken>
    
    <!-- デジタル署名 -->
    <ds:Signature xmlns:ds="http://www.w3.org/2000/09/xmldsig#">
      ...
    </ds:Signature>
    
    <!-- 暗号化 -->
    <xenc:EncryptedData xmlns:xenc="http://www.w3.org/2001/04/xmlenc#">
      ...
    </xenc:EncryptedData>
    
  </wsse:Security>
</soap:Header>
```

**WS-Securityの機能:**
- 認証（Authentication）
- 署名（Signature）
- 暗号化（Encryption）
- タイムスタンプ
- トークン（SAML, Kerberosなど）

### WS-AtomicTransaction

複数のサービスにまたがるトランザクション処理。

```xml
<soap:Header>
  <wscoor:CoordinationContext xmlns:wscoor="...">
    <wscoor:Identifier>
      uuid:12345678-1234-1234-1234-123456789012
    </wscoor:Identifier>
    <wscoor:CoordinationType>
      http://docs.oasis-open.org/ws-tx/wsat/2006/06
    </wscoor:CoordinationType>
  </wscoor:CoordinationContext>
</soap:Header>
```

---

## 実践例

### ユーザー管理SOAPサービスの例

#### リクエスト: ユーザー情報取得

```xml
POST /services/UserService HTTP/1.1
Host: example.com
Content-Type: text/xml; charset=utf-8
SOAPAction: "http://example.com/users/GetUser"

<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"
               xmlns:user="http://example.com/users/v1">
  <soap:Header>
    <user:Authentication>
      <user:ApiKey>abc123xyz789</user:ApiKey>
    </user:Authentication>
  </soap:Header>
  <soap:Body>
    <user:GetUserRequest>
      <user:UserId>123</user:UserId>
    </user:GetUserRequest>
  </soap:Body>
</soap:Envelope>
```

#### レスポンス: 成功

```xml
HTTP/1.1 200 OK
Content-Type: text/xml; charset=utf-8

<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"
               xmlns:user="http://example.com/users/v1">
  <soap:Body>
    <user:GetUserResponse>
      <user:User>
        <user:Id>123</user:Id>
        <user:Name>田中太郎</user:Name>
        <user:Email>tanaka@example.com</user:Email>
        <user:CreatedAt>2025-01-01T10:00:00Z</user:CreatedAt>
      </user:User>
    </user:GetUserResponse>
  </soap:Body>
</soap:Envelope>
```

#### レスポンス: エラー

```xml
HTTP/1.1 500 Internal Server Error
Content-Type: text/xml; charset=utf-8

<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <soap:Fault>
      <faultcode>soap:Client</faultcode>
      <faultstring>User not found</faultstring>
      <detail>
        <error xmlns="http://example.com/users/v1">
          <code>USER_NOT_FOUND</code>
          <message>指定されたユーザーIDが見つかりません</message>
          <userId>999</userId>
          <timestamp>2025-12-16T10:00:00Z</timestamp>
        </error>
      </detail>
    </soap:Fault>
  </soap:Body>
</soap:Envelope>
```

### ユーザー作成の例

```xml
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"
               xmlns:user="http://example.com/users/v1">
  <soap:Body>
    <user:CreateUserRequest>
      <user:User>
        <user:Name>山田花子</user:Name>
        <user:Email>yamada@example.com</user:Email>
        <user:Password>securePassword123</user:Password>
      </user:User>
    </user:CreateUserRequest>
  </soap:Body>
</soap:Envelope>
```

---

## SOAP開発のツールとライブラリ

### 主要なツール

1. **SoapUI**: SOAPテストツール
2. **Postman**: SOAP/RESTの両方に対応
3. **Apache CXF**: Javaのフレームワーク
4. **gSOAP**: C/C++向け
5. **.NET WCF**: Microsoft .NET環境

### 各言語のライブラリ

**Java:**
```java
// JAX-WS (Java API for XML Web Services)
@WebService
public class UserService {
    @WebMethod
    public User getUser(int userId) {
        // 実装
    }
}
```

**Python:**
```python
# zeep ライブラリ
from zeep import Client

client = Client('http://example.com/services/UserService?wsdl')
result = client.service.GetUser(userId=123)
```

**C#:**
```csharp
// WCF (Windows Communication Foundation)
[ServiceContract]
public interface IUserService
{
    [OperationContract]
    User GetUser(int userId);
}
```

**PHP:**
```php
// SoapClient
$client = new SoapClient('http://example.com/services/UserService?wsdl');
$result = $client->GetUser(['UserId' => 123]);
```

---

## ベストプラクティス

### 1. 適切な粒度のサービス設計

**悪い例（細かすぎる）:**
```
GetUserName(userId)
GetUserEmail(userId)
GetUserPhone(userId)
```

**良い例:**
```
GetUser(userId) → すべての情報を返す
```

### 2. バージョン互換性の維持

```xml
<!-- 古いバージョンとの互換性 -->
<xsd:element name="Phone" type="xsd:string" minOccurs="0"/>
<!-- minOccurs="0" で省略可能 -->
```

### 3. 適切なタイムアウト設定

```xml
<binding>
  <soap:binding>
    <receiveTimeout>00:05:00</receiveTimeout>
    <sendTimeout>00:05:00</sendTimeout>
  </soap:binding>
</binding>
```

### 4. ログとモニタリング

- すべてのリクエスト/レスポンスをログに記録
- トランザクションIDでトレース
- パフォーマンスメトリクスの収集

### 5. セキュリティのベストプラクティス

- HTTPSの使用（必須）
- WS-Securityの適用
- 入力値の検証
- XMLインジェクション対策

---

## まとめ

### SOAP設計のチェックリスト

- [ ] WSDLが適切に設計されている
- [ ] Document/Literalスタイルを使用
- [ ] 名前空間が適切に管理されている
- [ ] バージョニング戦略が明確
- [ ] エラーハンドリングが統一されている
- [ ] セキュリティ要件を満たしている
- [ ] トランザクション要件を考慮している
- [ ] ドキュメントとテストが整備されている

### SOAPの学習ポイント

1. **XMLとXMLスキーマの理解**
   - SOAPの基礎となる技術

2. **WSDLの読み書き**
   - サービスの仕様を理解する鍵

3. **実際のエンタープライズシステムを学ぶ**
   - 金融、保険、製造業などの事例

4. **REST APIとの違いを理解**
   - 適切な技術選択ができるように

### いつSOAPを使うべきか

**SOAP推奨:**
- 金融取引、決済処理
- 企業間の正式なデータ交換
- 高度なセキュリティ要件
- ACIDトランザクションが必要
- レガシーシステムとの統合

**REST推奨:**
- モバイルアプリAPI
- パブリックAPI
- マイクロサービス
- 軽量・高速な通信

---

## 参考資料

- [W3C SOAP Specification](https://www.w3.org/TR/soap/)
- [OASIS WS-Security](https://www.oasis-open.org/committees/wss/)
- [Apache CXF](https://cxf.apache.org/)
- [SoapUI Documentation](https://www.soapui.org/docs/)
- [WS-I Basic Profile](https://www.ws-i.org/)
