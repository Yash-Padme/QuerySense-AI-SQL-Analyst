import os
import sqlite3
import random
from pathlib import Path

def seed_database():
    db_url = os.getenv("DATABASE_URL", "")
    if db_url.startswith("sqlite:///"):
        db_path = Path(db_url[10:])
    else:
        current_dir = Path(__file__).resolve()
        base_dir = current_dir.parents[2]
        if (base_dir / "data" / "company.db").exists():
            db_path = base_dir / "data" / "company.db"
        elif (base_dir.parent / "data" / "company.db").exists():
            db_path = base_dir.parent / "data" / "company.db"
        else:
            db_path = base_dir / "data" / "company.db"
            
    db_path.parent.mkdir(parents=True, exist_ok=True)
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    
    # 1. Drop existing tables if any
    cursor.executescript("""
    DROP TABLE IF EXISTS order_items;
    DROP TABLE IF EXISTS orders;
    DROP TABLE IF EXISTS products;
    DROP TABLE IF EXISTS categories;
    DROP TABLE IF EXISTS customers;
    """)
    
    # 2. Create tables
    cursor.executescript("""
    CREATE TABLE customers (
        customer_id INTEGER PRIMARY KEY AUTOINCREMENT,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        city TEXT NOT NULL,
        country TEXT NOT NULL,
        created_at DATE NOT NULL
    );

    CREATE TABLE categories (
        category_id INTEGER PRIMARY KEY AUTOINCREMENT,
        category_name TEXT UNIQUE NOT NULL
    );

    CREATE TABLE products (
        product_id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_name TEXT NOT NULL,
        category_id INTEGER NOT NULL,
        price REAL NOT NULL,
        FOREIGN KEY (category_id) REFERENCES categories (category_id)
    );

    CREATE TABLE orders (
        order_id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_id INTEGER NOT NULL,
        order_date DATE NOT NULL,
        total_amount REAL NOT NULL,
        status TEXT NOT NULL CHECK (status IN ('Completed', 'Pending', 'Cancelled', 'Shipped')),
        FOREIGN KEY (customer_id) REFERENCES customers (customer_id)
    );

    CREATE TABLE order_items (
        order_item_id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        unit_price REAL NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders (order_id),
        FOREIGN KEY (product_id) REFERENCES products (product_id)
    );
    """)

    # 3. Seed Customers
    customers_data = [
        ("Alice", "Smith", "alice.smith@example.com", "New York", "USA", "2024-01-15"),
        ("Bob", "Johnson", "bob.j@example.com", "London", "UK", "2024-01-20"),
        ("Charlie", "Brown", "charlie.b@example.com", "Toronto", "Canada", "2024-02-01"),
        ("Diana", "Prince", "diana.p@example.com", "Sydney", "Australia", "2024-02-10"),
        ("Evan", "Wright", "evan.w@example.com", "Berlin", "Germany", "2024-02-15"),
        ("Fiona", "Gallagher", "fiona.g@example.com", "Chicago", "USA", "2024-03-01"),
        ("George", "Clark", "george.c@example.com", "Paris", "France", "2024-03-10"),
        ("Hannah", "Abbott", "hannah.a@example.com", "Tokyo", "Japan", "2024-03-15"),
        ("Ian", "Malcolm", "ian.m@example.com", "San Francisco", "USA", "2024-04-01"),
        ("Julia", "Roberts", "julia.r@example.com", "Los Angeles", "USA", "2024-04-10"),
    ]
    cursor.executemany(
        "INSERT INTO customers (first_name, last_name, email, city, country, created_at) VALUES (?, ?, ?, ?, ?, ?)",
        customers_data
    )

    # 4. Seed Categories
    categories = ["Electronics", "Furniture", "Clothing", "Books", "Sports"]
    cursor.executemany("INSERT INTO categories (category_name) VALUES (?)", [(c,) for c in categories])

    # 5. Seed Products
    products_data = [
        ("MacBook Pro 16", 1, 2499.99),
        ("iPhone 15 Pro", 1, 1199.99),
        ("Sony WH-1000XM5 Headphones", 1, 399.99),
        ("Ergonomic Office Chair", 2, 299.99),
        ("Standing Desk", 2, 499.99),
        ("Modern Leather Sofa", 2, 899.99),
        ("Denim Jacket", 3, 79.99),
        ("Running Shoes", 3, 129.99),
        ("Python Data Science Handbook", 4, 49.99),
        ("Designing Data-Intensive Applications", 4, 59.99),
        ("Mountain Bike", 5, 699.99),
        ("Yoga Mat", 5, 29.99),
    ]
    cursor.executemany(
        "INSERT INTO products (product_name, category_id, price) VALUES (?, ?, ?)",
        products_data
    )

    # 6. Seed Orders and Order Items
    random.seed(42)
    statuses = ["Completed", "Completed", "Completed", "Pending", "Shipped"]
    
    order_id = 1
    for cust_id in range(1, len(customers_data) + 1):
        num_orders = random.randint(2, 5)
        for _ in range(num_orders):
            month = random.randint(1, 6)
            day = random.randint(1, 28)
            order_date = f"2024-{month:02d}-{day:02d}"
            status = random.choice(statuses)
            
            # Select 1-3 random products for this order
            num_items = random.randint(1, 3)
            selected_products = random.sample(products_data, num_items)
            
            total_amount = 0.0
            items_to_insert = []
            
            for prod in selected_products:
                prod_name, cat_id, price = prod
                # Find product_id
                cursor.execute("SELECT product_id FROM products WHERE product_name = ?", (prod_name,))
                prod_id = cursor.fetchone()[0]
                
                qty = random.randint(1, 3)
                item_total = price * qty
                total_amount += item_total
                
                items_to_insert.append((order_id, prod_id, qty, price))
            
            cursor.execute(
                "INSERT INTO orders (customer_id, order_date, total_amount, status) VALUES (?, ?, ?, ?)",
                (cust_id, order_date, round(total_amount, 2), status)
            )
            
            cursor.executemany(
                "INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)",
                items_to_insert
            )
            
            order_id += 1

    conn.commit()
    conn.close()
    print(f"Successfully seeded database at: {db_path}")

if __name__ == "__main__":
    seed_database()
