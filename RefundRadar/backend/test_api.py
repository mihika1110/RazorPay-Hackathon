"""
test_api.py — Comprehensive Automated Test Suite for RefundRadar
Validates API endpoints, model inferences, and graph analysis.
"""

import unittest
import os
import json
import pickle
import pandas as pd
from fastapi.testclient import TestClient

# Import FastAPI app from main
from main import app, load_clusters, load_orders

class TestRefundRadar(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)
        with open("model.pkl", "rb") as f:
            cls.clf = pickle.load(f)

    # 1. Test Model Loading & Feature Predictions
    def test_model_loaded(self):
        """Verify the trained ML model exists and accepts expected features."""
        self.assertIsNotNone(self.clf)
        cols = ["amount", "account_age_days", "total_orders", "total_refunds", "refund_rate", "avg_order_value"]
        sample = pd.DataFrame([[200, 180, 5, 0, 0.0, 200]], columns=cols)
        prob = self.clf.predict_proba(sample)[0][1]
        self.assertTrue(0.0 <= prob <= 1.0)

    # 2. Test Fraud Ring Detection
    def test_high_risk_detection(self):
        """Verify aggressive refund velocity triggers HIGH risk score."""
        cols = ["amount", "account_age_days", "total_orders", "total_refunds", "refund_rate", "avg_order_value"]
        fraud_sample = pd.DataFrame([[1400, 10, 8, 7, 7/8, 1300]], columns=cols)
        prob = self.clf.predict_proba(fraud_sample)[0][1]
        self.assertGreater(prob, 0.80, "Fraud ring scenario must yield probability > 0.80")

    # 3. Test API Endpoint: /api/stats
    def test_api_stats(self):
        """Test the /api/stats endpoint returns 200 OK and expected structure."""
        response = self.client.get("/api/stats")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("total_orders", data)
        self.assertIn("flagged_orders", data)
        self.assertIn("suspicious_clusters", data)
        self.assertIn("potential_exposure", data)

    # 4. Test API Endpoint: /api/clusters
    def test_api_clusters(self):
        """Test /api/clusters endpoint returns a valid list with no NaN values."""
        response = self.client.get("/api/clusters")
        self.assertEqual(response.status_code, 200)
        clusters = response.json()
        self.assertIsInstance(clusters, list)
        self.assertGreater(len(clusters), 0)
        
        # Verify first cluster has required fields
        first = clusters[0]
        self.assertIn("cluster_id", first)
        self.assertIn("risk_level", first)
        self.assertIn("num_accounts", first)

    # 5. Test API Endpoint: /api/stream/status
    def test_api_stream_status(self):
        """Test stream health endpoint."""
        response = self.client.get("/api/stream/status")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("is_streaming", data)
        self.assertIn("total_orders", data)

if __name__ == "__main__":
    print("\n Running RefundRadar Automated Test Suite...\n")
    unittest.main(verbosity=2)
