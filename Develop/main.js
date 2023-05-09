const mysql = require("mysql");
const inquirer = require("inquirer");
const cTable = require("console.table");
const format = require("format-number");

// Connection to MySQL
const connection = mysql.createConnection({
  host: "localhost",
  port: 3001,
  user: "root",
  password: "password",
  database: "employee_trackerDB",
});
