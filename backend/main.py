"""
Actually — Stock Market Simulator Backend
FastAPI + SQLite/Postgres | Market Engine + News Bias + JWT Auth + WebSocket
"""

import os, time, random, sqlite3, asyncio
from datetime import datetime, timedelta, timezone
from contextlib import asynccontextmanager
from urllib.parse import quote

import httpx
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Depends, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from jose import jwt, JWTError
from passlib.context import CryptContext

# ──────────────────────────── CONFIG ────────────────────────────
SECRET_KEY = os.getenv("SECRET_KEY", "actually-secret-key-change-in-prod-2026")
ALGORITHM = "HS256"
TOKEN_EXPIRE_HOURS = 24
# Set DATABASE_URL (postgres://...) in production so data survives restarts.
# Without it, a local SQLite file is used (DB_PATH, defaults next to this file).
DATABASE_URL = os.getenv("DATABASE_URL", "")
USE_PG = DATABASE_URL.startswith(("postgres://", "postgresql://"))
DB_PATH = os.getenv("DB_PATH", os.path.join(os.path.dirname(__file__), "actually.db"))
INITIAL_CASH = 1197.60
TICK_INTERVAL = 2        # seconds between price updates
NEWS_INTERVAL = 45       # seconds between news headlines
NEWS_BIAS_DURATION = 180  # seconds a news bias lasts (3 minutes)
PRICE_WALK_PCT = 0.0015  # ±0.15% random walk
NEWS_BIAS_PCT = 0.02     # ±2% bias from news

def utcnow_iso() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")

# ──────────────────────────── DATABASE ──────────────────────────
class DB:
    """Thin wrapper so the same `?`-style SQL runs on SQLite and Postgres."""

    def __init__(self):
        if USE_PG:
            import psycopg
            from psycopg.rows import dict_row
            self.conn = psycopg.connect(DATABASE_URL, row_factory=dict_row)
        else:
            self.conn = sqlite3.connect(DB_PATH, timeout=10)
            self.conn.row_factory = sqlite3.Row
            self.conn.execute("PRAGMA journal_mode=WAL")

    def execute(self, sql: str, params: tuple = ()):
        if USE_PG:
            sql = sql.replace("?", "%s")
        return self.conn.execute(sql, params)

    def commit(self):
        self.conn.commit()

    def rollback(self):
        self.conn.rollback()

    def close(self):
        self.conn.close()

    def __enter__(self):
        return self

    def __exit__(self, exc_type, *_):
        if exc_type:
            self.rollback()
        self.close()

def get_db() -> DB:
    return DB()

def init_db():
    pk = "SERIAL PRIMARY KEY" if USE_PG else "INTEGER PRIMARY KEY AUTOINCREMENT"
    real = "DOUBLE PRECISION" if USE_PG else "REAL"
    with get_db() as db:
        for stmt in (
            f"""CREATE TABLE IF NOT EXISTS users (
                id {pk},
                username TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                cash {real} DEFAULT {INITIAL_CASH},
                display_name TEXT
            )""",
            f"""CREATE TABLE IF NOT EXISTS positions (
                id {pk},
                user_id INTEGER NOT NULL REFERENCES users(id),
                ticker TEXT NOT NULL,
                shares {real} NOT NULL DEFAULT 0,
                avg_price {real} NOT NULL DEFAULT 0,
                UNIQUE(user_id, ticker)
            )""",
            f"""CREATE TABLE IF NOT EXISTS trades (
                id {pk},
                user_id INTEGER NOT NULL REFERENCES users(id),
                ticker TEXT NOT NULL,
                side TEXT NOT NULL,
                shares {real} NOT NULL,
                price {real} NOT NULL,
                total {real} NOT NULL,
                realized_pnl {real},
                created_at TEXT NOT NULL
            )""",
            "CREATE INDEX IF NOT EXISTS idx_trades_user ON trades(user_id, id)",
        ):
            db.execute(stmt)
        db.commit()
        # Migrate older DBs that predate display_name
        if USE_PG:
            db.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS display_name TEXT")
            db.commit()
        else:
            cols = [r["name"] for r in db.execute("PRAGMA table_info(users)").fetchall()]
            if "display_name" not in cols:
                db.execute("ALTER TABLE users ADD COLUMN display_name TEXT")
                db.commit()

# ──────────────────────────── AUTH UTILS ─────────────────────────
pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

def create_token(user_id: int, username: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(hours=TOKEN_EXPIRE_HOURS)
    return jwt.encode({"sub": str(user_id), "username": username, "exp": expire}, SECRET_KEY, algorithm=ALGORITHM)

def verify_token(creds: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(creds.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = int(payload["sub"])
        return {"user_id": user_id, "username": payload.get("username")}
    except (JWTError, KeyError, TypeError, ValueError):
        raise HTTPException(status_code=401, detail="Invalid token")

# ──────────────────────────── STOCK DATA ─────────────────────────
STOCKS_DATA = [
    # Technology
    {"ticker": "NVDA",  "name": "NVIDIA Corp",           "sector": "Technology",     "price": 950.00},
    {"ticker": "AAPL",  "name": "Apple Inc",             "sector": "Technology",     "price": 230.50},
    {"ticker": "MSFT",  "name": "Microsoft Corp",        "sector": "Technology",     "price": 475.00},
    {"ticker": "GOOGL", "name": "Alphabet Inc",          "sector": "Technology",     "price": 185.00},
    {"ticker": "META",  "name": "Meta Platforms",        "sector": "Technology",     "price": 620.00},
    {"ticker": "TSM",   "name": "Taiwan Semiconductor",  "sector": "Technology",     "price": 195.00},
    {"ticker": "AVGO",  "name": "Broadcom Inc",          "sector": "Technology",     "price": 235.00},
    {"ticker": "ORCL",  "name": "Oracle Corp",           "sector": "Technology",     "price": 195.00},
    {"ticker": "CRM",   "name": "Salesforce Inc",        "sector": "Technology",     "price": 340.00},
    {"ticker": "AMD",   "name": "AMD Inc",               "sector": "Technology",     "price": 175.00},
    # Consumer / E-Commerce
    {"ticker": "AMZN",  "name": "Amazon.com Inc",        "sector": "Consumer",       "price": 225.00},
    {"ticker": "TSLA",  "name": "Tesla Inc",             "sector": "Consumer",       "price": 345.00},
    {"ticker": "NKE",   "name": "Nike Inc",              "sector": "Consumer",       "price": 105.00},
    {"ticker": "SBUX",  "name": "Starbucks Corp",        "sector": "Consumer",       "price": 98.00},
    {"ticker": "MCD",   "name": "McDonald's Corp",       "sector": "Consumer",       "price": 305.00},
    {"ticker": "DIS",   "name": "Walt Disney Co",        "sector": "Consumer",       "price": 115.00},
    {"ticker": "NFLX",  "name": "Netflix Inc",           "sector": "Consumer",       "price": 1050.00},
    {"ticker": "COST",  "name": "Costco Wholesale",      "sector": "Consumer",       "price": 1020.00},
    # Finance
    {"ticker": "JPM",   "name": "JPMorgan Chase",        "sector": "Finance",        "price": 255.00},
    {"ticker": "V",     "name": "Visa Inc",              "sector": "Finance",        "price": 340.00},
    {"ticker": "MA",    "name": "Mastercard Inc",        "sector": "Finance",        "price": 530.00},
    {"ticker": "BAC",   "name": "Bank of America",       "sector": "Finance",        "price": 44.00},
    {"ticker": "GS",    "name": "Goldman Sachs",         "sector": "Finance",        "price": 620.00},
    {"ticker": "BRK.B", "name": "Berkshire Hathaway B",  "sector": "Finance",        "price": 480.00},
    # Healthcare
    {"ticker": "UNH",   "name": "UnitedHealth Group",    "sector": "Healthcare",     "price": 540.00},
    {"ticker": "JNJ",   "name": "Johnson & Johnson",     "sector": "Healthcare",     "price": 162.00},
    {"ticker": "LLY",   "name": "Eli Lilly & Co",        "sector": "Healthcare",     "price": 880.00},
    {"ticker": "PFE",   "name": "Pfizer Inc",            "sector": "Healthcare",     "price": 28.00},
    {"ticker": "ABBV",  "name": "AbbVie Inc",            "sector": "Healthcare",     "price": 195.00},
    {"ticker": "MRK",   "name": "Merck & Co",            "sector": "Healthcare",     "price": 128.00},
    # Energy
    {"ticker": "XOM",   "name": "Exxon Mobil",           "sector": "Energy",         "price": 118.00},
    {"ticker": "CVX",   "name": "Chevron Corp",          "sector": "Energy",         "price": 162.00},
    {"ticker": "COP",   "name": "ConocoPhillips",        "sector": "Energy",         "price": 115.00},
    {"ticker": "NEE",   "name": "NextEra Energy",        "sector": "Energy",         "price": 78.00},
    {"ticker": "SLB",   "name": "Schlumberger",          "sector": "Energy",         "price": 52.00},
    # Industrial
    {"ticker": "CAT",   "name": "Caterpillar Inc",       "sector": "Industrial",     "price": 390.00},
    {"ticker": "BA",    "name": "Boeing Co",             "sector": "Industrial",     "price": 195.00},
    {"ticker": "HON",   "name": "Honeywell Intl",        "sector": "Industrial",     "price": 220.00},
    {"ticker": "UPS",   "name": "United Parcel Service", "sector": "Industrial",     "price": 145.00},
    {"ticker": "GE",    "name": "GE Aerospace",          "sector": "Industrial",     "price": 210.00},
    # Telecom / Media
    {"ticker": "T",     "name": "AT&T Inc",              "sector": "Telecom",        "price": 28.00},
    {"ticker": "VZ",    "name": "Verizon Comm",          "sector": "Telecom",        "price": 44.00},
    {"ticker": "TMUS",  "name": "T-Mobile US",           "sector": "Telecom",        "price": 235.00},
    {"ticker": "CMCSA", "name": "Comcast Corp",          "sector": "Telecom",        "price": 40.00},
    # Semiconductor
    {"ticker": "INTC",  "name": "Intel Corp",            "sector": "Semiconductor",  "price": 24.00},
    {"ticker": "QCOM",  "name": "Qualcomm Inc",          "sector": "Semiconductor",  "price": 185.00},
    {"ticker": "MU",    "name": "Micron Technology",     "sector": "Semiconductor",  "price": 105.00},
    {"ticker": "ASML",  "name": "ASML Holding",          "sector": "Semiconductor",  "price": 750.00},
    # Other
    {"ticker": "WMT",   "name": "Walmart Inc",           "sector": "Consumer",       "price": 92.00},
    {"ticker": "PG",    "name": "Procter & Gamble",      "sector": "Consumer",       "price": 170.00},
]

# ──────────────────────────── NEWS HEADLINES ─────────────────────
NEWS_TEMPLATES = [
    {"headline": "NVIDIA announces next-gen AI chip with 2x performance", "ticker": "NVDA", "sector": None, "bias": 1},
    {"headline": "Apple unveils revolutionary AR glasses at WWDC 2026", "ticker": "AAPL", "sector": None, "bias": 1},
    {"headline": "Tesla recalls 500K vehicles over autopilot concerns", "ticker": "TSLA", "sector": None, "bias": -1},
    {"headline": "Microsoft cloud revenue surges 40% in Q2 2026", "ticker": "MSFT", "sector": None, "bias": 1},
    {"headline": "Google faces $10B antitrust fine from EU regulators", "ticker": "GOOGL", "sector": None, "bias": -1},
    {"headline": "Amazon expands same-day delivery to 50 new cities", "ticker": "AMZN", "sector": None, "bias": 1},
    {"headline": "Meta's Threads surpasses 1 billion monthly users", "ticker": "META", "sector": None, "bias": 1},
    {"headline": "Fed raises interest rates by 25 basis points", "ticker": None, "sector": "Finance", "bias": -1},
    {"headline": "Tech sector rallies on strong AI adoption data", "ticker": None, "sector": "Technology", "bias": 1},
    {"headline": "Oil prices surge amid Middle East supply disruptions", "ticker": None, "sector": "Energy", "bias": 1},
    {"headline": "Healthcare stocks climb on Medicare expansion bill", "ticker": None, "sector": "Healthcare", "bias": 1},
    {"headline": "JPMorgan reports record quarterly profit", "ticker": "JPM", "sector": None, "bias": 1},
    {"headline": "Netflix subscriber growth exceeds analyst expectations", "ticker": "NFLX", "sector": None, "bias": 1},
    {"headline": "Boeing delays 777X deliveries by another 6 months", "ticker": "BA", "sector": None, "bias": -1},
    {"headline": "Semiconductor shortage fears return as demand spikes", "ticker": None, "sector": "Semiconductor", "bias": -1},
    {"headline": "Pfizer's new cancer drug receives FDA fast-track approval", "ticker": "PFE", "sector": None, "bias": 1},
    {"headline": "Consumer spending drops 3% amid inflation concerns", "ticker": None, "sector": "Consumer", "bias": -1},
    {"headline": "Intel announces $20B chip factory in Ohio", "ticker": "INTC", "sector": None, "bias": 1},
    {"headline": "Eli Lilly weight-loss drug sales exceed $5B quarterly", "ticker": "LLY", "sector": None, "bias": 1},
    {"headline": "Global markets tumble on China trade war escalation", "ticker": None, "sector": None, "bias": -1},
    {"headline": "Visa transaction volume hits all-time high", "ticker": "V", "sector": None, "bias": 1},
    {"headline": "Telecom sector faces scrutiny over data privacy practices", "ticker": None, "sector": "Telecom", "bias": -1},
    {"headline": "Goldman Sachs downgrades industrial sector outlook", "ticker": None, "sector": "Industrial", "bias": -1},
    {"headline": "Renewable energy stocks surge on new climate bill", "ticker": "NEE", "sector": "Energy", "bias": 1},
    {"headline": "AMD unveils MI400 AI accelerator to rival NVIDIA", "ticker": "AMD", "sector": None, "bias": 1},
    {"headline": "Costco membership surges past 140 million worldwide", "ticker": "COST", "sector": None, "bias": 1},
    {"headline": "Walt Disney+ reaches profitability for first time", "ticker": "DIS", "sector": None, "bias": 1},
    {"headline": "ASML warns of supply chain bottlenecks in EUV machines", "ticker": "ASML", "sector": None, "bias": -1},
    {"headline": "Broadcom completes $70B acquisition of cloud startup", "ticker": "AVGO", "sector": None, "bias": 1},
    {"headline": "UnitedHealth faces congressional probe over billing", "ticker": "UNH", "sector": None, "bias": -1},
    {"headline": "Markets rally on positive jobs report — 400K added", "ticker": None, "sector": None, "bias": 1},
    {"headline": "Exxon Mobil invests $15B in carbon capture technology", "ticker": "XOM", "sector": None, "bias": 1},
    {"headline": "Bank of America cuts 5,000 jobs in restructuring", "ticker": "BAC", "sector": None, "bias": -1},
    {"headline": "Qualcomm wins major 5G contract with US military", "ticker": "QCOM", "sector": None, "bias": 1},
    {"headline": "Starbucks closes 200 underperforming locations", "ticker": "SBUX", "sector": None, "bias": -1},
    {"headline": "Oracle cloud infrastructure grows 55% year-over-year", "ticker": "ORCL", "sector": None, "bias": 1},
    {"headline": "T-Mobile adds 2 million subscribers in Q1 2026", "ticker": "TMUS", "sector": None, "bias": 1},
    {"headline": "Caterpillar sees record construction equipment orders", "ticker": "CAT", "sector": None, "bias": 1},
    {"headline": "Procter & Gamble raises prices on household goods", "ticker": "PG", "sector": None, "bias": -1},
    {"headline": "Micron secures $6B CHIPS Act funding for US plants", "ticker": "MU", "sector": None, "bias": 1},
]

# ──────────────────────────── MARKET ENGINE ──────────────────────

class MarketEngine:
    def __init__(self):
        self.stocks = {}
        self.day_open = {}
        self.active_biases = []   # list of {ticker, sector, bias, expires_at}
        self.news_feed = []       # list of {headline, timestamp}
        # Backdate so the first headline appears on the first tick, not 45s later
        self.last_news_time = time.time() - NEWS_INTERVAL
        self._init_stocks()

    def _init_stocks(self):
        for s in STOCKS_DATA:
            self.stocks[s["ticker"]] = {
                "ticker": s["ticker"],
                "name": s["name"],
                "sector": s["sector"],
                "price": s["price"],
                "prev_price": s["price"],
            }
            self.day_open[s["ticker"]] = s["price"]

    def tick(self):
        """Called every TICK_INTERVAL seconds. Random walk + bias."""
        now = time.time()

        # Clean expired biases
        self.active_biases = [b for b in self.active_biases if b["expires_at"] > now]

        for ticker, stock in self.stocks.items():
            stock["prev_price"] = stock["price"]

            # Base random walk: ±0.15%
            change_pct = (random.random() - 0.5) * 2 * PRICE_WALK_PCT

            # Apply any active biases
            for bias in self.active_biases:
                if bias["ticker"] == ticker:
                    change_pct += bias["bias"] * NEWS_BIAS_PCT * 0.1  # spread over ticks
                elif bias["sector"] and stock["sector"] == bias["sector"]:
                    change_pct += bias["bias"] * NEWS_BIAS_PCT * 0.05
                elif bias["ticker"] is None and bias["sector"] is None:
                    # Market-wide event
                    change_pct += bias["bias"] * NEWS_BIAS_PCT * 0.03

            new_price = stock["price"] * (1 + change_pct)
            stock["price"] = max(0.01, round(new_price, 2))

    def maybe_generate_news(self):
        """Generate news roughly every NEWS_INTERVAL seconds."""
        now = time.time()
        if now - self.last_news_time < NEWS_INTERVAL:
            return None

        self.last_news_time = now
        template = random.choice(NEWS_TEMPLATES)

        news_item = {
            "headline": template["headline"],
            "ticker": template.get("ticker"),
            "sector": template.get("sector"),
            "timestamp": utcnow_iso(),
            "bias": "bullish" if template["bias"] > 0 else "bearish",
        }

        # Add bias to active biases
        self.active_biases.append({
            "ticker": template.get("ticker"),
            "sector": template.get("sector"),
            "bias": template["bias"],
            "expires_at": now + NEWS_BIAS_DURATION,
        })

        self.news_feed.insert(0, news_item)
        if len(self.news_feed) > 20:
            self.news_feed = self.news_feed[:20]

        return news_item

    def get_stocks(self):
        stocks = []
        for ticker, s in self.stocks.items():
            day_open = self.day_open[ticker]
            change_pct = ((s["price"] - day_open) / day_open) * 100 if day_open else 0
            stocks.append({
                "ticker": s["ticker"],
                "name": s["name"],
                "sector": s["sector"],
                "price": s["price"],
                "change_pct": round(change_pct, 2),
            })
        return stocks

    def get_state(self):
        """Return current market state for WebSocket broadcast."""
        return {"stocks": self.get_stocks(), "news": self.news_feed[:20]}

    def get_price(self, ticker: str) -> float:
        s = self.stocks.get(ticker)
        return s["price"] if s else 0.0


# Global engine instance
engine = MarketEngine()

# ──────────────────────────── WEBSOCKET MANAGER ──────────────────

class ConnectionManager:
    def __init__(self):
        self.active: list[WebSocket] = []

    async def connect(self, ws: WebSocket):
        await ws.accept()
        self.active.append(ws)

    def disconnect(self, ws: WebSocket):
        if ws in self.active:
            self.active.remove(ws)

    async def broadcast(self, data: dict):
        dead = []
        for ws in list(self.active):
            try:
                await ws.send_json(data)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.disconnect(ws)

manager = ConnectionManager()

# ──────────────────────────── BACKGROUND LOOP ────────────────────

async def market_loop():
    """Background task: tick the engine and broadcast every 2 seconds."""
    while True:
        try:
            engine.tick()
            engine.maybe_generate_news()
            await manager.broadcast(engine.get_state())
        except Exception as e:
            print(f"market loop error: {e}")
        await asyncio.sleep(TICK_INTERVAL)

# ──────────────────────────── FASTAPI APP ────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    print(f"Database: {'Postgres' if USE_PG else 'SQLite at ' + DB_PATH}")
    task = asyncio.create_task(market_loop())
    yield
    task.cancel()

app = FastAPI(title="Actually — Stock Simulator", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ──────────────────────────── PYDANTIC MODELS ────────────────────

class AuthRequest(BaseModel):
    username: str
    password: str

class TradeRequest(BaseModel):
    ticker: str
    shares: int

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

class UpdateProfileRequest(BaseModel):
    display_name: str

# ──────────────────────────── HEALTH ─────────────────────────────

@app.get("/")
def health():
    return {"status": "ok", "database": "postgres" if USE_PG else "sqlite"}

# ──────────────────────────── AUTH ROUTES ─────────────────────────

@app.post("/api/register")
def register(req: AuthRequest):
    username = req.username.strip()
    if len(username) < 3 or len(req.password) < 4:
        raise HTTPException(400, "Username must be 3+ chars, password 4+ chars")
    with get_db() as db:
        if db.execute("SELECT 1 FROM users WHERE username = ?", (username,)).fetchone():
            raise HTTPException(400, "Username already exists")
        hashed = pwd_ctx.hash(req.password)
        row = db.execute(
            "INSERT INTO users (username, password_hash, cash) VALUES (?, ?, ?) RETURNING id",
            (username, hashed, INITIAL_CASH),
        ).fetchone()
        db.commit()
    token = create_token(row["id"], username)
    return {"token": token, "username": username, "cash": INITIAL_CASH}


@app.post("/api/login")
def login(username: str = Form(), password: str = Form()):
    with get_db() as db:
        row = db.execute("SELECT * FROM users WHERE username = ?", (username.strip(),)).fetchone()
    if not row or not pwd_ctx.verify(password, row["password_hash"]):
        raise HTTPException(401, "Invalid credentials")
    token = create_token(row["id"], row["username"])
    return {"access_token": token, "token_type": "bearer", "username": row["username"], "cash": row["cash"]}

@app.get("/api/me")
def get_me(user=Depends(verify_token)):
    with get_db() as db:
        row = db.execute("SELECT cash, display_name FROM users WHERE id = ?", (user["user_id"],)).fetchone()
    if not row:
        raise HTTPException(404, "User not found")
    display = row["display_name"] if row["display_name"] else user["username"]
    return {"username": display, "cash": row["cash"]}

# ──────────────────────────── MARKET ROUTES ──────────────────────

@app.get("/api/stocks")
def list_stocks():
    return engine.get_stocks()

@app.get("/api/news")
def list_news():
    return engine.news_feed

# ──────────────────────────── PORTFOLIO ROUTES ───────────────────

@app.get("/api/portfolio")
def get_portfolio(user=Depends(verify_token)):
    with get_db() as db:
        cash_row = db.execute("SELECT cash FROM users WHERE id = ?", (user["user_id"],)).fetchone()
        positions = db.execute("SELECT ticker, shares, avg_price FROM positions WHERE user_id = ? AND shares > 0",
                               (user["user_id"],)).fetchall()
    if not cash_row:
        raise HTTPException(404, "User not found")

    holdings = []
    total_value = cash_row["cash"]
    for p in positions:
        current_price = engine.get_price(p["ticker"])
        market_value = current_price * p["shares"]
        pnl = (current_price - p["avg_price"]) * p["shares"]
        total_value += market_value
        holdings.append({
            "ticker": p["ticker"],
            "shares": p["shares"],
            "avg_price": round(p["avg_price"], 2),
            "current_price": current_price,
            "market_value": round(market_value, 2),
            "pnl": round(pnl, 2),
        })

    total_pnl = total_value - INITIAL_CASH
    return {
        "cash": round(cash_row["cash"], 2),
        "total_value": round(total_value, 2),
        "total_pnl": round(total_pnl, 2),
        "total_pnl_pct": round(total_pnl / INITIAL_CASH * 100, 2),
        "holdings": holdings,
    }

# ──────────────────────────── TRADE ROUTES ───────────────────────

def _validate_trade(req: TradeRequest):
    if req.shares <= 0:
        raise HTTPException(400, "Shares must be positive")
    ticker = req.ticker.strip().upper()
    price = engine.get_price(ticker)
    if price <= 0:
        raise HTTPException(400, "Invalid ticker")
    return ticker, price

@app.post("/api/buy")
def buy_stock(req: TradeRequest, user=Depends(verify_token)):
    ticker, price = _validate_trade(req)
    cost = price * req.shares
    uid = user["user_id"]

    with get_db() as db:
        # Conditional update makes the balance check and debit atomic
        cur = db.execute("UPDATE users SET cash = cash - ? WHERE id = ? AND cash >= ?", (cost, uid, cost))
        if cur.rowcount == 0:
            row = db.execute("SELECT cash FROM users WHERE id = ?", (uid,)).fetchone()
            have = row["cash"] if row else 0
            raise HTTPException(400, f"Insufficient funds. Need ${cost:.2f}, have ${have:.2f}")

        db.execute(
            """INSERT INTO positions (user_id, ticker, shares, avg_price) VALUES (?, ?, ?, ?)
               ON CONFLICT (user_id, ticker) DO UPDATE SET
                 avg_price = (positions.avg_price * positions.shares + excluded.avg_price * excluded.shares)
                             / (positions.shares + excluded.shares),
                 shares = positions.shares + excluded.shares""",
            (uid, ticker, req.shares, price),
        )
        db.execute(
            "INSERT INTO trades (user_id, ticker, side, shares, price, total, realized_pnl, created_at) VALUES (?, ?, 'buy', ?, ?, ?, NULL, ?)",
            (uid, ticker, req.shares, price, cost, utcnow_iso()),
        )
        db.commit()
        new_cash = db.execute("SELECT cash FROM users WHERE id = ?", (uid,)).fetchone()["cash"]
    return {"message": f"Bought {req.shares} shares of {ticker} at ${price:.2f}", "cash": round(new_cash, 2)}

@app.post("/api/sell")
def sell_stock(req: TradeRequest, user=Depends(verify_token)):
    ticker, price = _validate_trade(req)
    uid = user["user_id"]

    with get_db() as db:
        existing = db.execute("SELECT shares, avg_price FROM positions WHERE user_id = ? AND ticker = ?",
                              (uid, ticker)).fetchone()
        cur = db.execute("UPDATE positions SET shares = shares - ? WHERE user_id = ? AND ticker = ? AND shares >= ?",
                         (req.shares, uid, ticker, req.shares))
        if not existing or cur.rowcount == 0:
            raise HTTPException(400, "Not enough shares to sell")

        proceeds = price * req.shares
        realized = (price - existing["avg_price"]) * req.shares
        db.execute("DELETE FROM positions WHERE user_id = ? AND ticker = ? AND shares <= 0", (uid, ticker))
        db.execute("UPDATE users SET cash = cash + ? WHERE id = ?", (proceeds, uid))
        db.execute(
            "INSERT INTO trades (user_id, ticker, side, shares, price, total, realized_pnl, created_at) VALUES (?, ?, 'sell', ?, ?, ?, ?, ?)",
            (uid, ticker, req.shares, price, proceeds, realized, utcnow_iso()),
        )
        db.commit()
        new_cash = db.execute("SELECT cash FROM users WHERE id = ?", (uid,)).fetchone()["cash"]
    return {"message": f"Sold {req.shares} shares of {ticker} at ${price:.2f}", "cash": round(new_cash, 2)}

@app.get("/api/transactions")
def get_transactions(limit: int = 100, user=Depends(verify_token)):
    limit = max(1, min(limit, 500))
    with get_db() as db:
        rows = db.execute(
            "SELECT id, ticker, side, shares, price, total, realized_pnl, created_at FROM trades WHERE user_id = ? ORDER BY id DESC LIMIT ?",
            (user["user_id"], limit),
        ).fetchall()
    names = {s["ticker"]: s["name"] for s in STOCKS_DATA}
    return [
        {
            "id": r["id"],
            "type": r["side"],
            "ticker": r["ticker"],
            "name": names.get(r["ticker"], r["ticker"]),
            "shares": r["shares"],
            "price": round(r["price"], 2),
            "total": round(r["total"], 2),
            "realized_pnl": None if r["realized_pnl"] is None else round(r["realized_pnl"], 2),
            "timestamp": r["created_at"],
        }
        for r in rows
    ]

# ──────────────────────────── LEADERBOARD ────────────────────────

@app.get("/api/leaderboard")
def get_leaderboard(user=Depends(verify_token)):
    with get_db() as db:
        users = db.execute("SELECT id, username, display_name, cash FROM users").fetchall()
        positions = db.execute("SELECT user_id, ticker, shares FROM positions WHERE shares > 0").fetchall()
        counts = db.execute("SELECT user_id, COUNT(*) AS n FROM trades GROUP BY user_id").fetchall()

    holdings_value: dict[int, float] = {}
    for p in positions:
        holdings_value[p["user_id"]] = holdings_value.get(p["user_id"], 0) + p["shares"] * engine.get_price(p["ticker"])
    trade_counts = {c["user_id"]: c["n"] for c in counts}

    entries = []
    for u in users:
        net_worth = u["cash"] + holdings_value.get(u["id"], 0)
        pnl = net_worth - INITIAL_CASH
        entries.append({
            "user_id": u["id"],
            "username": u["display_name"] or u["username"],
            "net_worth": round(net_worth, 2),
            "pnl": round(pnl, 2),
            "pnl_pct": round(pnl / INITIAL_CASH * 100, 2),
            "total_trades": trade_counts.get(u["id"], 0),
        })
    entries.sort(key=lambda e: e["net_worth"], reverse=True)

    me = None
    for i, e in enumerate(entries, start=1):
        e["rank"] = i
        e["is_current_user"] = e["user_id"] == user["user_id"]
        if e["is_current_user"]:
            me = e
    for e in entries:
        del e["user_id"]
    return {"total_traders": len(entries), "entries": entries[:50], "me": me}

# ──────────────────────────── ACCOUNT MANAGEMENT ─────────────────

@app.post("/api/change-password")
def change_password(req: ChangePasswordRequest, user=Depends(verify_token)):
    if len(req.new_password) < 4:
        raise HTTPException(400, "New password must be at least 4 characters")
    with get_db() as db:
        row = db.execute("SELECT password_hash FROM users WHERE id = ?", (user["user_id"],)).fetchone()
        if not row or not pwd_ctx.verify(req.current_password, row["password_hash"]):
            raise HTTPException(400, "Current password is incorrect")
        db.execute("UPDATE users SET password_hash = ? WHERE id = ?", (pwd_ctx.hash(req.new_password), user["user_id"]))
        db.commit()
    return {"message": "Password changed successfully"}

@app.post("/api/reset-portfolio")
def reset_portfolio(user=Depends(verify_token)):
    with get_db() as db:
        db.execute("DELETE FROM positions WHERE user_id = ?", (user["user_id"],))
        db.execute("DELETE FROM trades WHERE user_id = ?", (user["user_id"],))
        db.execute("UPDATE users SET cash = ? WHERE id = ?", (INITIAL_CASH, user["user_id"]))
        db.commit()
    return {"message": "Portfolio reset successfully", "cash": INITIAL_CASH}

@app.get("/api/stats")
def get_stats(user=Depends(verify_token)):
    with get_db() as db:
        trades = db.execute("SELECT side, realized_pnl, created_at FROM trades WHERE user_id = ?",
                            (user["user_id"],)).fetchall()

    sells = [t for t in trades if t["side"] == "sell"]
    profitable = sum(1 for t in sells if (t["realized_pnl"] or 0) > 0)
    trading_days = len({t["created_at"][:10] for t in trades})
    win_rate = round(profitable / len(sells) * 100, 1) if sells else 0.0
    return {
        "total_trades": len(trades),
        "successful_trades": profitable,
        "trading_days": trading_days,
        "win_rate": win_rate,
    }

@app.post("/api/update-profile")
def update_profile(req: UpdateProfileRequest, user=Depends(verify_token)):
    name = req.display_name.strip()
    if len(name) < 1:
        raise HTTPException(400, "Display name cannot be empty")
    with get_db() as db:
        db.execute("UPDATE users SET display_name = ? WHERE id = ?", (name, user["user_id"]))
        db.commit()
    return {"message": "Profile updated", "display_name": name}

# ──────────────────────────── STOCK INFO (WIKIPEDIA) ─────────────

# In-memory cache for stock info to prevent hitting Wikipedia API too often
wiki_cache = {}

@app.get("/api/stocks/{ticker}/info")
async def get_stock_info(ticker: str, user=Depends(verify_token)):
    ticker = ticker.upper()
    stock_data = next((s for s in STOCKS_DATA if s["ticker"] == ticker), None)
    if not stock_data:
        raise HTTPException(status_code=404, detail="Stock not found")

    if ticker in wiki_cache:
        return wiki_cache[ticker]

    company_name = stock_data["name"]
    # Simple base response if fetching fails
    base_info = {
        "ticker": ticker,
        "name": company_name,
        "sector": stock_data["sector"],
        "summary": "No detailed information available at the moment.",
        "url": None
    }
    headers = {"User-Agent": "ActuallyStockSimulator/1.0 (test@example.com) httpx/0.28"}
    async with httpx.AsyncClient(headers=headers) as client:
        try:
            # Step 1: Search for the company name to get the correct Wikipedia title
            search_resp = await client.get(
                "https://en.wikipedia.org/w/api.php",
                params={"action": "query", "list": "search", "srsearch": company_name, "utf8": "", "format": "json"},
                timeout=5.0,
            )
            search_resp.raise_for_status()
            search_results = search_resp.json().get("query", {}).get("search", [])
            if not search_results:
                wiki_cache[ticker] = base_info
                return base_info

            title = search_results[0]["title"]

            # Step 2: Fetch the summary for that title
            summary_url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{quote(title.replace(' ', '_'), safe='')}"
            summary_resp = await client.get(summary_url, timeout=5.0)
            summary_resp.raise_for_status()
            summary_data = summary_resp.json()

            info = {
                "ticker": ticker,
                "name": company_name,
                "sector": stock_data["sector"],
                "summary": summary_data.get("extract", base_info["summary"]),
                "url": summary_data.get("content_urls", {}).get("desktop", {}).get("page", None)
            }
            wiki_cache[ticker] = info
            return info

        except Exception as e:
            print(f"Error fetching Wikipedia data for {company_name}: {e}")
            return base_info

# ──────────────────────────── WEBSOCKET ──────────────────────────

@app.websocket("/ws")
async def websocket_endpoint(ws: WebSocket):
    await manager.connect(ws)
    try:
        # Send initial state immediately
        await ws.send_json(engine.get_state())
        # Keep connection alive — listen for pings/messages
        while True:
            await ws.receive_text()
    except WebSocketDisconnect:
        pass
    finally:
        manager.disconnect(ws)

# ──────────────────────────── ENTRY POINT ────────────────────────

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=int(os.getenv("PORT", "8000")), reload=True)
