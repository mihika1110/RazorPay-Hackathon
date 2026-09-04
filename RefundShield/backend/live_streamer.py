"""
live_streamer.py
Background thread that continuously generates new synthetic orders,
scores them with the trained ML model, appends them to orders_scored.csv,
and rebuilds clusters.json — simulating a live production data stream.
"""
import pandas as pd
import numpy as np
import random
import pickle
import json
import threading
import time
import os
from datetime import datetime, timedelta

# How often (seconds) to generate a new batch of orders
STREAM_INTERVAL = 5
BATCH_SIZE = 3  # new orders per tick

_stop_event = threading.Event()
_lock = threading.Lock()

products = [f"PROD_{i}" for i in range(100, 150)]
categories = ["Electronics", "Clothing", "Home", "Beauty", "Sports"]

def _load_model():
    if not os.path.exists("model.pkl"):
        return None
    with open("model.pkl", "rb") as f:
        return pickle.load(f)

def _score_orders(clf, orders_df, accounts_df):
    """Score a batch of orders using the trained model."""
    from ml_model import prepare_features
    try:
        df, X, _ = prepare_features(accounts_df, orders_df)
        probs = clf.predict_proba(X)[:, 1]
        df["risk_score"] = probs
        df["risk_level"] = df["risk_score"].apply(
            lambda x: "HIGH" if x > 0.8 else ("MEDIUM" if x > 0.4 else "LOW")
        )
        output_cols = [
            "order_id", "account_id", "timestamp", "product_id", "amount",
            "device_id", "address_id", "order_status", "refund_requested",
            "risk_score", "risk_level"
        ]
        return df[[c for c in output_cols if c in df.columns]]
    except Exception as e:
        print(f"[LiveStream] Scoring error: {e}")
        return None

def _generate_new_orders(accounts_df, existing_order_count):
    """Generate a small batch of new synthetic orders from existing accounts."""
    new_orders = []
    account_sample = accounts_df.sample(min(BATCH_SIZE, len(accounts_df))).to_dict("records")
    now = datetime.now()

    for i, acc in enumerate(account_sample):
        is_abusive = acc.get("abuse_label", 0) == 1
        base_refund_rate = random.uniform(0.5, 0.95) if is_abusive else random.uniform(0.0, 0.2)
        amount = round(random.uniform(50, 1500) if is_abusive else random.uniform(10, 400), 2)
        refund_requested = 1 if random.random() < base_refund_rate else 0

        new_orders.append({
            "order_id": f"ORD_LIVE_{existing_order_count + i}_{int(time.time())}",
            "account_id": acc["account_id"],
            "timestamp": now.isoformat(),
            "product_id": random.choice(products),
            "category": random.choice(categories),
            "amount": amount,
            "device_id": acc["device_id"],
            "address_id": acc["address_id"],
            "order_status": "REFUNDED" if refund_requested else "COMPLETED",
            "refund_requested": refund_requested,
            "refund_amount": amount if refund_requested else 0.0,
            "refund_timestamp": (now + timedelta(days=random.randint(1, 3))).isoformat() if refund_requested else None
        })
    return pd.DataFrame(new_orders)

def _rebuild_clusters(orders_df, accounts_df):
    """Rebuild clusters.json from the current scored orders."""
    from graph_engine import build_graph, detect_clusters, detect_dense_living_nodes
    try:
        graph = build_graph(accounts_df, orders_df)
        clusters = detect_clusters(graph, orders_df)
        clusters = detect_dense_living_nodes(clusters)
        with open("clusters.json", "w") as f:
            json.dump(clusters, f, indent=2)
    except Exception as e:
        print(f"[LiveStream] Cluster rebuild error: {e}")

def _stream_loop():
    print("[LiveStream] Starting live data stream...")
    clf = _load_model()
    if clf is None:
        print("[LiveStream] No model found. Run ml_model.py first.")
        return

    while not _stop_event.is_set():
        try:
            with _lock:
                # Load current state
                accounts_df = pd.read_csv("accounts.csv")
                if os.path.exists("orders_scored.csv"):
                    orders_df = pd.read_csv("orders_scored.csv")
                else:
                    orders_df = pd.read_csv("orders.csv")

                existing_count = len(orders_df)

                # Generate new orders
                new_orders_raw = _generate_new_orders(accounts_df, existing_count)

                # Score the new orders using the full dataset context for features
                combined_raw = pd.concat([
                    pd.read_csv("orders.csv") if not os.path.exists("orders_scored.csv") else orders_df[
                        ["order_id", "account_id", "timestamp", "product_id", "amount",
                         "device_id", "address_id", "order_status", "refund_requested"]
                    ],
                    new_orders_raw[["order_id", "account_id", "timestamp", "product_id", "amount",
                                    "device_id", "address_id", "order_status", "refund_requested"]]
                ], ignore_index=True)

                scored = _score_orders(clf, combined_raw, accounts_df)
                if scored is not None:
                    scored.to_csv("orders_scored.csv", index=False)
                    _rebuild_clusters(scored, accounts_df)
                    print(f"[LiveStream] +{BATCH_SIZE} orders. Total: {len(scored)}")

        except Exception as e:
            print(f"[LiveStream] Loop error: {e}")

        _stop_event.wait(STREAM_INTERVAL)

    print("[LiveStream] Stopped.")

def start_stream():
    """Start the background streaming thread."""
    _stop_event.clear()
    t = threading.Thread(target=_stream_loop, daemon=True)
    t.start()
    return t

def stop_stream():
    """Signal the streaming thread to stop."""
    _stop_event.set()
