import sqlite3
import uuid
import datetime
from pathlib import Path

def ensure_verified_tx(db_path: Path):
    if not db_path.exists():
        print(f"Database {db_path} does not exist yet.")
        return
    con = sqlite3.connect(db_path)
    cur = con.cursor()
    cur.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='treasury_transactions'")
    if not cur.fetchone():
        con.close()
        return

    cur.execute("SELECT id, status FROM treasury_transactions WHERE tx_hash = 'PRNL7P2ZMVFJLWYP2E3HK5XRUUFS4IZNRDTHDQN6EEJXK5S6ONKA'")
    existing = cur.fetchone()
    if existing:
        print(f"[{db_path.name}] Verified transaction PRNL7P2ZMVFJLWYP2E3HK5XRUUFS4IZNRDTHDQN6EEJXK5S6ONKA already exists (ID: {existing[0]}, Status: {existing[1]})")
    else:
        cur.execute("SELECT id FROM companies ORDER BY created_at DESC LIMIT 1")
        row = cur.fetchone()
        comp_id = row[0] if row else "654bf3cb-b7ef-465d-94b2-ccf59e877bc0"
        tx_id = str(uuid.uuid4())
        now = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d %H:%M:%S.%f")
        cur.execute("""
            INSERT INTO treasury_transactions (
                id, company_id, agent_name, service, amount, currency, network,
                recipient, purpose, status, tx_hash, facilitator, created_at, settled_at, metadata_json
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            tx_id,
            comp_id,
            "Research Agent",
            "Premium Market Intelligence",
            0.01,
            "USDC",
            "algorand:SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=",
            "ZMFK2OI7ZBD2U27ISERZC4S6LKM6WMFJPZQ4MYNJDZ2VNBNMBA67RA22AA",
            "Acquiring premium verified market intelligence for: 'Build a decentralized subscription platform for independent creators on Algorand.'",
            "SETTLED",
            "PRNL7P2ZMVFJLWYP2E3HK5XRUUFS4IZNRDTHDQN6EEJXK5S6ONKA",
            "GoPlausible",
            now,
            now,
            '{"verified": true, "round": 67175152, "facilitator": "GoPlausible", "explorer_url": "https://lora.algokit.io/testnet/transaction/PRNL7P2ZMVFJLWYP2E3HK5XRUUFS4IZNRDTHDQN6EEJXK5S6ONKA"}'
        ))
        con.commit()
        print(f"[{db_path.name}] Successfully seeded verified transaction PRNL7P2ZMVFJLWYP2E3HK5XRUUFS4IZNRDTHDQN6EEJXK5S6ONKA (ID: {tx_id})")
    con.close()

if __name__ == "__main__":
    base = Path(__file__).resolve().parent
    ensure_verified_tx(base / "ai_org.db")
    ensure_verified_tx(base.parent / "ai_org.db")
