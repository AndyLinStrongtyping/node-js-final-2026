# FitConnect 面試導覽

這份文件不是背稿，而是協助我在面試時用「問題、決策、驗證」的方式介紹專案。

## 60 秒版本

> FitConnect 是我用 Node.js、Express、TypeORM 和 PostgreSQL 完成的健身課程預約平台。它包含 JWT 登入、會員與教練角色、點數方案、課程管理和預約取消。這個作品最值得談的地方是預約流程：我把檢查點數、檢查名額和建立預約放進資料庫 transaction，並以 pessimistic lock 降低平行請求造成超賣或重複扣點的風險。專案也有 Docker Compose、Swagger 與 68 個 contract tests，GitHub Actions 會自動建立 PostgreSQL 並驗證 API。若要上正式環境，我會優先加入 migration、ADMIN 權限、schema validation、logging 和資料庫唯一約束。

## 5 分鐘導覽順序

1. 從 `docker-compose.yml` 說明 frontend、backend、swagger、postgres 四個服務。
2. 打開 `backend/app.js`，說明 healthcheck、route 組裝與集中式 error handler。
3. 打開 `backend/middlewares/auth.js`，說明 Bearer token 驗證與角色檢查。
4. 打開 `backend/services/booking-service.js`，說明 transaction、lock、點數及名額規則。
5. 打開 `backend/entities/course-booking.js`，說明關聯、軟刪除欄位與歷史資料保留。
6. 打開 `.github/workflows/test.yml`，說明 CI 如何驗證真實 PostgreSQL 與 Docker 啟動流程。

## 面試官可能追問

### 為什麼不能先查名額，再直接新增預約？

兩個請求可能同時看到「還有一個名額」，接著都寫入成功。交易本身只能保證一組操作一起成功或失敗，還要搭配合適的鎖或 constraint 才能處理競爭條件。現在的實作會鎖定會員與課程；下一步會再加入資料庫唯一條件與更完整的並行測試。

### 為什麼取消不直接刪除資料？

預約是商業紀錄。用 `cancelled_at` 保留取消時間，能支援客服查詢、行為分析與日後稽核；查詢有效預約或營收時再排除已取消紀錄。

### 為什麼購買紀錄要存 `purchased_credits` 和 `price_paid`？

方案會改價。若歷史紀錄只關聯目前方案，過去交易金額會跟著變。購買當下存快照才能保存正確歷史。

### JWT 有什麼限制？

已簽發 token 在到期前通常仍有效。若產品需要登出失效、停權或裝置管理，可增加 refresh token、token version、deny list，或改用伺服器端 session。正式環境也應使用短效 access token 與安全的 secret 管理。

### `synchronize: true` 可以上正式環境嗎？

不建議。它適合本機教學和快速驗證；正式環境應使用可審查、可回滾的 migration，並在部署流程中管理 schema 版本。

### 如何觀察正式環境問題？

目前只有 healthcheck。下一步會加入 request ID、結構化 log、錯誤追蹤、延遲與錯誤率 metrics，再以 dashboard 和 alert 監控 API、DB connection pool 與慢查詢。

## 誠實說明邊界

- 前端畫面、OpenAPI 規格與驗收測試來自課程。
- 我的主要成果是後端實作、資料模型、商業規則與容器整合。
- 專案尚未跑過真實流量，不能宣稱是 production-ready；可以說它具備接近正式開發流程的基礎。

## 下一輪最值得做的改善

1. 為管理 API 加入 ADMIN 角色與授權測試。
2. 將 TypeORM synchronize 改為 migration。
3. 在 `course_bookings` 增加唯一約束並補並行預約測試。
4. 加入 Zod / Joi 等 request schema 驗證。
5. 部署至 AWS 或其他雲端，補上 CI/CD、秘密管理、監控與 HTTPS。
