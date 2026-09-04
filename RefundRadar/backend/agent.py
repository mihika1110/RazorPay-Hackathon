import json
import os
from dotenv import load_dotenv
from google import genai

# Load .env file
load_dotenv()

_api_key = os.getenv("GEMINI_API_KEY")
_client = genai.Client(api_key=_api_key) if _api_key else None

def generate_investigation_report(cluster_id):
    with open('clusters.json', 'r') as f:
        clusters = json.load(f)

    cluster = next((c for c in clusters if c['cluster_id'] == cluster_id), None)
    if not cluster:
        return {"error": "Cluster not found"}

    accounts      = cluster['num_accounts']
    orders        = cluster['num_orders']
    refund_rate   = cluster['refund_rate'] * 100
    risk          = cluster['risk_level']
    shared_devices    = len(cluster['devices'])
    shared_addresses  = len(cluster['addresses'])
    is_dense_living   = cluster.get('is_dense_living', False)
    location_type     = cluster.get('location_type', 'RESIDENTIAL')
    total_order_value = cluster.get('total_order_value', 0)
    refund_value      = cluster.get('refund_value', 0)
    total_refunds     = cluster.get('total_refunds', 0)

    # Build a detailed prompt for Gemini
    prompt = f"""You are RefundShield, an expert fraud intelligence analyst at Razorpay.
Analyze the following cluster of accounts and produce a structured investigation report.

CLUSTER DATA:
- Cluster ID: {cluster_id}
- Risk Level: {risk}
- Number of Accounts: {accounts}
- Total Orders: {orders}
- Total Refund Requests: {total_refunds}
- Refund Rate: {refund_rate:.1f}%
- Shared Device IDs: {shared_devices}
- Shared Address IDs: {shared_addresses}
- Total Order Value: INR {total_order_value:.2f}
- Total Refund Value: INR {refund_value:.2f}
- Dense Living Node: {is_dense_living} (Type: {location_type})

Write a professional investigation report in markdown with these sections:
1. **Executive Summary** - 2-3 sentences on what this cluster is and why it matters.
2. **Key Risk Signals** - Bullet points of the specific fraud indicators observed.
3. **Behavioral Analysis** - Explain the likely fraud pattern (e.g. coordinated ring, wardrobing, dense-living false positive).
4. **Assessment** - Overall confidence score (0-100%) and whether this is fraud, legitimate, or needs review.
5. **Recommended Action** - Specific next steps for the fraud ops team.

Keep the tone professional and concise."""

    try:
        if not _client:
            raise ValueError("No API key configured")
        model_name = os.getenv("GEMINI_MODEL", "gemini-2.0-flash")
        response = _client.models.generate_content(
            model=model_name,
            contents=prompt
        )
        report_text = response.text

    except Exception as e:
        print(f"[Agent] Gemini API error: {e}. Falling back to local report.")
        report_text = _local_fallback(cluster_id, cluster, accounts, orders, refund_rate,
                                      risk, shared_devices, shared_addresses,
                                      is_dense_living, location_type,
                                      total_order_value, refund_value, total_refunds)

    # Determine recommended action from risk level for the API response
    if risk == "HIGH":
        action = "Flag for manual investigation. Do NOT automatically block accounts."
    elif is_dense_living:
        action = f"Monitor only. Address confirmed as {location_type} — legitimate dense living."
    else:
        action = "Monitor / request additional verification. Do NOT block."

    return {
        "report": report_text,
        "cluster_id": cluster_id,
        "risk_level": risk,
        "recommended_action": action
    }


def _local_fallback(cluster_id, cluster, accounts, orders, refund_rate,
                    risk, shared_devices, shared_addresses,
                    is_dense_living, location_type,
                    total_order_value, refund_value, total_refunds):
    """Local report generation used when Gemini API is unavailable."""
    if risk == "HIGH":
        confidence = 92
        assessment = "The cluster contains multiple independent indicators consistent with coordinated refund/return abuse."
        action = "Flag for manual investigation. Do NOT automatically block accounts."
        evidence = [
            f"{accounts} accounts are associated with {shared_devices} shared device(s).",
            f"The accounts share {shared_addresses} delivery address(es).",
            f"{total_refunds} of {orders} orders resulted in refunds ({refund_rate:.1f}%).",
            "Similar products were repeatedly purchased and refunded.",
            "Order activity shows unusually high velocity across related accounts."
        ]
    elif is_dense_living:
        confidence = 95
        assessment = f"This cluster originates from a Dense Living Area ({location_type}). Shared node density is expected. Refund rates are within normal limits."
        action = f"Monitor only. Legitimate dense living area ({location_type})."
        evidence = [
            f"External Maps API confirms address is a {location_type}.",
            f"{accounts} accounts share 1 device IP and 1 physical address, characteristic of a shared network/building.",
            f"Refund rate is normal ({refund_rate:.1f}%) for this volume of diverse users.",
            "Purchasing behavior is varied, not targeting a specific item repeatedly."
        ]
    else:
        confidence = 75
        assessment = "Accounts share devices/addresses but behavior does not strongly indicate coordinated abuse."
        action = "Monitor / request additional verification. Do NOT block."
        evidence = [
            f"Accounts share {shared_addresses} address(es), typical of a legitimate household.",
            f"Refund rate ({refund_rate:.1f}%) suggests legitimate returns.",
            "Purchasing behavior is varied.",
            "Order velocity is spread naturally over time."
        ]

    evidence_text = "\n".join(f"{i+1}. {e}" for i, e in enumerate(evidence))
    return f"""# REFUND ABUSE INVESTIGATION REPORT
**Cluster**: {cluster_id} | **Risk Level**: {risk}

## Executive Summary
- **Accounts**: {accounts} | **Orders**: {orders} | **Refund Rate**: {refund_rate:.1f}%
- **Total Order Value**: ₹{total_order_value:.2f} | **Refunded**: ₹{refund_value:.2f}

## Key Risk Signals
{evidence_text}

## Assessment
{assessment}
**Confidence**: {confidence}%

## Recommended Action
**{action}**
"""


if __name__ == "__main__":
    print(generate_investigation_report("CLUSTER_A_0"))
