const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
// const date = require(__dirname + "/date.js");
const _ = require('lodash');

const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

//conacting to mongoDB...
try {
  mongoose.connect("mongodb://127.0.0.1:27017/ToDoListDB");
  console.log("connected to mongoDB.");
} catch (err) {
  console.log("can't conect to mongoDB" + err);
}

// create a Schema.
const itemsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
});

//create model.
const item = mongoose.model("Item", itemsSchema);

// create a new documents.
const Item1 = new item({
  name: "Welcome to your ToDo List!",
});

const Item2 = new item({
  name: "Click the + button to add a new item!",
});
const Item3 = new item({
  name: "<-- click the to delete the item from the list!",
});
// Item.save();

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema],
});

const List = mongoose.model("List", listSchema);

const defaultItems = [Item1, Item2, Item3];

app.get("/", function (req, res) {
  const output1 = item
    .find({})
    .then((data) => {
      if (data.length === 0) {
        item.insertMany(defaultItems);
        console.log("successfully inserted! ");

        res.redirect("/");
      } else {
        res.render("list", {
          listTitle: "Today",
          newListItems: data,
        });
      }
    })
    .catch((err) => {
      console.log(err);
    });
});
//    let day = date.getDate();

app.post("/", function (req, res) {
  let ItemName = req.body.newItems;
  const listName = req.body.list;

  const newItem = new item({
    name: ItemName,
  });

  if (listName === "Today") {
    newItem.save();

    res.redirect("/");
  } else {
    List.findOne({ name: listName })
      .exec()
      .then((data) => {
        data.items.push(newItem);
        data.save();
        res.redirect("/" + listName);
      });
  }
});

app.post("/delete", function (req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName==="Today")
    {
     item.findByIdAndDelete((_id = checkedItemId)).exec();
        res.redirect("/");         
    }
    else
    {
        List.findOneAndUpdate({name:listName},
            {$pull:
                {items:
                    {_id:
                        checkedItemId
                    }}}).exec().then( () => {
                        res.redirect('/' + listName);
                    }).catch(err =>{
                        console.log(err);
                    });

                    
    }

});

app.get("/:name", function (req, res) {
  const routeName = _.capitalize(req.params.name);

  List.findOne({ name: routeName }).then((data) => {
    if (!data) {
      const list = new List({
        name: routeName,
        items: defaultItems,
      });

      list.save();
      res.redirect("/" + routeName);
    } else {
      res.render("list", {
        listTitle: routeName,
        newListItems: data.items,
      });
    }
  });
});

app.get("/about", function (req, res) {
  res.render("about");
});



app.listen(3000, function () {
  console.log("server is running on port 3000");
});
