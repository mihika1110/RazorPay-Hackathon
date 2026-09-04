import json
import time

def generate_investigation_report(cluster_id):
    # Simulate API delay
    time.sleep(2)
    
    with open('clusters.json', 'r') as f:
        clusters = json.load(f)
        
    cluster = next((c for c in clusters if c['cluster_id'] == cluster_id), None)
    
    if not cluster:
        return {"error": "Cluster not found"}
        
    accounts = cluster['num_accounts']
    orders = cluster['num_orders']
    refund_rate = cluster['refund_rate'] * 100
    risk = cluster['risk_level']
    shared_devices = len(cluster['devices'])
    shared_addresses = len(cluster['addresses'])
    
    # AI Logic Simulation
    if risk == "HIGH":
        confidence = 92
        assessment = "The cluster contains multiple independent indicators consistent with coordinated refund/return abuse."
        action = "Send the cluster for manual investigation. Do NOT automatically block the accounts."
        
        evidence = [
            f"{accounts} accounts are associated with {shared_devices} shared device(s).",
            f"The accounts share {shared_addresses} delivery address(es).",
            f"{cluster['total_refunds']} of {orders} orders resulted in refunds ({refund_rate:.1f}%).",
            "Similar products were repeatedly purchased and refunded.",
            "Order activity shows unusually high velocity across related accounts."
        ]
    else:
        # Failure recovery edge case simulation
        confidence = 85
        assessment = "While these accounts share devices/addresses, their behavior does not strongly indicate coordinated abuse. Order velocity and refund rates are within normal household limits."
        action = "Monitor / additional verification. Do NOT block."
        
        evidence = [
            f"Accounts share {shared_addresses} address(es), typical of a legitimate family/household.",
            f"Refund rate is normal ({refund_rate:.1f}%), suggesting legitimate returns rather than abuse.",
            "Purchasing behavior is varied, not targeting a specific item repeatedly.",
            "Order velocity is spread out naturally."
        ]
        
    report = f"""# REFUND ABUSE INVESTIGATION
**Cluster**: {cluster_id}
**Risk Level**: {risk}

## Summary
- **Accounts**: {accounts}
- **Orders**: {orders}
- **Total Order Value**: ₹{cluster['total_order_value']:.2f}
- **Total Refunded**: ₹{cluster['refund_value']:.2f} ({refund_rate:.1f}%)

## Key Evidence
"""
    for i, ev in enumerate(evidence, 1):
        report += f"{i}. {ev}\n"
        
    report += f"""
## Assessment
{assessment}

**Confidence**: {confidence}%

## Recommended Action
**{action}**
"""
    return {
        "report": report,
        "cluster_id": cluster_id,
        "risk_level": risk,
        "recommended_action": action
    }

if __name__ == "__main__":
    # Test
    print(generate_investigation_report("C001"))
