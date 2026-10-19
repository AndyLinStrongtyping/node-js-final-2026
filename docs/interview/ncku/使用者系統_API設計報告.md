# 使用者系統 API 設計報告

## 一、設計目的

本系統提供使用者註冊、登入及查詢個人資料三項功能，採用 Node.js、Express 與 PostgreSQL，並以 TypeORM 操作資料庫。密碼使用 bcrypt 雜湊儲存，登入後透過 JWT 驗證使用者身分。

本報告為本次面試題目提出的設計，API 路徑沿用既有專案，方便對照。以下欄位規格與回應方式為設計建議，與現有程式的差異列於文末。

本次設計假設：題目中的使用者為一般會員，登入後只能查詢自己的資料。若未來需要管理員查詢其他使用者，則另外設計管理員 API 與角色授權。

## 二、API endpoint 設計

| 功能 | HTTP 方法 | Endpoint | 登入需求 |
|---|---|---|---|
| 使用者註冊 | POST | `/api/users/signup` | 不需要 |
| 使用者登入 | POST | `/api/users/login` | 不需要 |
| 查詢個人資料 | GET | `/api/users/profile` | 需要 JWT |

### 1. 使用者註冊

使用者提交 `name`、`email` 與 `password`。後端檢查必填欄位、Email 格式與密碼規則，確認 Email 未被使用後，將密碼雜湊並建立帳號。

密碼規則沿用參考資料：長度為 8～16 字，包含英文大小寫與數字。Email 在儲存前去除前後空白並轉為小寫，登入時採用相同處理。

註冊成功回傳 `201 Created`，提供使用者 ID、姓名與 Email，回應不包含密碼及密碼雜湊。資料庫同時以唯一約束防止重複 Email，發生衝突時回傳 `409 Conflict`。

### 2. 使用者登入

使用者提交 `email` 與 `password`。後端依 Email 查詢帳號，使用 `bcrypt.compare()` 比對密碼。驗證成功後回傳 `200 OK` 與具有到期時間的 JWT。

帳號不存在或密碼錯誤時，統一回傳 `401 Unauthorized`，訊息為「Email 或密碼錯誤」。

### 3. 查詢個人資料

使用者在請求 header 中提供：

```http
Authorization: Bearer <token>
```

後端驗證 JWT 的簽章與有效期限，再依 token 中的使用者 ID 查詢資料庫，確認使用者仍存在。驗證通過後回傳 `200 OK`，內容包含姓名、Email、角色與建立時間等資料。

查詢對象由登入身分決定，不接受前端另外指定使用者 ID。回應明確選取允許的欄位，不包含密碼雜湊。

## 三、資料表設計

本系統使用一張 `users` 資料表。

| 欄位 | 資料型別 | 限制與用途 |
|---|---|---|
| `id` | UUID | 主鍵，由後端產生 |
| `name` | VARCHAR(50) | 必填，使用者姓名 |
| `email` | VARCHAR(254) | 必填且唯一，作為登入帳號 |
| `password_hash` | VARCHAR(255) | 必填，儲存 bcrypt 雜湊 |
| `role` | VARCHAR(20) | 必填，由後端設定，預設為 `USER` |
| `created_at` | TIMESTAMPTZ | 必填，預設目前時間，記錄建立時間 |
| `updated_at` | TIMESTAMPTZ | 必填，預設目前時間，由程式維護最後更新時間 |

Email 設定唯一約束，避免同時註冊產生重複帳號。主鍵與 Email 唯一索引可支援個人資料查詢及登入查詢。建議透過 migration 管理資料表結構，方便重建與追蹤變更。

## 四、錯誤處理與程式架構

API 採用一致的回應格式，成功使用 `status: "success"`，失敗使用 `status: "failed"` 並附上訊息。

| 情境 | HTTP 狀態碼 |
|---|---|
| 輸入欄位或格式錯誤 | 400 |
| 帳密錯誤、Token 無效或過期、使用者已不存在 | 401 |
| Email 已被使用 | 409 |
| 伺服器非預期錯誤 | 500 |

程式依責任拆分為 Router、Controller、Service、Repository 與 Middleware，分別處理路由、輸入與回應、業務流程、資料存取及身分驗證。非預期錯誤由集中錯誤處理機制回應，避免洩漏資料庫與內部程式資訊。

## 五、與既有專案的對照

本次整理文件，沿用既有專案作為參考；下列建議尚未因此次整理而實作。

| 項目 | 本報告設計建議 | 既有專案現況 |
|---|---|---|
| API 路徑 | 使用上述三條路徑 | 與 `backend/routes/users.js` 掛載的路徑一致 |
| 登入成功狀態碼 | 200 | 依原課程合約回傳 201 |
| 帳密錯誤狀態碼 | 401 | 依原課程合約回傳 400 |
| 密碼欄位 | `password_hash` | 欄位名為 `password`，實際儲存 bcrypt 雜湊 |
| 時間欄位 | `created_at`、`updated_at`，使用 TIMESTAMPTZ | `createdAt`、`updatedAt`，使用 timestamp |
| 欄位長度 | 如上表明確指定 | Entity 使用 varchar，未明確指定長度 |
| Email 驗證 | 格式檢查、去空白並轉小寫 | 已檢查非空字串並去空白，尚未加入格式檢查及小寫正規化 |
| 回傳欄位 | 註冊回傳 ID、姓名與 Email；個人資料可含角色及時間 | 註冊回傳 ID 與姓名；個人資料回傳姓名與 Email |
| 結構管理 | 使用 migration | 尚待補上 migration |

參考程式：[路由](../../../backend/routes/users.js)、[Controller](../../../backend/controllers/users.js)、[Service](../../../backend/services/auth-service.js)、[User Entity](../../../backend/entities/user.js)。

## 參考資料

1. 《後端程式碼_講義合規檢查_不含容器化.md》
2. 《驗證與授權流程_講義合規檢查.md》
3. 《nodejs_backend_review.pptx》
