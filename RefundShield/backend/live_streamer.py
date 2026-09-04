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
STREAM_INTERVAL = int(os.getenv("STREAM_INTERVAL", "10"))
BATCH_SIZE = int(os.getenv("STREAM_BATCH_SIZE", "3"))

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
    """Score a batch of orders using the trained model. Returns scored df WITH abuse_label for live metrics."""
    from ml_model import prepare_features
    try:
        df, X, _ = prepare_features(accounts_df, orders_df)
        probs = clf.predict_proba(X)[:, 1]
        df["risk_score"] = probs
        df["risk_level"] = df["risk_score"].apply(
            lambda x: "HIGH" if x > 0.8 else ("MEDIUM" if x > 0.4 else "LOW")
        )
        # predicted positive = HIGH or MEDIUM risk (score > 0.4)
        df["predicted_positive"] = (df["risk_score"] > 0.4).astype(int)
        output_cols = [
            "order_id", "account_id", "timestamp", "product_id", "amount",
            "device_id", "address_id", "order_status", "refund_requested",
            "risk_score", "risk_level", "abuse_label", "predicted_positive"
        ]
        return df[[c for c in output_cols if c in df.columns]]
    except Exception as e:
        print(f"[LiveStream] Scoring error: {e}")
        return None


def _update_live_metrics(scored_df):
    """Compute and persist live production metrics from all scored orders that have ground truth."""
    try:
        eval_df = scored_df.dropna(subset=["abuse_label", "predicted_positive"]).copy()
        if len(eval_df) == 0:
            return

        y_true = eval_df["abuse_label"].astype(int)
        y_pred = eval_df["predicted_positive"].astype(int)

        tp = int(((y_pred == 1) & (y_true == 1)).sum())
        fp = int(((y_pred == 1) & (y_true == 0)).sum())
        fn = int(((y_pred == 0) & (y_true == 1)).sum())
        tn = int(((y_pred == 0) & (y_true == 0)).sum())

        precision = tp / (tp + fp) if (tp + fp) > 0 else 0.0
        recall    = tp / (tp + fn) if (tp + fn) > 0 else 0.0
        f1        = 2 * precision * recall / (precision + recall) if (precision + recall) > 0 else 0.0
        fpr       = fp / (fp + tn) if (fp + tn) > 0 else 0.0
        fnr       = fn / (fn + tp) if (fn + tp) > 0 else 0.0

        # Keep train/val record counts from the original training run
        static = {}
        if os.path.exists("metrics.json"):
            with open("metrics.json", "r") as f:
                static = json.load(f)

        live_metrics = {
            "precision": round(precision * 100, 2),
            "recall": round(recall * 100, 2),
            "f1": round(f1 * 100, 2),
            "false_positive_rate": round(fpr * 100, 2),
            "false_negative_rate": round(fnr * 100, 2),
            "confusion_matrix": [[tn, fp], [fn, tp]],
            "test_records": len(eval_df),
            "val_records": static.get("val_records", 0),
            "train_records": static.get("train_records", 0),
            "live_mode": True
        }

        with open("metrics.json", "w") as f:
            json.dump(live_metrics, f, indent=4)

    except Exception as e:
        print(f"[LiveStream] Metrics update error: {e}")


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

def _rebuild_clusters():
    """Rebuild clusters.json from current scored orders."""
    from graph_engine import build_and_analyze_graph
    try:
        build_and_analyze_graph()
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
                    # Update live metrics BEFORE stripping internal columns
                    _update_live_metrics(scored)
                    # Strip internal columns before saving to CSV
                    save_cols = [c for c in scored.columns if c not in ["abuse_label", "predicted_positive"]]
                    scored[save_cols].to_csv("orders_scored.csv", index=False)
                    _rebuild_clusters()
                    print(f"[LiveStream] +{BATCH_SIZE} orders. Total: {len(scored)}")

        except Exception as e:
            print(f"[LiveStream] Loop error: {e}")

        _stop_event.wait(STREAM_INTERVAL)

    print("[LiveStream] Stopped.")

_stream_thread = None

def is_stream_running():
    global _stream_thread
    return _stream_thread is not None and _stream_thread.is_alive() and not _stop_event.is_set()

def start_stream():
    """Start the background streaming thread if not already running."""
    global _stream_thread
    with _lock:
        if is_stream_running():
            return _stream_thread
        _stop_event.clear()
        _stream_thread = threading.Thread(target=_stream_loop, daemon=True)
        _stream_thread.start()
        return _stream_thread

def stop_stream():
    """Signal the streaming thread to stop."""
    _stop_event.set()
    return True
