"""
test_predict.py — Interactive & Custom Value Prediction Tester for RefundRadar

Usage:
  1. Interactive prompt (enter custom values):
     python test_predict.py

  2. Command line arguments:
     python test_predict.py --amount 1200 --age 15 --orders 7 --refunds 6

  3. Run all preset benchmarks:
     python test_predict.py --presets
"""

import os
import sys
import argparse
import pickle
import pandas as pd

MODEL_PATH = os.path.join(os.path.dirname(__file__), "model.pkl")

def load_model():
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(f"Model file '{MODEL_PATH}' not found. Please train model with ml_model.py.")
    with open(MODEL_PATH, "rb") as f:
        return pickle.load(f)

def predict_single(clf, amount, account_age_days, total_orders, total_refunds, avg_order_value=None):
    if total_orders <= 0:
        total_orders = 1
    
    refund_rate = total_refunds / total_orders
    if avg_order_value is None:
        avg_order_value = amount

    cols = ["amount", "account_age_days", "total_orders", "total_refunds", "refund_rate", "avg_order_value"]
    input_df = pd.DataFrame([[amount, account_age_days, total_orders, total_refunds, refund_rate, avg_order_value]], columns=cols)
    
    prob = clf.predict_proba(input_df)[0][1]
    
    if prob > 0.80:
        risk_level = "HIGH"
        action = "🚨 FLAG FOR INVESTIGATION / HOLD REFUND"
        color_code = "\033[91m" # Red
    elif prob > 0.40:
        risk_level = "MEDIUM"
        action = "⚠️ ROUTE TO MANUAL REVIEW QUEUE"
        color_code = "\033[93m" # Yellow
    else:
        risk_level = "LOW"
        action = "✅ AUTO-APPROVE / STANDARD PROCESSING"
        color_code = "\033[92m" # Green
        
    reset_code = "\033[0m"

    print("\n" + "="*60)
    print(" 📡 REFUNDRADAR — TRANSACTION RISK ASSESSMENT")
    print("="*60)
    print(f" Order Amount:        ₹{amount:.2f}")
    print(f" Account Age:         {account_age_days} days")
    print(f" Order History:       {total_orders} lifetime orders")
    print(f" Refund History:      {total_refunds} lifetime refunds ({refund_rate*100:.1f}%)")
    print(f" Average Basket:      ₹{avg_order_value:.2f}")
    print("-"*60)
    print(f" Risk Score:          {color_code}{prob:.4f} ({prob*100:.2f}% Probability){reset_code}")
    print(f" Risk Classification: {color_code}{risk_level} RISK{reset_code}")
    print(f" Recommended Action:  {action}")
    print("="*60 + "\n")

    return prob, risk_level

def run_presets(clf):
    presets = [
        ("1. University Student (Dorm)", 220, 180, 5, 0),
        ("2. Regular Shopper (Size Return)", 320, 240, 10, 1),
        ("3. Moderate Returner (Review Queue)", 450, 120, 7, 2),
        ("4. Coordinated Fraud Syndicate", 1200, 15, 7, 6),
        ("5. Wardrobing / Serial Abuser", 1600, 10, 5, 4),
    ]
    for name, amt, age, orders, refunds in presets:
        print(f"\n--- Preset: {name} ---")
        predict_single(clf, amt, age, orders, refunds)

def interactive_mode(clf):
    print("\n=======================================================")
    print(" 📡 Welcome to RefundRadar Custom Value Tester")
    print("=======================================================")
    print("Enter transaction and account details to test model risk scoring.")
    print("Press Ctrl + C at any time to exit.\n")
    
    try:
        while True:
            amt_str = input("Enter Order Amount in ₹ (e.g. 450): ").strip()
            if not amt_str:
                break
            amount = float(amt_str)
            
            age_str = input("Enter Account Age in days (e.g. 120): ").strip()
            age = int(age_str) if age_str else 30
            
            orders_str = input("Enter Total Lifetime Orders (e.g. 7): ").strip()
            orders = int(orders_str) if orders_str else 1
            
            refunds_str = input(f"Enter Total Refunds Requested (0 to {orders}): ").strip()
            refunds = int(refunds_str) if refunds_str else 0
            
            predict_single(clf, amount, age, orders, refunds)
            
            cont = input("Test another transaction? (y/n): ").strip().lower()
            if cont not in ['y', 'yes']:
                print("\nGoodbye!")
                break
    except KeyboardInterrupt:
        print("\nExited.")

def main():
    parser = argparse.ArgumentParser(description="RefundRadar ML Prediction Tester")
    parser.add_argument("--amount", type=float, help="Transaction amount in INR")
    parser.add_argument("--age", type=int, help="Account age in days")
    parser.add_argument("--orders", type=int, help="Total orders placed")
    parser.add_argument("--refunds", type=int, help="Total refunds requested")
    parser.add_argument("--aov", type=float, help="Average order value (optional)")
    parser.add_argument("--presets", action="store_true", help="Run all standard presets")

    args = parser.parse_args()
    clf = load_model()

    if args.presets:
        run_presets(clf)
    elif args.amount is not None:
        age = args.age if args.age is not None else 30
        orders = args.orders if args.orders is not None else 1
        refunds = args.refunds if args.refunds is not None else 0
        predict_single(clf, args.amount, age, orders, refunds, args.aov)
    else:
        interactive_mode(clf)

if __name__ == "__main__":
    main()
