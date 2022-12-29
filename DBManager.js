const mysql   = require('mysql');
const express = require("express");
const hbs = require("hbs");
//створюємо об'єкт додатку
const app = express();

app.use(express.static('public'));



// встановлює Handlebars як двигун представлень в Express
app.set("view engine", "hbs");


const connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 'password',
    database : 'EcoMonitoring5'
});

connection.connect(function(err){
    if (err) {
        return console.error("Error-connect: " + err.message);
    }
    else{
        console.log("Connection to MySQL OK!");
    }
});

let MonitorObjectsLoad =  0;
let TraceElementsLoad = 0;
let PollutionLoad = 0;

app.get("/", function(req, res){
    connection.query("SELECT * FROM MonitorObjects", function(err, data) {
        if(err) return console.log(err);
        MonitorObjectsLoad  = data

    });

    connection.query("SELECT * FROM TraceElements", function(err, data1) {
        if(err) return console.log(err);
        TraceElementsLoad  = data1

    });

    connection.query("SELECT * FROM Pollution", function(err, data2) {
        if(err) return console.log(err);
        PollutionLoad  = data2
        res.render("index.hbs", {
            MonitorObjects : MonitorObjectsLoad,
            TraceElements : TraceElementsLoad,
            Pollution : PollutionLoad

        });

    });

});

let map = new Map();

hbs.registerHelper("Table",function (ObjectNumber, ElementNumber, Mi, Kzi, YearOfData) {
    let result = "";
    let sum = "";

    for(let i =0; i <MonitorObjectsLoad.length; i++){

         if(ObjectNumber == MonitorObjectsLoad[i].ID){
            result += `<td class = "cell">${MonitorObjectsLoad[i].ObjectName} </td>`;
        }
    }

    for(let i =0; i <TraceElementsLoad.length; i++){
        if(ElementNumber == TraceElementsLoad[i].ID){
            result += `<td class = "cell">${TraceElementsLoad[i].ElementName} </td>`;
        }
    }

    console.log(MonitorObjectsLoad);

    result += `<td class = "cell">${Mi} </td>`;

    for(let i = 0; i <MonitorObjectsLoad.length; i++){

        if(ObjectNumber == MonitorObjectsLoad[i].ID){
        for(let j = 0; j < TraceElementsLoad.length; j++){
            if(ElementNumber == TraceElementsLoad[j].ID){

                sum = (Mi * MonitorObjectsLoad[i].MinSalary * (1/TraceElementsLoad[j].GDK) *
                    (MonitorObjectsLoad[i].Knas * MonitorObjectsLoad[i].Kf) * Kzi);

                result += `<td class = "cell">${sum.toFixed(2)} </td>`;
                if(!map.has(ObjectNumber)){
                    map.set(ObjectNumber,sum);
                }else{
                   let temp =  map.get(ObjectNumber);
                   map.set(ObjectNumber, temp + sum);
                }

            }
        }
        }

    }

    result += `<td class = "cell">${YearOfData} </td>`;



    return new hbs.SafeString(`<tr class="row">${result}</tr>`);

});

hbs.registerHelper("Table2",function (ObjectNumber, YearOfData) {
    let result = "";




    for(let i =0; i <MonitorObjectsLoad.length; i++){

        if(ObjectNumber == MonitorObjectsLoad[i].ID){
            result += `<td class = "cell">${MonitorObjectsLoad[i].ObjectName} </td>`;
            result += `<td class = "cell">${map.get(ObjectNumber).toFixed(2)} </td>`;

        }
    }





    result += `<td class = "cell">${YearOfData} </td>`;

    return new hbs.SafeString(`<tr class="row">${result}</tr>`);
});






const port = 3307;
app.listen(port, () =>
    console.log(`App listening on port ${port}`)
);

