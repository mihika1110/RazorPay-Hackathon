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
    y = df['abuse_label']
    
    return df, X, y

def train_and_evaluate():
    print("Loading data...")
    accounts_df = pd.read_csv('accounts.csv')
    orders_df = pd.read_csv('orders.csv')
    
    df, X, y = prepare_features(accounts_df, orders_df)
    
    # Train/Test Split (80/20) - held out test set
    X_train, X_test, y_train, y_test, idx_train, idx_test = train_test_split(
        X, y, df.index, test_size=0.2, random_state=42, stratify=y
    )
    
    print("Training Random Forest...")
    clf = RandomForestClassifier(n_estimators=100, random_state=42, max_depth=8)
    clf.fit(X_train, y_train)
    
    # Predictions
    y_pred = clf.predict(X_test)
    y_prob = clf.predict_proba(X_test)[:, 1]
    
    # Evaluation
    precision = precision_score(y_test, y_pred)
    recall = recall_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred)
    cm = confusion_matrix(y_test, y_pred).tolist()
    
    fpr = cm[0][1] / (cm[0][0] + cm[0][1]) if (cm[0][0] + cm[0][1]) > 0 else 0.0
    fnr = cm[1][0] / (cm[1][0] + cm[1][1]) if (cm[1][0] + cm[1][1]) > 0 else 0.0
    
    metrics = {
        "precision": round(precision * 100, 2),
        "recall": round(recall * 100, 2),
        "f1": round(f1 * 100, 2),
        "false_positive_rate": round(fpr * 100, 2),
        "false_negative_rate": round(fnr * 100, 2),
        "confusion_matrix": cm,
        "test_records": len(y_test),
        "train_records": len(y_train)
    }
    
    print("Metrics on Held-Out Test Set:")
    print(metrics)
    
    with open('metrics.json', 'w') as f:
        json.dump(metrics, f, indent=4)
        
    # Save the model
    with open('model.pkl', 'wb') as f:
        pickle.dump(clf, f)
        
    # Generate Risk Scores for all orders (to serve in the dashboard)
    all_prob = clf.predict_proba(X)[:, 1]
    df['risk_score'] = all_prob
    df['risk_level'] = df['risk_score'].apply(lambda x: 'HIGH' if x > 0.8 else ('MEDIUM' if x > 0.4 else 'LOW'))
    
    # Save processed orders with risk scores
    output_cols = ['order_id', 'account_id', 'timestamp', 'product_id', 'amount', 'device_id', 'address_id', 'order_status', 'refund_requested', 'risk_score', 'risk_level']
    df[output_cols].to_csv('orders_scored.csv', index=False)
    print("Saved orders_scored.csv and model.pkl")

if __name__ == "__main__":
    train_and_evaluate()
