import os
import json
import logging
from flask import Flask, render_template, request, redirect, url_for, session, jsonify, send_from_directory

# Configure logging
logging.basicConfig(level=logging.DEBUG)

# Create Flask app
app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "dev-secret-key")

# Load products data
def load_products():
    try:
        with open('static/data/products.json', 'r') as f:
            return json.load(f)
    except Exception as e:
        logging.error(f"Error loading products: {e}")
        return {"categories": [], "products": []}

@app.route('/')
def index():
    data = load_products()
    category = request.args.get('category', 'all')
    search_query = request.args.get('search', '').lower()
    min_price = request.args.get('min_price', '')
    max_price = request.args.get('max_price', '')
    sort_by = request.args.get('sort_by', 'default')
    
    # Start with all products
    filtered_products = data['products']
    
    # Filter by category if needed
    if category != 'all':
        filtered_products = [p for p in filtered_products if p['category'] == category]
    
    # Filter by search query if provided
    if search_query:
        filtered_products = [p for p in filtered_products if 
                            search_query in p['name'].lower() or 
                            search_query in p['description'].lower() or
                            search_query in p['category'].lower()]
    
    # Filter by price range if provided
    if min_price and min_price.isdigit():
        filtered_products = [p for p in filtered_products if p['price'] >= float(min_price)]
    
    if max_price and max_price.isdigit():
        filtered_products = [p for p in filtered_products if p['price'] <= float(max_price)]
    
    # Sort products
    if sort_by == 'price_low':
        filtered_products = sorted(filtered_products, key=lambda p: p['price'])
    elif sort_by == 'price_high':
        filtered_products = sorted(filtered_products, key=lambda p: p['price'], reverse=True)
    elif sort_by == 'rating':
        filtered_products = sorted(filtered_products, key=lambda p: p['rating'], reverse=True)
    elif sort_by == 'name':
        filtered_products = sorted(filtered_products, key=lambda p: p['name'])
    
    return render_template('index.html', 
                          products=filtered_products,
                          categories=data['categories'],
                          selected_category=category,
                          search_query=search_query,
                          min_price=min_price,
                          max_price=max_price,
                          sort_by=sort_by)

@app.route('/product/<int:product_id>')
def product_detail(product_id):
    data = load_products()
    product = next((p for p in data['products'] if p['id'] == product_id), None)
    
    if not product:
        return redirect(url_for('index'))
    
    return render_template('product_detail.html', 
                          product=product,
                          categories=data['categories'])

@app.route('/cart')
def view_cart():
    data = load_products()
    return render_template('cart.html', categories=data['categories'])

# API endpoint to get product details
@app.route('/api/product/<int:product_id>')
def get_product(product_id):
    data = load_products()
    product = next((p for p in data['products'] if p['id'] == product_id), None)
    
    if not product:
        return jsonify({"error": "Product not found"}), 404
    
    return jsonify(product)

# PWA routes
@app.route('/service-worker.js')
def service_worker():
    return send_from_directory('static/js', 'service-worker.js')

@app.route('/manifest.json')
def manifest():
    return send_from_directory('static', 'manifest.json')

@app.route('/offline')
def offline():
    data = load_products()
    return render_template('offline.html', categories=data['categories'])

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
