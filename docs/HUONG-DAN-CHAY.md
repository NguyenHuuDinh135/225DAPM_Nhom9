# Huong Dan Chay Ung Dung - Quan Ly Cay Xanh Da Nang

## Tong Quan

He thong quan ly cay xanh do thi thanh pho Da Nang gom 3 thanh phan chinh:

| Thanh phan | Cong nghe | Cong |
|------------|-----------|------|
| Backend API | .NET 10 + Aspire | 5000 |
| Frontend Web | Next.js 16 + Bun | 3000 |
| AI Engine | Ollama (local) | 11434 |

Ha tang phu tro (tu dong boi Aspire):
- **PostgreSQL** — co so du lieu chinh
- **Redis** — bo nho dem (cache)

---

## Yeu Cau He Thong

### Phan mem bat buoc

| Phan mem | Phien ban toi thieu | Cach cai |
|----------|---------------------|----------|
| .NET SDK | 10.0 | https://dot.net/download |
| Bun | 1.1+ | `curl -fsSL https://bun.sh/install \| bash` |
| Docker | 24+ | https://docs.docker.com/get-docker |
| Ollama | 0.23+ | https://ollama.com/download |
| Git | 2.40+ | `sudo pacman -S git` (Arch) |

### Phan cung khuyen nghi

- RAM: toi thieu 16GB (khuyen nghi 32GB de chay AI model 7B)
- CPU: 4 nhan tro len
- O cung: 15GB trong cho models + database
- GPU: khong bat buoc (chay CPU duoc)

---

## Buoc 1: Clone Du An

```bash
git clone https://github.com/NguyenHuuDinh135/225DAPM_Nhom9.git
cd 225DAPM_Nhom9
```

---

## Buoc 2: Cai Dat Ollama va Tai Models

### 2.1 Cai Ollama

```bash
# Linux
curl -fsSL https://ollama.com/install.sh | sh

# Kiem tra da cai thanh cong
ollama --version
```

### 2.2 Tai cac model AI

```bash
# Model chinh - suy luan (4.7GB, mat ~5 phut)
ollama pull qwen2.5:7b

# Model nhanh - phan loai (<1s phan hoi)
ollama pull qwen2.5-coder:0.5b

# Model embedding - tim kiem ngu nghia
ollama pull nomic-embed-text
```

### 2.3 Kiem tra Ollama dang chay

```bash
# Ollama tu dong chay sau khi cai, kiem tra:
curl http://localhost:11434/api/tags

# Ket qua mong doi: danh sach models da tai
```

Neu Ollama chua chay:
```bash
ollama serve
```

---

## Buoc 3: Chay Backend

### Cach 1: Dung Aspire (Khuyen nghi — tu dong khoi tao PostgreSQL + Redis)

```bash
cd backend/src/AppHost
dotnet run --no-launch-profile
```

Aspire se tu dong:
- Khoi tao container PostgreSQL (port ngau nhien)
- Khoi tao container Redis (port ngau nhien)
- Chay API tren port **5000**
- Tu dong chay EF Core Migrations (tao bang)

### Cach 2: Dung script co san

```bash
# Chi chay backend (khong co frontend)
./run-apphost.sh

# Hoac chay ca backend + frontend
./dev.sh
```

### Kiem tra backend hoat dong

```bash
# Health check
curl http://localhost:5000/health

# Kiem tra AI ket noi Ollama
curl http://localhost:5000/api/ai/health
# Ket qua: {"available":true}
```

---

## Buoc 4: Chay Frontend

### 4.1 Cai dependencies

```bash
cd frontend
bun install
```

### 4.2 Chay development server

```bash
# Cach 1: Chi chay web app
cd frontend/apps/web
bun run dev

# Cach 2: Chay toan bo workspace (bao gom UI library)
cd frontend
bun turbo dev
```

Frontend chay tai: **http://localhost:3000**

### 4.3 Proxy API

Frontend tu dong proxy cac request `/api/*` sang `http://localhost:5000` (cau hinh trong `next.config.mjs`). Khong can cau hinh them.

---

## Buoc 5: Dang Nhap va Su Dung

### Tai khoan mac dinh (sau khi seed data)

| Vai tro | Email | Mat khau |
|---------|-------|----------|
| Giam Doc | giamdoc@test.com | Test@123 |
| Doi Truong | doitruong@test.com | Test@123 |
| Nhan Vien | nhanvien@test.com | Test@123 |

### Cac trang chinh

| URL | Mo ta |
|-----|-------|
| http://localhost:3000 | Trang chu cong dong |
| http://localhost:3000/login | Dang nhap |
| http://localhost:3000/giamdoc | Dashboard Giam Doc |
| http://localhost:3000/doitruong | Dashboard Doi Truong |
| http://localhost:3000/nhanvien | Dashboard Nhan Vien |

---

## Tinh Nang AI

### Cac tinh nang da tich hop

| Tinh nang | Mo ta | Thoi gian phan hoi |
|-----------|-------|--------------------|
| Chat AI | Tro ly thong minh ho tro quan ly cay xanh | 3-8 giay (streaming) |
| Phan loai su co | Tu dong danh gia muc do nghiem trong | <2 giay |
| Du doan bao tri | Du bao cay nao can bao tri tiep theo | 5-10 giay (cache 30 phut) |
| Phat hien bat thuong | Tim cay co tinh trang bat thuong | 5-10 giay (cache 5 phut) |
| De xuat ke hoach | Goi y ke hoach bao tri chi tiet | 5-8 giay |
| Bao cao AI | Tao bao cao tom tat tu dong | 8-15 giay |

### Su dung Chat AI

1. Dang nhap voi bat ky vai tro nao
2. Nhan vao nut **Sparkles** (goc duoi ben phai)
3. Nhap cau hoi hoac chon goi y nhanh:
   - "Cay nao can bao tri?"
   - "Tong hop su co hom nay"
   - "De xuat ke hoach tuan toi"

### Kiem tra tinh trang AI

- Badge **AI Online** (mau xanh) = Ollama dang hoat dong
- Badge **AI Offline** (mau do) = Ollama chua chay hoac loi ket noi

---

## Chay Toan Bo Bang 1 Lenh

```bash
# Tu thu muc goc du an
./dev.sh
```

Script nay se:
1. Tat cac process cu (dotnet, next-dev, turbo)
2. Khoi dong backend (Aspire + PostgreSQL + Redis)
3. Doi backend san sang (health check port 5000)
4. Khoi dong frontend (port 3000)
5. Hien thi PID de quan ly

**Ctrl+C** de dung toan bo.

---

## Cau Hinh Nang Cao

### Thay doi model AI

Sua file `backend/src/Web/appsettings.Development.json`:

```json
{
  "Ollama": {
    "BaseUrl": "http://localhost:11434",
    "DefaultModel": "qwen2.5:7b",
    "FastModel": "qwen2.5-coder:0.5b",
    "EmbeddingModel": "nomic-embed-text",
    "TimeoutSeconds": 60,
    "MaxTokens": 2048
  }
}
```

- **DefaultModel**: Model chinh cho suy luan (chat, bao cao, du doan)
- **FastModel**: Model nhe cho phan loai nhanh (muc do su co)
- **TimeoutSeconds**: Thoi gian cho toi da moi request
- **MaxTokens**: So token toi da trong phan hoi

### Dung model khac

```bash
# Neu muon dung model nho hon (tiet kiem RAM):
ollama pull qwen2.5:3b
# Sau do doi DefaultModel thanh "qwen2.5:3b"

# Neu co GPU NVIDIA (nhanh hon nhieu):
ollama pull qwen2.5:7b
# Ollama tu dong dung GPU neu co
```

### Cau hinh database

Mac dinh Aspire tu dong tao PostgreSQL container. Neu muon dung database co san:

Sua `backend/src/Web/appsettings.Development.json`:
```json
{
  "ConnectionStrings": {
    "backendDb": "Host=localhost;Port=5432;Database=QLCayXanh;Username=postgres;Password=your_password;"
  }
}
```

---

## Xu Ly Loi Thuong Gap

### Loi: "Ollama connection refused"

```bash
# Kiem tra Ollama dang chay
systemctl status ollama
# Hoac khoi dong lai
ollama serve
```

### Loi: "Port 5000 already in use"

```bash
# Tim va tat process dang dung port 5000
lsof -i :5000
kill -9 <PID>
```

### Loi: "bun: command not found"

```bash
curl -fsSL https://bun.sh/install | bash
source ~/.bashrc  # hoac ~/.zshrc
```

### Loi: "Docker daemon not running"

```bash
sudo systemctl start docker
# Kiem tra
docker ps
```

### Loi: Frontend khong ket noi duoc API

- Dam bao backend dang chay tren port 5000
- Kiem tra: `curl http://localhost:5000/health`
- Frontend proxy tu dong `/api/*` → `localhost:5000`

### Loi: AI phan hoi cham (>30 giay)

- Binh thuong voi CPU-only, model 7B mat 5-50 giay tuy do phuc tap
- Giam `MaxTokens` xuong 1024 de nhanh hon
- Hoac dung model nho hon: `qwen2.5:3b`

### Loi: Khong co du lieu khi dang nhap

Database moi chua co du lieu. Can chay migration va seed:
```bash
cd backend/src/Web
dotnet ef database update
```
Aspire tu dong chay migration khi khoi dong.

---

## Cau Truc Thu Muc Chinh

```
225DAPM_Nhom9/
├── backend/
│   └── src/
│       ├── AppHost/          # Aspire orchestrator
│       ├── Web/              # API endpoints, cau hinh
│       ├── Application/      # Business logic (CQRS)
│       ├── Infrastructure/   # EF Core, AI, Redis, file storage
│       └── Domain/           # Entities, enums
├── frontend/
│   ├── apps/web/             # Next.js 16 (trang web chinh)
│   └── packages/ui/          # Thu vien UI dung chung
├── infra/                    # Terraform (AWS deployment)
├── docs/                     # Tai lieu
├── dev.sh                    # Script chay toan bo
└── run-apphost.sh            # Script chi chay backend
```

---

## Lenh Kiem Tra Nhanh

```bash
# Kiem tra backend build thanh cong
dotnet build backend/src/Web/Web.csproj -c Release

# Kiem tra frontend khong loi TypeScript
cd frontend && bun run typecheck

# Kiem tra Ollama va models
curl http://localhost:11434/api/tags

# Kiem tra API health
curl http://localhost:5000/health

# Kiem tra AI health
curl http://localhost:5000/api/ai/health

# Test chat AI (can dang nhap truoc de lay token)
curl -X POST http://localhost:5000/api/ai/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_token>" \
  -d '{"message": "Cay nao can bao tri?"}'
```

---

## Vai Tro Nguoi Dung

| Vai tro | Quyen han |
|---------|-----------|
| **Giam Doc** | Duyet ke hoach, xem bao cao tong hop, quan ly nhan su |
| **Doi Truong** | Quan ly cay, tao ke hoach, phan cong cong viec, xu ly su co |
| **Nhan Vien** | Bao cao tien do, cap nhat tinh trang cay, bao su co |
| **Cong Dan** | Bao su co qua trang cong dong (khong can dang nhap) |

---

## Lien He Ho Tro

- Repository: https://github.com/NguyenHuuDinh135/225DAPM_Nhom9
- Issues: https://github.com/NguyenHuuDinh135/225DAPM_Nhom9/issues
