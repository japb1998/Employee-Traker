const mysql = require('mysql');
const inquirer = require('inquirer');
let departmentArray = new Array;
let roleArray = new Array;
let employeeArray = new Array;
const StartingQuestions = [{
    name: 'pick',
    type: 'list',
    question: 'What would you like to do?',
    choices: ['add employee', 'add Department', 'add Role', 'view Employee', 'view Roles', 'view Departments', 'Update Employee Role', 'EXIT']
}];

const addEmployeeQuestions = [{
        type: 'input',
        name: 'firstName',
        question: "What's the employee first name?",
    },
    {
        type: 'input',
        name: 'lastName',
        question: "What's the employee last name?",
    },
    {
        type: 'list',
        name: 'role',
        question: "What's the employee's role?",
        choices: roleArray
    },
    {
        type: 'list',
        name: 'department',
        question: "What's the employee's department?",
        choices: departmentArray
    },
    {
        type: 'list',
        name: 'manager',
        question: "Who's the employee's manager?",
        choices: employeeArray
    }
];

const addDepartment = [{
    name: 'newDepartment',
    type: 'input',
    question: "Name of the new department:"
}];
const addRole = [{
        name: 'newRole',
        type: 'input',
        question: 'New Role:'
    }, {
        name: 'salary',
        type: 'input',
        question: "What's the desire salary?",
        validate: function (value) {
            if (!isNaN(value)) {
                return true
            } else {
                return 'it needs to be a number'
            }
        }
    },
    {
        type: 'list',
        name: 'roleDepartment',
        question: 'designated department:',
        choices: departmentArray
    }
];

const updateEmployeeQuestions = [{
    type: 'list',
    name: 'employee',
    question: 'What employee do you want to modify?',
    choices: employeeArray
}, {
    type: 'list',
    name: 'role',
    question: 'What is the new role?',
    choices: roleArray
}]


const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    port: 3306,
    password: '',
    database: 'company_db'
});

connection.connect((err) => {
    if (err) throw err;
    console.log('Live')
})

//creates a new employee
function addEmployeeToSql() {
    connection.query('SELECT * FROM employee', (err, employees) => {
        employees.forEach((employee) => {
            employeeArray.push({
                name: employee.first_name,
                value: employee.id
            })
        })
        inquirer.prompt(addEmployeeQuestions).then(({
            firstName,
            lastName,
            role,
            department,
            manager
        }) => {
            createEmployeeTable(firstName, lastName, role, department, manager);

        })
    })
}

function createEmployeeTable(firstName, lastName, role, department_id, manager) {
    connection.query('INSERT INTO employee SET ?', {
        first_name: firstName,
        last_name: lastName,
        role_id: role,
        department_id,
        manager_id: manager
    }, (err, res) => {
        if (err) throw err;
        console.log(res);
        //after employee is added it starts again
        ask();

    })
};

function updateEmployee() {
    connection.query('SELECT * FROM role', (err, roles) => {
        roles.forEach((role) => {
            roleArray.push({
                name: role.title,
                value: role.id
            })
        });
        connection.query('SELECT * FROM employee', (err, employees) => {
            employees.forEach((employee) => {
                employeeArray.push({
                    name: employee.first_name,
                    value: employee.id
                })
            })
            inquirer.prompt(updateEmployeeQuestions).then(({
                employee,
                role
            }) => {



                connection.query('UPDATE employee SET ? WHERE ?', [{
                    role_id: role
                }, {
                    id: employee
                }], (err, res) => {
                    if (err) throw err;
                    console.log(res);
                    displayEmployeeTable();
                })
            })
        })

    })

};

//delete an employee
function deleteEmployee(id) {

    connection.query('DELETE FROM employee WHERE ?', {
        id: id
    }, (err, res) => {
        if (err) throw err;
        console.log(res);
        displayEmployeeTable();
    })
};
//DISPLAY EMPLOYEE
function displayEmployeeTable() {
    connection.query("SELECT e.last_name,e.first_name,m.last_name,m.first_name FROM employee e, employee m WHERE m.id = e.manager_id", (err, data) => {


        connection.query("SELECT employee.first_name, employee.last_name, department.name, role.title,  role.salary FROM employee INNER JOIN  department ON employee.department_id = department.id INNER JOIN role on employee.role_id = role.id", (err, res) => {

            for (let i = 0; i < res.length; i++) {
                let template = ` Name: ${res[i].first_name},Last Name: ${res[i].last_name}, Department: ${res[i].name}, Role:${res[i].title},Salary:${res[i].salary},` + `Manager:${data[i].first_name}
                -------------------------------------------`
                console.log(template);

            }
            ask();
        })
    })
}

//add Department
function askDepartment() {
    inquirer.prompt(addDepartment).then(({
        newDepartment
    }) => {
        addDepartmentToSQL(newDepartment);
    })
}

function addDepartmentToSQL(newDepartment) {
    connection.query('INSERT INTO  department SET ?', {
        name: newDepartment
    }, (err, res) => {
        if (err) throw err;
        //Running ask() again
        ask();

    })

};
//display the existing departments
function displayDepartment() {
    connection.query('SELECT * FROM department', (err, res) => {
        for (let i = 0; i < res.length; i++) {
            let template = `Department: ${res[i].name}
            -------------------------------------------`
            console.log(template)
        }
        //ask again
        ask();
    })

};
// addDepartment();


//ROLE
function askRole() {
    connection.query('SELECT * FROM department', (err, arr) => {
        //departments array
        arr.forEach(element => {
            departmentArray.push({
                name: element.name,
                value: element.id
            });
        });
        inquirer.prompt(addRole).then(({
            newRole,
            salary,
            roleDepartment
        }) => {
            addRoletoSQL(newRole, salary, roleDepartment)
        })
    })
}

function addRoletoSQL(title, salary, department) {

    connection.query('INSERT INTO role SET ?', {
        title: title,
        salary: salary,
        department_id: department
    }, (err, res) => {
        if (err) throw err;
        //RUN ASK AGAIN
        ask();

    })
};


function displayRole() {
    connection.query('SELECT role.title, role.salary, department.name FROM role INNER JOIN department ON role.department_id = department.id;', (err, res) => {
        ;

        for (let i = 0; i < res.length; i++) {
            let template = `Role: ${res[i].title}, Salary:${res[i].salary}, Department:${res[i].name}
            -------------------------------------------`
            console.log(template)
        }
        ask();
    })

}



//Pushing to deparmentArray and roleArray
function creatingList() {
    connection.query('SELECT * FROM department', (err, arr) => {
        //departments array
        arr.forEach(element => {
            departmentArray.push({
                name: element.name,
                value: element.id
            });
        });
        connection.query('SELECT * FROM role', (err, roles) => {
            roles.forEach((role) => {
                roleArray.push({
                    name: role.title,
                    value: role.id
                })
            })
            addEmployeeToSql();
        })
    })
    //creating a roles array
}

function ask() {
    inquirer.prompt(StartingQuestions).then((res) => {
        if (res.pick === 'add employee') {
            //creating a departments array 
            creatingList();
        };
        if (res.pick === 'add Department') {
            askDepartment();
        };
        if (res.pick === 'add Role') {
            askRole();
        };
        if (res.pick === 'view Employee') {
            displayEmployeeTable();
        };
        if (res.pick === 'view Roles') {
            displayRole();
        };

        if (res.pick === 'view Departments') {
            displayDepartment()
        };
        if (res.pick === 'Update Employee Role') {
            updateEmployee();
        }
        if (res.pick === 'EXIT') {
            connection.end();
        };

    })
};

// function addEmployee

ask();