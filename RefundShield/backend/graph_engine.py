import pandas as pd
import networkx as nx
import json
import uuid

def build_and_analyze_graph():
    print("Building Relationship Graph...")
    accounts_df = pd.read_csv('accounts.csv')
    
    # In a real app we'd load orders_scored.csv, but we might just run this standalone.
    try:
        orders_df = pd.read_csv('orders_scored.csv')
    except:
        print("orders_scored.csv not found, using orders.csv")
        orders_df = pd.read_csv('orders.csv')
        orders_df['risk_score'] = 0.5 # Dummy if not scored yet
        orders_df['risk_level'] = 'MEDIUM'
        
    G = nx.Graph()
    
    # Add nodes and edges
    for _, row in accounts_df.iterrows():
        acc_id = row['account_id']
        dev_id = row['device_id']
        addr_id = row['address_id']
        
        G.add_node(acc_id, type='account')
        G.add_node(dev_id, type='device')
        G.add_node(addr_id, type='address')
        
        G.add_edge(acc_id, dev_id)
        G.add_edge(acc_id, addr_id)
        
    # Find Connected Components (Clusters)
    clusters = []
    components = list(nx.connected_components(G))
    
    cluster_counter = 1
    for comp in components:
        comp_accounts = [n for n in comp if str(n).startswith('ACC_')]
        comp_devices = [n for n in comp if str(n).startswith('DEV_')]
        comp_addresses = [n for n in comp if str(n).startswith('ADDR_')]
        
        # We only care about clusters with >1 account
        if len(comp_accounts) > 1:
            cluster_id = f"C{cluster_counter:03d}"
            cluster_counter += 1
            
            # Aggregate order data for these accounts
            cluster_orders = orders_df[orders_df['account_id'].isin(comp_accounts)]
            
            total_orders = len(cluster_orders)
            total_value = float(cluster_orders['amount'].sum()) if total_orders > 0 else 0
            
            # Calculate refunds
            if 'refund_requested' in cluster_orders.columns:
                total_refunds = int(cluster_orders['refund_requested'].sum())
                refund_value = float(cluster_orders[cluster_orders['refund_requested'] == 1]['amount'].sum())
            else:
                total_refunds = 0
                refund_value = 0
                
            refund_rate = (total_refunds / total_orders) if total_orders > 0 else 0
            
            # Calculate avg risk score
            if 'risk_score' in cluster_orders.columns:
                avg_risk = float(cluster_orders['risk_score'].mean())
            else:
                avg_risk = 0.0
                
            # Determine cluster risk level
            if avg_risk > 0.75 and refund_rate > 0.6:
                risk_level = "HIGH"
            elif avg_risk > 0.4 or refund_rate > 0.3:
                risk_level = "MEDIUM"
            else:
                risk_level = "LOW"
                
            cluster_info = {
                "cluster_id": cluster_id,
                "accounts": list(comp_accounts),
                "devices": list(comp_devices),
                "addresses": list(comp_addresses),
                "num_accounts": len(comp_accounts),
                "num_orders": total_orders,
                "total_order_value": total_value,
                "total_refunds": total_refunds,
                "refund_value": refund_value,
                "refund_rate": refund_rate,
                "avg_risk_score": avg_risk,
                "risk_level": risk_level
            }
            clusters.append(cluster_info)
            
    # Sort by risk (High first) then by number of accounts
    def risk_weight(r):
        return {"HIGH": 3, "MEDIUM": 2, "LOW": 1}.get(r, 0)
        
    clusters.sort(key=lambda x: (risk_weight(x['risk_level']), x['num_accounts']), reverse=True)
    
    with open('clusters.json', 'w') as f:
        json.dump(clusters, f, indent=4)
        
    print(f"Identified {len(clusters)} suspicious clusters.")
    
if __name__ == "__main__":
    build_and_analyze_graph()
