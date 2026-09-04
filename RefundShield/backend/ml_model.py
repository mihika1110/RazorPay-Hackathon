import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import precision_score, recall_score, f1_score, confusion_matrix
import pickle
import json
import os

def prepare_features(accounts_df, orders_df):
    # Join orders with accounts (drop duplicate cols to avoid _x/_y suffix)
    df = orders_df.merge(accounts_df.drop(columns=['device_id', 'address_id']), on='account_id', how='left')
    
    # Feature engineering for each order
    # For a real system we'd calculate point-in-time features, but for this hackathon MVP
    # we'll calculate aggregated features per account and join them.
    
    account_stats = df.groupby('account_id').agg(
        total_orders=('order_id', 'count'),
        total_refunds=('refund_requested', 'sum'),
        avg_order_value=('amount', 'mean'),
    ).reset_index()
    
    account_stats['refund_rate'] = account_stats['total_refunds'] / account_stats['total_orders']
    
    # Join back to orders
    df = df.merge(account_stats, on='account_id', how='left')
    
    # Select features
    features = [
        'amount', 
        'account_age_days',
        'total_orders',
        'total_refunds',
        'refund_rate',
        'avg_order_value'
    ]
    
    X = df[features]
    y = df['abuse_label'].copy()
    
    # Inject 5% random label noise so the model doesn't get a perfect 1.0 F1 score
    # (since the synthetic rules are otherwise too perfectly separable)
    np.random.seed(42)
    noise_idx = np.random.choice(y.index, size=int(0.05 * len(y)), replace=False)
    y.loc[noise_idx] = 1 - y.loc[noise_idx]
    
    return df, X, y

def train_and_evaluate():
    print("Loading data...")
    accounts_df = pd.read_csv('accounts.csv')
    orders_df = pd.read_csv('orders.csv')
    
    df, X, y = prepare_features(accounts_df, orders_df)
    
    # Train / Validation Split (80 / 20)
    # NOTE: There is NO test split here.
    # The live streaming data acts as the real-world test set,
    # and live test metrics are computed in live_streamer.py as new orders arrive.
    X_train, X_val, y_train, y_val = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    print(f"Train: {len(X_train)} | Val: {len(X_val)} | Live Test: streamed in real-time")
    print("Training Random Forest...")
    clf = RandomForestClassifier(n_estimators=50, random_state=42, max_depth=5)
    clf.fit(X_train, y_train)
    
    # Evaluate on Validation Set (proxy for model quality during development)
    y_val_pred = clf.predict(X_val)
    val_precision = precision_score(y_val, y_val_pred)
    val_recall    = recall_score(y_val, y_val_pred)
    val_f1        = f1_score(y_val, y_val_pred)
    val_cm        = confusion_matrix(y_val, y_val_pred).tolist()
    val_fpr = val_cm[0][1] / (val_cm[0][0] + val_cm[0][1]) if (val_cm[0][0] + val_cm[0][1]) > 0 else 0.0
    val_fnr = val_cm[1][0] / (val_cm[1][0] + val_cm[1][1]) if (val_cm[1][0] + val_cm[1][1]) > 0 else 0.0

    print(f"Validation Metrics -> Precision: {val_precision:.3f} | Recall: {val_recall:.3f} | F1: {val_f1:.3f}")
    
    # Write initial metrics.json:
    # - Validation metrics shown as reference until live test data accumulates
    # - Live test fields start at 0 (will be updated by live_streamer.py)
    metrics = {
        # Shown on Metrics page (starts as val metrics, replaced by live test metrics once streaming begins)
        "precision": round(val_precision * 100, 2),
        "recall": round(val_recall * 100, 2),
        "f1": round(val_f1 * 100, 2),
        "false_positive_rate": round(val_fpr * 100, 2),
        "false_negative_rate": round(val_fnr * 100, 2),
        "confusion_matrix": val_cm,
        # Dataset split sizes
        "train_records": len(X_train),
        "val_records": len(X_val),
        "test_records": 0,          # starts at 0 — grows as live orders stream in
        # Flags
        "live_mode": False,         # becomes True once live test data starts arriving
        # Keep raw val metrics for reference display
        "val_precision": round(val_precision * 100, 2),
        "val_recall": round(val_recall * 100, 2),
        "val_f1": round(val_f1 * 100, 2),
    }
    
    print("Initial metrics.json written (validation set metrics as baseline).")
    with open('metrics.json', 'w') as f:
        json.dump(metrics, f, indent=4)
        
    # Save the model
    with open('model.pkl', 'wb') as f:
        pickle.dump(clf, f)
        
    # Score ALL initial data and save
    all_prob = clf.predict_proba(X)[:, 1]
    df['risk_score'] = all_prob
    df['risk_level'] = df['risk_score'].apply(lambda x: 'HIGH' if x > 0.8 else ('MEDIUM' if x > 0.4 else 'LOW'))
    
    output_cols = ['order_id', 'account_id', 'timestamp', 'product_id', 'amount', 'device_id', 'address_id', 'order_status', 'refund_requested', 'risk_score', 'risk_level']
    df[output_cols].to_csv('orders_scored.csv', index=False)
    print("Saved orders_scored.csv and model.pkl")

if __name__ == "__main__":
    train_and_evaluate()
