# Node.js 後端課程複習指南（Day 1–46）

這不是逐字講義，而是一份「知道下一步要做什麼」的複習地圖。建議先照單元讀，再用文末的速答題檢查自己；卡住時再回到每一天的原講義。

## 先看全貌：這門課在做什麼？

```text
Node.js 基礎
  → Express 做 API
  → 登入、JWT、權限
  → SQL 與資料庫設計
  → 查詢效能與索引
  → TypeORM 專案化
  → Docker、Compose、CI
```

一個完整後端請求最後會長得像這樣：

```text
Client
  → route（辨識網址與 HTTP 方法）
  → middleware（驗證、解析、記錄）
  → controller（處理 HTTP 請求）
  → repository / database
  → 統一格式的 response
```

## 使用方式

1. **第一次複習**：每個 Day 只讀「記住這件事」和「自我檢查」。
2. **第二次複習**：把每個單元的迷你練習做一次。
3. **寫專題前**：優先回讀 Day 16、22–23、35、38–46。
4. **除錯時**：先看錯誤在哪一層，再查對應的 Day；不要一開始就亂改程式。

---

# 1. Node.js 與 Express 基礎（Day 1–11）

## Day 1｜模組化與 `fs/promises`

**記住這件事：** 一個檔案只負責一類事情；檔案操作優先用 `fs/promises` 搭配 `async/await`。

- `module.exports` 匯出功能，`require()` 匯入功能。
- `readFile` 要指定 `'utf-8'`，不然得到的是 Buffer。
- `writeFile` 會覆寫、`appendFile` 會接在檔尾、`mkdir({ recursive: true })` 可連上層資料夾一起建立。
- 任何可能失敗的檔案操作都放在 `try...catch`。

**自我檢查：** 為什麼不要把讀檔、商業邏輯與伺服器啟動都塞進 `app.js`？

[原講義](https://hackmd.io/LZCbpJ2LQpSA_X-IZUActw?view)

## Day 2｜單一職責原則（SRP）

**記住這件事：** 一個函式或模組應該只有一個「改變的理由」。

- `validateUser()` 負責驗證，不順便寫資料庫或回應 HTTP。
- 把會一起變動的程式放在一起；把不同原因才會變的程式拆開。
- 拆分的目標是降低理解與修改成本，不是把每一行都拆成一個檔案。

**自我檢查：** 若修改密碼規則會同時碰到寄信、資料庫與路由，哪一段責任切得不夠乾淨？

[原講義](https://hackmd.io/ZPqNRjY-TUiW7SJ5uiLkBw?view)

## Day 3｜環境變數：`process.env`、`.env`、dotenv

**記住這件事：** 程式碼與環境設定分開；密碼、連線字串、JWT 密鑰不能寫死在程式裡。

- `process.env` 是 Node.js 讀取環境變數的入口。
- `.env` 是本機開發方便使用的設定檔；不要提交到 Git。
- `dotenv` 負責把 `.env` 載入 `process.env`。
- 提供 `.env.example`，只保留欄位名稱、不放真正機密。

**自我檢查：** 為什麼部署到正式環境時不該依賴倉庫裡的 `.env`？

[原講義](https://hackmd.io/iX8o6ckZR3uIdSWQ_wgj-A?view)

## Day 4｜Node 內建 `http`

**記住這件事：** HTTP 伺服器的核心就是「收到 request，判斷後寫 response」。

- request 常用資訊：方法、網址、header、body。
- response 要決定狀態碼、header 與內容；JSON 回應要正確設定內容型別。
- Node 內建 `http` 能讓你理解底層，但專案通常用 Express 降低重複工作。

**自我檢查：** `404`、`400`、`500` 分別代表誰出了什麼問題？

[原講義](https://hackmd.io/817kBdgkTYSwzrIIhwdt9A?view)

## Day 5｜formidable 與檔案上傳

**記住這件事：** 上傳檔案不是一般 JSON body；要用能解析 `multipart/form-data` 的工具。

- formidable 負責解析欄位與檔案。
- 要限制可接受的檔案類型、大小與儲存位置。
- 不要直接信任原始檔名；產生安全檔名，並妥善處理失敗與暫存檔。

**自我檢查：** 為什麼「只檢查副檔名」不足以保護檔案上傳？

[原講義](https://hackmd.io/7MEEiyr_Szi65frJn17seg?view)

## Day 6–8｜路由、Express 與 URL 資料

### Day 6｜路由設計

**記住這件事：** 路由由 HTTP 方法與路徑共同決定；把 API 視為「資源」而非動詞集合。

- `GET /users` 取集合、`GET /users/:id` 取單筆。
- `POST /users` 建立、`PATCH /users/:id` 修改部分資料、`DELETE /users/:id` 刪除。
- 路徑命名要一致，避免 `getUsers`、`userList`、`users` 混用。

[原講義](https://hackmd.io/NEQXdyTTTcic6uxqHNPbXg?view)

### Day 7｜Express 入門

**記住這件事：** `express()` 建立應用，`app.get/post/...` 定義處理規則，`res` 負責回應。

- 常用回應：`res.status(...).json(...)`、`res.send(...)`。
- Express 讓 routing、middleware 與回應處理有一致寫法。
- 伺服器啟動前應先把設定與依賴準備好。

[原講義](https://hackmd.io/hmdYIyjOQ_uXvxjmjXj59g?view)

### Day 8｜`req.params`、`req.query` 與網址規則

**記住這件事：** 資料放的位置代表它的語意。

| 來源 | 範例 | 適合用途 |
| --- | --- | --- |
| `req.params` | `/users/42` 的 `42` | 指定某個資源 |
| `req.query` | `/users?page=2` | 篩選、排序、分頁 |
| `req.body` | `POST` 的 JSON | 建立或修改的資料 |

**自我檢查：** 搜尋關鍵字應放 `params` 還是 `query`？為什麼？

[原講義](https://hackmd.io/efl34vvNRUahl-zs5andDQ?view)

## Day 9–11｜Middleware、Router 與 CRUD

### Day 9｜Middleware

**記住這件事：** Middleware 是請求途中可重複使用的關卡；順序會改變結果。

- Middleware 有 `req`、`res`、`next`；要往下走就呼叫 `next()`。
- 常見用途：解析 JSON、紀錄請求、驗證登入、集中錯誤處理。
- 先掛解析 body 的 middleware，再使用 `req.body`；錯誤處理 middleware 放最後。

[原講義](https://hackmd.io/8Nbuef24QLeW2Uy68MTZxw?view)

### Day 10｜Router 拆分

**記住這件事：** `express.Router()` 把同一資源的路由放在一起，再以路徑前綴掛回主程式。

- 主程式：`app.use('/api/users', userRouter)`。
- Router 內：`router.get('/')`，最終路徑才會是 `/api/users`。
- 拆 Router 是為了讓 `app.js` 只做組裝，不承擔全部功能。

[原講義](https://hackmd.io/8h-HH5WvSeClpuzKCLtFFA?view)

### Day 11｜CRUD 與資料驗證

**記住這件事：** 寫入前先驗證；錯誤要回對狀態碼，不要讓不合法資料進系統。

- CRUD：Create、Read、Update、Delete。
- 把驗證規則做成 helper，避免每條路由各寫一份。
- 分清楚「格式錯誤」（400）、「找不到資料」（404）與「伺服器例外」（500）。

[原講義](https://hackmd.io/gMFdvWuCRR21CWDcQI5rSw?view)

---

# 2. 身分驗證與授權（Day 12–16、43）

## Day 12｜密碼安全與 bcrypt

**記住這件事：** 密碼只能雜湊，不能可逆地「加密後存起來」。

- Hash 是單向摘要；登入時用 `bcrypt.compare()` 比對。
- Salt 讓相同密碼產生不同雜湊，降低彩虹表攻擊風險。
- 註冊：`hash` 後存入資料庫；登入：取出 hash 後 compare。

[原講義](https://hackmd.io/HnJobkdXSbiizaN1qufu-A?view)

## Day 13–14｜JWT 簽發與驗證

**記住這件事：** JWT 是帶簽章的身分聲明，不是用來存密碼或敏感資料的資料庫。

- 結構：`header.payload.signature`；payload 可以被解碼閱讀，**不能**放機密。
- 登入成功後用 `jwt.sign()` 簽發，並設定有效期限。
- 客戶端以 `Authorization: Bearer <token>` 傳送。
- 在自訂 middleware 中以 `jwt.verify()` 驗證；成功後把必要身分資料放到 `req.user`。

**高頻錯誤：** 驗證失敗後還繼續 `next()`、忘記處理過期 token、把 token 當成授權的唯一判斷。

[Day 13 原講義](https://hackmd.io/gI-k28j2RJWxQgGPCrwvpg?view) ｜ [Day 14 原講義](https://hackmd.io/QEFjZzKARr6OW6aS_F9AcA?view)

## Day 15–16｜Middleware 分類與 Auth 流程整合

**記住這件事：** Middleware 分為全域、路由層級與錯誤處理；Auth 是一條完整流程，不是一個 token 函式。

```text
註冊：驗證輸入 → bcrypt hash → 建立使用者
登入：查使用者 → bcrypt compare → 簽發 JWT
受保護 API：讀 Bearer token → verify → req.user → 執行業務邏輯
```

- 全域 middleware：例如 JSON 解析、request log。
- 路由 middleware：只保護需要登入的 API。
- 錯誤 middleware 有四個參數：`(err, req, res, next)`，且必須放在最後。

[Day 15 原講義](https://hackmd.io/vJ5gim84Sv2LXdInP1Xe-w?view) ｜ [Day 16 原講義](https://hackmd.io/qbFwHRwiQwWW-sn4ae_AvQ?view)

## Day 43｜角色授權與資料所有權

**記住這件事：** 驗證（你是誰）與授權（你能做什麼）是兩回事；角色正確也不代表那筆資料屬於你。

- 角色檢查：例如只有 `admin` 能管理全站資料。
- 所有權檢查：編輯文章前，確認 `resource.ownerId === req.user.id`。
- owner ID 必須來自已驗證的 `req.user`，不要相信 body 或 query 裡自稱的 user ID。

[原講義](https://hackmd.io/javnzU6mTzKc-MSBWKLwJg?view)

---

# 3. SQL 與關聯資料（Day 17–26）

## SQL 寫法順序

```sql
SELECT 欄位
FROM 資料表
WHERE 列條件
GROUP BY 分組欄位
HAVING 群組條件
ORDER BY 排序欄位
LIMIT 筆數;
```

## Day 17–21｜基本查詢與資料異動

| Day | 你要會的事 | 最容易錯的點 | 原講義 |
| --- | --- | --- | --- |
| 17 | 看懂 row、column、table；用 `SELECT` 指定欄位 | `SELECT *` 方便但常取太多資料 | [Day 17](https://hackmd.io/drGf8mZOSKGJUtop-izATw?view) |
| 18 | 用 `WHERE`、比較運算子、`AND/OR`、`IN/BETWEEN` 篩資料 | `AND` 與 `OR` 混用時忘了括號 | [Day 18](https://hackmd.io/rsm84agpSUWPmzHyqqsg3Q?view) |
| 19 | `ORDER BY` 排序、`LIMIT` 取前幾筆 | 沒有穩定排序就做 `LIMIT` | [Day 19](https://hackmd.io/QaFAwaZORI-ZHaCVN_ecuw?view) |
| 20 | `INSERT`、`UPDATE`、`DELETE` 寫入資料 | `UPDATE/DELETE` 忘記 `WHERE` | [Day 20](https://hackmd.io/IKZVfq82T-KznYx1lZR4QQ?view) |
| 21 | 把上述語法組成真實後台查詢 | 只背語法，沒有先說清楚要找哪一批資料 | [Day 21](https://hackmd.io/JFzG2MdDQn-92Rw5VleDfA?view) |

## Day 22–23｜關聯與 JOIN

**記住這件事：** PK 用來唯一辨識，FK 用來描述關係；資料拆表是為了避免重複與不一致。

- 一對多：一位作者有多篇文章；FK 通常放在「多」的一側。
- 多對多：文章與標籤要有中介表，例如 `post_tags`。
- `INNER JOIN`：只留下兩邊都對得上的資料。
- `LEFT JOIN`：保留左表全部資料；右表沒有對應時會是 `NULL`。
- 使用資料表別名讓 JOIN 可讀：`posts p JOIN users u ...`。

**自我檢查：** 要找出「還沒有文章的作者」，應偏向哪一種 JOIN？

[Day 22 原講義](https://hackmd.io/0CcO2FaJQQW0iHTjl8KWKg?view) ｜ [Day 23 原講義](https://hackmd.io/ck8gKs1uRj6BnvRZlCAaSA?view)

## Day 24–26｜加工、統計與子查詢

| 概念 | 用途 | 關鍵提醒 | 原講義 |
| --- | --- | --- | --- |
| `COALESCE`、字串／日期／數字函式、`CASE` | 整理查詢輸出、處理 `NULL`、依條件分類 | `NULL` 不是空字串，也不能用 `= NULL` 比較 | [Day 24](https://hackmd.io/My_AmgaJQTSh26xuo9Yfvw?view) |
| `GROUP BY` 與聚合 | `COUNT`、`SUM`、`AVG`、`MIN`、`MAX` 統計每一群 | `WHERE` 篩列，`HAVING` 篩分組後結果 | [Day 25](https://hackmd.io/M8qD5DwPQ2qtA3XBHdu3dg?view) |
| 子查詢 | 把一段 `SELECT` 當條件、欄位或衍生表 | 先獨立執行內層 `SELECT`，確認結果再包進外層 | [Day 26](https://hackmd.io/a3RqRrg0Ts6aoJVq_6xXAQ?view) |

---

# 4. 查詢效能與索引（Day 27–31）

## 一句話版

索引讓資料庫更快找到資料，但會占空間、拖慢寫入；先量測，再建立；索引無法拯救不適合的查詢寫法。

## Day 27｜`EXPLAIN ANALYZE`

**記住這件事：** 不要憑感覺優化；用執行計畫看資料庫實際怎麼做。

- 注意掃描方式、實際列數、預估列數、時間與迴圈次數。
- 比較優化前後的 `EXPLAIN ANALYZE`，才知道索引是否真的幫上忙。

[原講義](https://hackmd.io/OQ3ShMMuTCe4-5oIwZXNWA?view)

## Day 28–30｜何時建立索引

- 索引通常適合常出現在 `WHERE`、`JOIN`、`ORDER BY ... LIMIT` 的欄位。
- 複合索引要思考條件順序與選擇性：能篩掉越多資料的條件通常越有價值。
- 索引不該無差別建立：小表、低選擇性欄位或很少查詢的欄位可能不值得。
- 索引也能協助排序與 JOIN；但新增、更新、刪除時也要維護索引。

[Day 28](https://hackmd.io/yrFZKFPyRt2g-14Bq5FHcQ?view) ｜ [Day 29](https://hackmd.io/7-2HE3yzQIiTX-7Wu6vbyw?view) ｜ [Day 30](https://hackmd.io/Mc6fCa4eR2mcB-iPr0-rCg?view)

## Day 31｜索引為何失效

**記住這件事：** 常見問題不是「索引不夠」，而是把被索引欄位包在函式或不利於索引的條件裡。

- 先檢查欄位是否被函式／轉型包住。
- 注意前綴萬用字元的模糊搜尋、隱含型別轉換，以及不符合複合索引前導欄位的條件。
- 優先改寫條件，再量測；不要直接再加一個索引。

[原講義](https://hackmd.io/xtDzUP-wQiWL0oZ-f5-d6Q?view)

---

# 5. TypeORM 與可維護的後端專案（Day 32–42）

## Day 32–36｜從資料庫結構到資料種子

| Day | 重點 | 速記 | 原講義 |
| --- | --- | --- | --- |
| 32 | Migration 管理資料表結構 | 結構是版本化資產，不是手動點出來的結果 | [Day 32](https://hackmd.io/fMB6FKWYSU6pM94Rf4fphw?view) |
| 33 | Entity 描述資料表 | 欄位型別、主鍵、時間欄位與設定集中在 entity | [Day 33](https://hackmd.io/SO6OvYq4Rl2PoH1YXHh8Yw?view) |
| 34 | 在 ORM 表達一對多、多對多 | 先畫關聯，再決定 FK 與中介表 | [Day 34](https://hackmd.io/PZk00lsDRaKg5nIN3XJ2Rw?view) |
| 35 | `synchronize` 與 migration | 正式環境用 `synchronize: false`，由 migration 管理 | [Day 35](https://hackmd.io/V_QKZeITQdW_Peart2NnFA?view) |
| 36 | Seeder 建立可重複的示範資料 | 先寫被依賴資料，再寫有 FK 的資料 | [Day 36](https://hackmd.io/fWoSprA8SE-fVu6qNVX5kQ?view) |

## Day 37｜看懂 OpenAPI / Swagger

看一支 API 時，照這個順序：

1. **method + path**：它要對哪個資源做什麼？
2. **參數位置**：path、query、header、body 各放什麼？
3. **必填與格式**：少了欄位會怎樣？
4. **response 與狀態碼**：成功與失敗格式是什麼？
5. **授權**：是否先在 Swagger 按 Authorize 設定 Bearer token？

[原講義](https://hackmd.io/Kph_8pErS6iVrwrfyYD5fA)

## Day 38｜資料庫連線與健康檢查

**記住這件事：** 先確認資料庫可用，再啟動 HTTP 服務；連線設定放環境變數。

- `DataSource.initialize()` 成功後再 `listen()`。
- 連線池可避免每個 request 都新建連線，但 poolSize 不能憑直覺設很大。
- Health check 是「活著嗎」；readiness check 是「現在能服務嗎」。

[原講義](https://hackmd.io/WDu5nM3mTAquTD5L10DS9g?view)

## Day 39｜專案分層

| 層 | 主要責任 | 不該做的事 |
| --- | --- | --- |
| routes | 對應 HTTP method/path，串 middleware | 塞進複雜商業邏輯 |
| controllers | 讀取 request、呼叫處理邏輯、決定 response | 直接堆大量 SQL／ORM 細節 |
| services／資料存取層 | 商業規則與資料庫操作 | 依賴 Express 的 `req`、`res` |

**自我檢查：** 若同一份業務規則之後要被 CLI、排程與 HTTP API 共用，應放在哪一層？

[原講義](https://hackmd.io/5kOCzdneS_KZxw2yxO2ISw?view)

## Day 40｜TypeORM Repository

**記住這件事：** Repository 是某張表的資料操作入口。

- 查詢：`where`、`select`、`order`；需要關聯資料時指定 `relations`。
- 新增：`create()` 建立 entity，`save()` 寫入或儲存變更。
- `update()` 適合直接更新；需要 entity hooks、關聯或完整流程時要確認使用情境。
- 複雜查詢改用 `createQueryBuilder()`，保持條件可讀、可參數化。

[原講義](https://hackmd.io/B8V14IlCRFSfdNurgP0yRg?view)

## Day 41｜軟刪除與狀態欄位

**記住這件事：** 「資料不見」與「資料不可用」不一定是同一件事。

- 硬刪除：資料真的移除。
- 軟刪除：保留資料、標記刪除時間，可依需求復原。
- 業務狀態：如 `draft`、`published`、`suspended`，是業務規則，不等同軟刪除。
- 加了狀態後，每個查詢都要重新思考是否應顯示該資料。

[原講義](https://hackmd.io/MNrCL8oIRUqPS2TPS5k1dA?view)

## Day 42｜統一 API 回應與集中錯誤處理

**記住這件事：** 回應格式一致，前端與維護者才不必猜；內部錯誤細節不能直接暴露給使用者。

建議回應結構：

```json
{
  "success": true,
  "message": "操作成功",
  "data": {}
}
```

- 可預期錯誤：驗證失敗、找不到資料、無權限；給清楚但安全的訊息。
- 非預期錯誤：完整記錄在伺服器端，對外只給必要訊息。
- Controller 盡量把錯誤交給集中 error middleware，不要每條路由各自回一種格式。

[原講義](https://hackmd.io/40D1Rqi2Rwy420QOFS33NA?view)

---

# 6. Docker 與持續整合（Day 44–46）

## Day 44｜Docker 容器基礎

**記住這件事：** Image 是可重複製作的藍圖；Container 是由 Image 跑起來的實例。

- Dockerfile 描述如何建 Image。
- `COPY package*.json` 後先安裝依賴，再 `COPY . .`，可善用快取加速 build。
- `.dockerignore` 排除 `node_modules`、機密與不需要的檔案。
- port 對應是主機 port 與容器 port 的映射，不是「打開所有 port」。

[原講義](https://hackmd.io/VZZdoOG3Tn6y8egMfBPGFQ?view)

## Day 45｜Docker Compose 多服務編排

**記住這件事：** Compose 用一份檔案定義 API、DB 等整套開發環境。

- 服務之間在同一 Compose network，可用**服務名稱**連線，例如 DB host 寫 `db`。
- `ports: ["主機:容器"]`；容器彼此連線通常使用容器 port。
- `depends_on` 只控制啟動先後，不保證資料庫已準備好；程式仍要處理重試或 readiness。
- Named volume 讓資料庫容器重建後仍保留資料。

[原講義](https://hackmd.io/tG1zsTo2R9CpS-YPU2S_fQ?view=)

## Day 46｜測試結果與 CI

**記住這件事：** 測試驗證的是使用者看得到的行為；CI 在每次 push 後用乾淨環境重跑檢查。

- 先讀失敗訊息：預期值、實際值、失敗位置與堆疊。
- 失敗不一定是程式邏輯錯：可能是環境變數、資料庫、時區、依賴版本或測試資料不同。
- CI 常見流程：安裝依賴 → lint／型別檢查 → 測試 → build。
- 「本機會過、CI 失敗」時，先比較 Node 版本、env、資料庫服務與安裝方式。

[原講義](https://hackmd.io/KUSBQB9uTqKtS2o5a4Cdlw?view)

---

# 考前 15 分鐘速讀卡

1. **`.env`**：設定與程式分離，機密不進 Git。
2. **`req.params/query/body`**：資源 ID／篩選分頁／寫入資料。
3. **Middleware**：`next()` 決定是否往下；順序很重要。
4. **bcrypt**：存 hash，登入用 compare，永不存明碼。
5. **JWT**：證明身分，不放敏感資料；verify 後才有 `req.user`。
6. **Authentication vs Authorization**：你是誰 vs 你可不可以。
7. **`WHERE` vs `HAVING`**：篩資料列 vs 篩分組結果。
8. **`INNER JOIN` vs `LEFT JOIN`**：只要配對成功 vs 左邊全保留。
9. **索引**：先 `EXPLAIN ANALYZE`，不是越多越好。
10. **複合索引**：重視前導欄位與選擇性。
11. **Migration**：用版本管理結構；正式環境不要靠自動同步。
12. **Repository**：資料表的操作入口；複雜查詢用 QueryBuilder。
13. **軟刪除**：資料保留但預設不顯示；狀態欄位是另一件事。
14. **Docker**：Image 是藍圖、Container 是執行中實體。
15. **Compose / CI**：服務名稱可互連；CI 用乾淨環境驗證每次 push。

# 10 題自我測驗

1. `GET /products/8?sort=price` 中，`8` 與 `price` 分別從哪裡取？
2. 為什麼 `UPDATE users SET role = 'admin'` 很危險？
3. 找「沒有文章的作者」該用哪種 JOIN？
4. 為什麼 `WHERE DATE(created_at) = ...` 可能讓索引沒被好好使用？
5. 註冊與登入時，bcrypt 各做什麼？
6. JWT 驗證成功後，為什麼還要做資料所有權檢查？
7. migration 與 seeder 各自在管理什麼？
8. 為什麼資料庫連線成功後才應啟動 HTTP server？
9. `depends_on` 不能保證什麼？
10. CI 失敗時，除了程式碼，你會先比較哪三種環境差異？

# 7 天複習排程

| 天數 | 範圍 | 產出 |
| --- | --- | --- |
| 第 1 天 | Day 1–8 | 寫一個含 params、query、body 的 Express 小 API |
| 第 2 天 | Day 9–16、43 | 完成註冊、登入、受保護路由與所有權檢查 |
| 第 3 天 | Day 17–21 | 用一份假資料完成 10 個 SELECT／異動查詢 |
| 第 4 天 | Day 22–26 | 畫 ERD，寫 JOIN、GROUP BY、子查詢 |
| 第 5 天 | Day 27–31 | 對一條慢查詢做 `EXPLAIN ANALYZE` 與索引比較 |
| 第 6 天 | Day 32–42 | 用 TypeORM 完成 migration、entity、repository 與統一錯誤回應 |
| 第 7 天 | Day 44–46 | 用 Docker Compose 跑 API + DB，並讓測試在 CI 可重跑 |

---

## 最後的專題驗收清單

- [ ] 環境變數與 `.env.example` 都整理好了。
- [ ] 路由、controller、資料存取邏輯沒有全部混在同一個檔案。
- [ ] 所有寫入 API 都有驗證、適當狀態碼與一致回應格式。
- [ ] 密碼用 bcrypt、受保護路由有 JWT 驗證、修改資料有所有權檢查。
- [ ] migration、entity、seeder 能在新環境建立可用資料庫。
- [ ] 慢查詢有量測過，索引不是憑直覺建立。
- [ ] Docker / Compose 能從乾淨環境啟動；測試可在 CI 重跑。
