"""
test_scenarios.py — RefundRadar ML Scenario Testing Suite
Runs predefined real-world customer personas through the trained model
and prints a beautifully formatted breakdown of predictions, scores, and explanations.
"""

import os
import sys
import pickle
import pandas as pd

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

# Load model
MODEL_PATH = os.path.join(os.path.dirname(__file__), "model.pkl")

def load_model():
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(f"Model file not found at {MODEL_PATH}. Please run ml_model.py first.")
    with open(MODEL_PATH, "rb") as f:
        return pickle.load(f)

# Define realistic e-commerce scenarios
SCENARIOS = [
    {
        "name": "1. University Dorm Student",
        "description": "Legitimate student in a shared campus dorm. Normal order size, zero refunds.",
        "features": {
            "amount": 220.0,
            "account_age_days": 180,
            "total_orders": 5,
            "total_refunds": 0,
            "refund_rate": 0.0,
            "avg_order_value": 200.0
        },
        "expected_risk": "LOW"
    },
    {
        "name": "2. Everyday Regular Shopper",
        "description": "Standard customer who returned 1 item for size mismatch across 10 purchases.",
        "features": {
            "amount": 320.0,
            "account_age_days": 240,
            "total_orders": 10,
            "total_refunds": 1,
            "refund_rate": 0.10,
            "avg_order_value": 300.0
        },
        "expected_risk": "LOW"
    },
    {
        "name": "3. Moderate Returner (Review Queue)",
        "description": "Borderline customer with 2 refunds in 7 orders (28.5% return rate).",
        "features": {
            "amount": 450.0,
            "account_age_days": 120,
            "total_orders": 7,
            "total_refunds": 2,
            "refund_rate": 2 / 7,
            "avg_order_value": 420.0
        },
        "expected_risk": "MEDIUM"
    },
    {
        "name": "4. Fraud Ring Syndicate Account",
        "description": "New account claiming refunds on 6 out of 7 high-value electronics orders.",
        "features": {
            "amount": 1200.0,
            "account_age_days": 15,
            "total_orders": 7,
            "total_refunds": 6,
            "refund_rate": 6 / 7,
            "avg_order_value": 1150.0
        },
        "expected_risk": "HIGH"
    },
    {
        "name": "5. Serial Wardrobing Abuser",
        "description": "10-day-old account buying expensive items and immediately refunding 80% of them.",
        "features": {
            "amount": 1600.0,
            "account_age_days": 10,
            "total_orders": 5,
            "total_refunds": 4,
            "refund_rate": 4 / 5,
            "avg_order_value": 1400.0
        },
        "expected_risk": "HIGH"
    }
]

def run_tests():
    clf = load_model()
    cols = ["amount", "account_age_days", "total_orders", "total_refunds", "refund_rate", "avg_order_value"]
    
    print("\n" + "="*80)
    print(" 📡 REFUNDRADAR — ML SCENARIO EVALUATION SUITE ")
    print("="*80 + "\n")
    
    passed_count = 0

    for item in SCENARIOS:
        feat_df = pd.DataFrame([[item["features"][c] for c in cols]], columns=cols)
        prob = clf.predict_proba(feat_df)[0][1]
        
        assigned_risk = "HIGH" if prob > 0.8 else ("MEDIUM" if prob > 0.4 else "LOW")
        is_correct = assigned_risk == item["expected_risk"]
        
        if is_correct:
            passed_count += 1
            status_badge = "[ PASS ]"
        else:
            status_badge = "[ FAIL ]"
            
        print(f"Scenario: {item['name']}")
        print(f"Context:  {item['description']}")
        print(f"Inputs:   Amount: ₹{item['features']['amount']} | Age: {item['features']['account_age_days']}d | Orders: {item['features']['total_orders']} | Refunds: {item['features']['total_refunds']} ({item['features']['refund_rate']*100:.1f}%) | AOV: ₹{item['features']['avg_order_value']}")
        print(f"Result:   Score: {prob:.4f} ({prob*100:.1f}%) -> {assigned_risk} RISK (Expected: {item['expected_risk']}) {status_badge}")
        print("-" * 80)
        
    print(f"\n Summary: {passed_count}/{len(SCENARIOS)} scenarios passed successfully.\n")

if __name__ == "__main__":
    run_tests()
