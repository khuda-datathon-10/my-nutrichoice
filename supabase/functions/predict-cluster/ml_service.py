#!/usr/bin/env python3
"""
Standalone Python ML service for cluster prediction.
This can be deployed separately or used locally for development.
"""

import pickle
import numpy as np
from typing import List, Dict
import random

def predict_cluster_and_recommend(
    deficiencies: Dict[str, float],
    food_items: List[Dict],
    model_bytes: bytes,
    scaler_bytes: bytes
) -> List[Dict]:
    """
    Predict cluster for deficiency sample and recommend foods from same cluster.
    
    Args:
        deficiencies: Dict of nutrient deficiencies (권장 - 현재)
        food_items: List of food item dicts from database
        model_bytes: Pickled KMeans model bytes
        scaler_bytes: Pickled StandardScaler bytes
    
    Returns:
        List of 5 recommended food items
    """
    # Load model and scaler
    model = pickle.loads(model_bytes)
    scaler = pickle.loads(scaler_bytes)
    
    # Define feature order (must match training data)
    feature_names = [
        '칼로리', '탄수화물', '단백질', '지방', 
        '비타민A', '티아민', '리보플라빈', '비타민C', '칼슘', '철분'
    ]
    
    # Mapping from deficiency names to feature names
    name_mapping = {
        '에너지': '칼로리',
        '탄수화물': '탄수화물',
        '단백질': '단백질',
        '지방': '지방',
        '비타민A': '비타민A',
        '티아민': '티아민',
        '리보플라빈': '리보플라빈',
        '비타민C': '비타민C',
        '칼슘': '칼슘',
        '철분': '철분'
    }
    
    # Create deficiency feature vector
    deficiency_features = []
    for feature in feature_names:
        # Find matching deficiency value
        value = 0.0
        for def_name, def_value in deficiencies.items():
            if name_mapping.get(def_name) == feature:
                value = def_value
                break
        deficiency_features.append(value)
    
    # Scale deficiency sample
    deficiency_scaled = scaler.transform([deficiency_features])
    
    # Predict cluster for deficiency sample
    target_cluster = model.predict(deficiency_scaled)[0]
    
    print(f"Predicted cluster: {target_cluster}")
    
    # Create feature matrix for all food items
    food_features = []
    valid_foods = []
    
    db_column_mapping = {
        '칼로리': 'calories',
        '탄수화물': 'carbohydrate',
        '단백질': 'protein',
        '지방': 'fat',
        '비타민A': 'vitamin_a',
        '티아민': 'thiamine',
        '리보플라빈': 'riboflavin',
        '비타민C': 'vitamin_c',
        '칼슘': 'calcium',
        '철분': 'iron'
    }
    
    for food in food_items:
        features = []
        valid = True
        for feature_name in feature_names:
            col_name = db_column_mapping[feature_name]
            value = food.get(col_name)
            if value is None or value == '':
                value = 0.0
            try:
                value = float(value)
            except:
                value = 0.0
            features.append(value)
        
        food_features.append(features)
        valid_foods.append(food)
    
    # Scale food features
    food_features_scaled = scaler.transform(food_features)
    
    # Predict clusters for all foods
    food_clusters = model.predict(food_features_scaled)
    
    # Filter foods in same cluster
    same_cluster_foods = [
        valid_foods[i] 
        for i in range(len(valid_foods)) 
        if food_clusters[i] == target_cluster
    ]
    
    print(f"Found {len(same_cluster_foods)} foods in cluster {target_cluster}")
    
    # Randomly select 5 foods
    if len(same_cluster_foods) > 5:
        recommendations = random.sample(same_cluster_foods, 5)
    else:
        recommendations = same_cluster_foods
    
    return recommendations


if __name__ == "__main__":
    # This can be run as a standalone service
    from http.server import HTTPServer, BaseHTTPRequestHandler
    import json
    
    class MLHandler(BaseHTTPRequestHandler):
        def do_POST(self):
            if self.path == '/predict':
                content_length = int(self.headers['Content-Length'])
                post_data = self.rfile.read(content_length)
                request = json.loads(post_data)
                
                model_bytes = bytes(request['modelBuffer'])
                scaler_bytes = bytes(request['scalerBuffer'])
                
                recommendations = predict_cluster_and_recommend(
                    request['deficiencies'],
                    request['foodItems'],
                    model_bytes,
                    scaler_bytes
                )
                
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'recommendations': recommendations}).encode())
    
    server = HTTPServer(('localhost', 8000), MLHandler)
    print('ML service running on http://localhost:8000')
    server.serve_forever()