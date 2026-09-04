import pandas as pd
import numpy as np
import uuid
import random
from datetime import datetime, timedelta

def generate_synthetic_data(num_normal=800, num_abusive_clusters=20):
    np.random.seed(42)
    random.seed(42)

    accounts = []
    orders = []
    
    products = [f"PROD_{i}" for i in range(100, 150)]
    categories = ["Electronics", "Clothing", "Home", "Beauty", "Sports"]

    current_date = datetime(2026, 9, 1)

    def create_account(account_id, is_abusive, device_id, address_id):
        creation_days_ago = random.randint(10, 365)
        if is_abusive:
            creation_days_ago = random.randint(1, 30) # Abuse accounts often newer
        
        creation_date = current_date - timedelta(days=creation_days_ago)
        return {
            "account_id": account_id,
            "account_creation_date": creation_date.isoformat(),
            "account_age_days": creation_days_ago,
            "device_id": device_id,
            "address_id": address_id,
            "abuse_label": 1 if is_abusive else 0
        }

    # Generate Normal Accounts
    for i in range(num_normal):
        acc_id = f"ACC_N_{i}"
        dev_id = f"DEV_N_{i}"
        addr_id = f"ADDR_N_{i}"
        
        # Introduce some normal shared devices/addresses (e.g. family)
        if i % 10 == 0 and i > 0:
            dev_id = f"DEV_N_{i-1}"
            addr_id = f"ADDR_N_{i-1}"
            
        acc = create_account(acc_id, False, dev_id, addr_id)
        accounts.append(acc)
        
        # Varying refund rate per normal user (0-20% usually, sometimes up to 60% for 'wardrobing')
        base_refund_rate = random.uniform(0, 0.2) if random.random() > 0.15 else random.uniform(0.2, 0.6)
        
        # Generate Normal Orders
        num_orders = random.randint(1, 15)
        for j in range(num_orders):
            order_date = current_date - timedelta(days=random.randint(1, acc["account_age_days"]))
            amount = round(random.uniform(20, 500), 2)
            
            refund_requested = 1 if random.random() < base_refund_rate else 0
            
            orders.append({
                "order_id": f"ORD_{acc_id}_{j}",
                "account_id": acc_id,
                "timestamp": order_date.isoformat(),
                "product_id": random.choice(products),
                "category": random.choice(categories),
                "amount": amount,
                "device_id": acc["device_id"],
                "address_id": acc["address_id"],
                "order_status": "REFUNDED" if refund_requested else "COMPLETED",
                "refund_requested": refund_requested,
                "refund_amount": amount if refund_requested else 0.0,
                "refund_timestamp": (order_date + timedelta(days=random.randint(1, 5))).isoformat() if refund_requested else None
            })

    # Generate Abusive Clusters
    cluster_counter = 0
    for i in range(num_abusive_clusters):
        cluster_id = f"CLUSTER_A_{i}"
        cluster_dev_id = f"DEV_A_{i}"
        cluster_addr_id = f"ADDR_A_{i}"
        
        # Some variation: multiple devices/addresses in one cluster
        num_accounts_in_cluster = random.randint(4, 12)
        target_product = random.choice(products) # Coordinated abuse often targets same item
        
        for j in range(num_accounts_in_cluster):
            acc_id = f"ACC_A_{cluster_counter}"
            cluster_counter += 1
            
            # 80% chance to share main cluster device/address, 20% different
            dev_id = cluster_dev_id if random.random() < 0.8 else f"DEV_A_ALT_{cluster_counter}"
            addr_id = cluster_addr_id if random.random() < 0.8 else f"ADDR_A_ALT_{cluster_counter}"
            
            acc = create_account(acc_id, True, dev_id, addr_id)
            accounts.append(acc)
            
            # Abusive refund rate varies to evade detection (40% to 100%)
            base_refund_rate = random.uniform(0.4, 1.0)
            
            # High order velocity
            num_orders = random.randint(5, 25)
            for k in range(num_orders):
                order_date = current_date - timedelta(days=random.randint(1, min(acc["account_age_days"], 15)))
                amount = round(random.uniform(50, 1500), 2)
                
                refund_requested = 1 if random.random() < base_refund_rate else 0
                
                orders.append({
                    "order_id": f"ORD_{acc_id}_{k}",
                    "account_id": acc_id,
                    "timestamp": order_date.isoformat(),
                    "product_id": target_product if random.random() < 0.7 else random.choice(products),
                    "category": "Electronics",
                    "amount": amount,
                    "device_id": acc["device_id"],
                    "address_id": acc["address_id"],
                    "order_status": "REFUNDED" if refund_requested else "COMPLETED",
                    "refund_requested": refund_requested,
                    "refund_amount": amount if refund_requested else 0.0,
                    "refund_timestamp": (order_date + timedelta(days=random.randint(1, 2))).isoformat() if refund_requested else None
                })

    df_accounts = pd.DataFrame(accounts)
    df_orders = pd.DataFrame(orders)
    
    return df_accounts, df_orders

if __name__ == "__main__":
    print("Generating synthetic data...")
    df_accounts, df_orders = generate_synthetic_data()
    df_accounts.to_csv("accounts.csv", index=False)
    df_orders.to_csv("orders.csv", index=False)
    print(f"Generated {len(df_accounts)} accounts and {len(df_orders)} orders.")
