var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "root",
  database: "bamazon"
});

connection.connect(function(err) {
  if (err) throw err;
  displayProducts();
});

function displayProducts() {
  var list = [];
  connection.query("SELECT * FROM products", function(err, res) {
    console.log("|" + "Item" + "|" + "Department" + "|" + "Price" + "|" + "Quanity in Stock" + "|");
    for (var i = 0; i < res.length; i++) {
      console.log("|" + res[i].product_name + "|" + res[i].department_name + "|" + res[i].price + "|" + res[i].stock_quantity + "|");
      list.push(res[i].product_name)
    }
    runSearch(list);
  });
}

function updateList(quantity, product) {
  connection.query("UPDATE products SET stock_quantity=? WHERE product_name=?", [quantity, product], function (err, result) {
    if (err) throw err;
    console.log("database updated");
  });
}

function runSearch(choices) {
  inquirer.prompt({
    type: 'list',
    name: 'productlist',
    message: 'What would you like to buy',
    choices: choices
  }).then(function(answers) {
    var productselected = answers.productlist
    console.log("You selected " + productselected);
    inquirer.prompt({
      type: 'input',
      name: 'quanity',
      message: 'How many ' + productselected + 's would you like to buy?'
    }).then(function(answers) {
      var quanity = parseInt(answers.quanity);
      connection.query("SELECT stock_quantity FROM products WHERE product_name=?", productselected, function (err, result) {
        if (err) throw err;
        var stock = parseInt(result[0].stock_quantity);
        if(quanity < stock) {
          var newQuanity = stock - quanity;
          console.log("We can fulfill your order of " + quanity + " " + productselected + "(s)");
          updateList(newQuanity, productselected);
        }
        else {
          console.log("Insufficient quantity!");
        }
      });
    });
  });
};
