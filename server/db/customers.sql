create table customers (
	user_id int primary key AUTO_INCREMENT,
	username Varchar(50) not null,
    password Varchar(100) not null, 
    role Varchar(10) not null,
    unique index (username)
);

create table products (
	product_id int primary key AUTO_INCREMENT,	
	name Varchar(50) not null,
    price Double not null,
    quantity Integer not null, 
    img_path Varchar(150) not null,
    unique index (product_id)
);

drop table products;
drop table customers;

Insert into customers (username,password) values ("parth", "veluri");

Insert into products values (2, "veluii", 55, 65, "a");

update customers set role = "admin" where username = "pv";

DELETE FROM products WHERE namess = "veluii";

select * from customers;

select * from products;


select * from products where name = "a";

select * from customers where username = "k";