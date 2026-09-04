from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import pandas as pd
import json
import os

from agent import generate_investigation_report
from live_streamer import start_stream, stop_stream

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Start live data stream on server startup
    start_stream()
    yield
    stop_stream()

app = FastAPI(title="RefundShield API", lifespan=lifespan)

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def load_orders():
    if os.path.exists('orders_scored.csv'):
        return pd.read_csv('orders_scored.csv')
    return pd.read_csv('orders.csv')

def load_clusters():
    if os.path.exists('clusters.json'):
        with open('clusters.json', 'r') as f:
            return json.load(f)
    return []

@app.get("/api/stats")
def get_stats():
    orders_df = load_orders()
    clusters = load_clusters()
    
    total_orders = len(orders_df)
    
    if 'risk_level' in orders_df.columns:
        flagged_orders = len(orders_df[orders_df['risk_level'] == 'HIGH'])
    else:
        flagged_orders = 0
        
    suspicious_clusters = len([c for c in clusters if c['risk_level'] == 'HIGH'])
    dense_nodes = len([c for c in clusters if c.get('is_dense_living', False)])
    
    if 'risk_level' in orders_df.columns:
        potential_exposure = float(orders_df[orders_df['risk_level'] == 'HIGH']['amount'].sum())
    else:
        potential_exposure = 0.0

    return {
        "total_orders": total_orders,
        "flagged_orders": flagged_orders,
        "suspicious_clusters": suspicious_clusters,
        "dense_nodes": dense_nodes,
        "potential_exposure": potential_exposure
    }

@app.get("/api/orders")
def get_recent_orders(limit: int = 50):
    orders_df = load_orders()
    # Sort by risk score descending, then timestamp descending
    if 'risk_score' in orders_df.columns:
        orders_df = orders_df.sort_values(by=['risk_score', 'timestamp'], ascending=[False, False])
    else:
        orders_df = orders_df.sort_values(by='timestamp', ascending=False)
        
    records = orders_df.head(limit).to_dict(orient='records')
    return records

@app.get("/api/clusters")
def get_all_clusters():
    return load_clusters()

@app.get("/api/clusters/{cluster_id}")
def get_cluster(cluster_id: str):
    clusters = load_clusters()
    cluster = next((c for c in clusters if c['cluster_id'] == cluster_id), None)
    if not cluster:
        raise HTTPException(status_code=404, detail="Cluster not found")
        
    # Get associated orders
    orders_df = load_orders()
    cluster_orders = orders_df[orders_df['account_id'].isin(cluster['accounts'])].to_dict(orient='records')
    cluster['order_details'] = cluster_orders
    return cluster

@app.post("/api/investigate/{cluster_id}")
def investigate_cluster(cluster_id: str):
    # Call the AI agent
    report = generate_investigation_report(cluster_id)
    if "error" in report:
        raise HTTPException(status_code=404, detail=report["error"])
    return report

@app.get("/api/metrics")
def get_metrics():
    if os.path.exists('metrics.json'):
        with open('metrics.json', 'r') as f:
            return json.load(f)
    return {"error": "Metrics not found"}

@app.get("/api/stream/status")
def get_stream_status():
    """Returns the current count of live orders — for the frontend live indicator."""
    from datetime import datetime
    orders_df = load_orders()
    return {
        "total_orders": len(orders_df),
        "last_updated": datetime.now().isoformat()
    }
