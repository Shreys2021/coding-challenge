const mongoose = require('mongoose');
const Employee = require('../models/employees')
const employeedata = require('./employess')

mongoose.connect('mongodb://127.0.0.1:27017/employee-schema',
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }
);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
})

const seedDB = async () => {
    await Employee.deleteMany({});
    for (let i = 0; i < employeedata.length; i++) {
        const c = new Employee({
            name: employeedata[i].name, empId: employeedata[i].empId, officeLoc: employeedata[i].officeLoc
        });
        await c.save();
    };
}

seedDB();