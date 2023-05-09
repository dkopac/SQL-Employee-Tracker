const mysql = require("mysql");
const inquirer = require("inquirer");
const cTable = require("console.table");
const format = require("format-number");

// Connection to MySQL
const connection = mysql.createConnection({
  host: "127.0.0.1",
  port: 3306,
  user: "dkopac",
  password: "Buddy711",
  database: "employee_db",
});

// Connect to MySQL server and database
connection.connect((err) => {
  if (err) throw err;
  console.log("Connected as id " + connection.threadId);
  start();
});

// Start function
function start() {
  inquirer
    .prompt({
      name: "action",
      type: "list",
      message: "What would you like to do?",
      choices: [
        "View all employees",
        "View all departments",
        "View all roles",
        "Add employee",
        "Add department",
        "Add role",
        "Update employee role",
        "Exit",
      ],
    })
    .then((answer) => {
      switch (answer.action) {
        case "View all employees":
          viewAllEmployees();
          break;
        case "View all departments":
          viewAllDepartments();
          break;
        case "View all roles":
          viewAllRoles();
          break;
        case "Add employee":
          addEmployee();
          break;
        case "Add department":
          addDepartment();
          break;
        case "Add role":
          addRole();
          break;
        case "Update employee role":
          updateEmployeeRole();
          break;
        case "Exit":
          connection.end();
          break;
      }
    });
}

// View all employees
function viewAllEmployees() {
  console.log("Viewing all employees...\n");
  connection.query(
    "SELECT employee.id, employee.first_name, employee.last_name, role.title, role.salary, department.name AS department, CONCAT(manager.first_name, ' ', manager.last_name) AS manager FROM employee LEFT JOIN role ON employee.role_id = role.id LEFT JOIN department ON role.department_id = department.id LEFT JOIN employee manager ON manager.id = employee.manager_id",
    (err, res) => {
      if (err) throw err;
      console.table(res);
      start();
    }
  );
}

// View all departments
function viewAllDepartments() {
  console.log("Viewing all departments...\n");
  connection.query("SELECT * FROM department", (err, res) => {
    if (err) throw err;
    console.table(res);
    start();
  });
}

// View all roles
function viewAllRoles() {
  console.log("Viewing all roles...\n");
  connection.query("SELECT * FROM role", (err, res) => {
    if (err) throw err;
    console.table(res);
    start();
  });
}

// Add employee
function addEmployee() {
  console.log("Adding employee...\n");
  connection.query("SELECT * FROM role", (err, res) => {
    if (err) throw err;
    const roles = res.map((role) => {
      return {
        name: role.title,
        value: role.id,
      };
    });
    inquirer
      .prompt([
        {
          name: "firstName",
          type: "input",
          message: "What is the employee's first name?",
        },
        {
          name: "lastName",
          type: "input",
          message: "What is the employee's last name?",
        },
        {
          name: "role",
          type: "list",
          message: "What is the employee's role?",
          choices: roles,
        },
      ])
      .then((answer) => {
        connection.query(
          "INSERT INTO employee SET ?",
          {
            first_name: answer.firstName,
            last_name: answer.lastName,
            role_id: answer.role,
          },
          (err) => {
            if (err) throw err;
            console.log("Employee added successfully!");
            start();
          }
        );
      });
  });
}

// Add department
function addDepartment() {
  console.log("Adding department...\n");
  inquirer
    .prompt([
      {
        name: "departmentName",
        type: "input",
        message: "What is the name of the department?",
      },
    ])
    .then((answer) => {
      connection.query(
        "INSERT INTO department SET ?",
        {
          name: answer.departmentName,
        },
        (err) => {
          if (err) throw err;
          console.log("Department added successfully!");
          start();
        }
      );
    });
}

// Add role
function addRole() {
  console.log("Adding role...\n");
  connection.query("SELECT * FROM department", (err, res) => {
    if (err) throw err;
    const departments = res.map((department) => {
      return {
        name: department.name,
        value: department.id,
      };
    });
    inquirer
      .prompt([
        {
          name: "roleName",
          type: "input",
          message: "What is the name of the role?",
        },
        {
          name: "salary",
          type: "input",
          message: "What is the salary of the role?",
          validate: (value) => {
            if (isNaN(value) === false) {
              return true;
            }
            return false;
          },
        },
        {
          name: "department",
          type: "list",
          message: "What is the department of the role?",
          choices: departments,
        },
      ])
      .then((answer) => {
        connection.query(
          "INSERT INTO role SET ?",
          {
            title: answer.roleName,
            salary: answer.salary,
            department_id: answer.department,
          },
          (err) => {
            if (err) throw err;
            console.log("Role added successfully!");
            start();
          }
        );
      });
  });
}

// Update employee role
function updateEmployeeRole() {
  console.log("Updating employee role...\n");
  connection.query("SELECT * FROM employee", (err, res) => {
    if (err) throw err;
    const employees = res.map((employee) => {
      return {
        name: employee.first_name + " " + employee.last_name,
        value: employee.id,
      };
    });
    connection.query("SELECT * FROM role", (err, res) => {
      if (err) throw err;
      const roles = res.map((role) => {
        return {
          name: role.title,
          value: role.id,
        };
      });
      inquirer
        .prompt([
          {
            name: "employee",
            type: "list",
            message: "Which employee's role would you like to update?",
            choices: employees,
          },
          {
            name: "role",
            type: "list",
            message:
              "Which role would you like to assign the selected employee?",
            choices: roles,
          },
        ])
        .then((answer) => {
          connection.query(
            "UPDATE employee SET ? WHERE ?",
            [
              {
                role_id: answer.role,
              },
              {
                id: answer.employee,
              },
            ],
            (err) => {
              if (err) throw err;
              console.log("Employee role updated successfully!");
              start();
            }
          );
        });
    });
  });
}
