const sql = require("mysql2");

const pool = sql.createPool({
    connectionLimit: 20,
    password: "737763",
    user: "root",
    database: "ecom_website",
    host: "localhost",
    port: "3306",
});

let db = {};

db.getAllUsers = () => {
    return new Promise((resolve, reject) => {
        pool.query(
            "SELECT user_id, username, role FROM customers;",
            (err, data) => {
                if (err) {
                    return reject(err);
                }
                return resolve(data);
            }
        );
    });
};

db.createCustomer = (user, pass) => {
    return new Promise((resolve, reject) => {
        pool.query(
            `INSERT INTO customers (username,password,role) VALUES(?,?,?)`,
            [user, pass, "customer"],
            (err, data) => {
                if (err) {
                    return reject(err);
                }
                return resolve(data);
            }
        );
    });
};

db.getCustomerByUsername = (username) => {
    return new Promise((resolve, reject) => {
        pool.query(
            "SELECT * FROM customers WHERE username = (?)",
            [username],
            (err, data) => {
                if (err) {
                    return reject(err);
                }
                return resolve(data);
            }
        );
    });
};

db.createNewProduct = (name, price, quantity, imgPath) => {
    return new Promise((resolve, reject) => {
        pool.query(
            "INSERT INTO products(name, price, quantity, img_path) VALUES (?,?,?,?) ",
            [name, price, quantity, imgPath],
            (err, data) => {
                if (err) {
                    return reject(err);
                }
                return resolve(data);
            }
        );
    });
};

db.getAllProducts = () => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT * FROM products", (err, data) => {
            if (err) {
                return reject(err);
            }
            return resolve(data);
        });
    });
};

db.getProductByName = (productName) => {
    return new Promise((resolve, reject) => {
        pool.query(
            "SELECT * FROM products WHERE name = ?",
            [productName],
            (err, data) => {
                if (err) {
                    return reject(err);
                }
                return resolve(data);
            }
        );
    });
};

db.deleteProduct = (productId) => {
    return new Promise((resolve, reject) => {
        pool.query(
            "DELETE FROM products WHERE product_id = ?",
            [productId],
            (err, data) => {
                if (err) {
                    return reject(err);
                }
                return resolve(data);
            }
        );
    });
};

module.exports = db;
