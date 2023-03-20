const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
// const date = require(__dirname + "/date.js");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-dharmendar:Demo-1234@cluster0.kl1ezrl.mongodb.net/todolistDB", {
  useUnifiedTopology: true,
  useNewUrlParser: true,
  useFindAndModify: false
});

const itemsSchema = new mongoose.Schema({
  name: String,
});

const Item = new mongoose.model("Item", itemsSchema);

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

const item1 = new Item({
  name: "Welcome to your Todo list!",
});

const item2 = new Item({
  name: "Hit the + buttom to add new item.",
});

const item3 = new Item({
  name: "<-- Hit this to delete an item.",
});

const defaultItems = [item1, item2, item3];

// Can also create Schema without using mongoose.Schema

const listSchema = {
  name: String,
  items: [itemsSchema]
}

const List = new mongoose.model("List", listSchema);

app.get("/", (req, res) => {
  // const day = date.getDate();
  // let day = date.getDay();

  Item.find({}, function (err, foundItems) {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Successfully added Item.");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", { listTitle: "Today", newListItems: foundItems });
    }
  });

});

app.get("/:customListName", (req, res) => {
  const customListName = _.capitalize(req.params.customListName);
  
  List.findOne({name: customListName}, function(err, foundList) {
    if(!err) {
      if(!foundList) {
        // Create new list
        const list = new List(
          {
            name: customListName,
            items: defaultItems
          }
        );
      
        list.save();
        res.redirect("/"+ customListName);

      } else {
        // Show existing list

        res.render("list", { listTitle: foundList.name, newListItems: foundList.items });
      }
    }
  });

});

app.post("/", (req, res) => {
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item(
    {
      name: itemName
    }
  );

  if(listName === 'Today') {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}, function(err, foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    })
  }


});

app.post("/delete", (req, res) => {
  const checkedItemId =  req.body.checkbox;
  const listName = req.body.listName;

  if(listName === 'Today') {
    Item.findByIdAndRemove({_id: checkedItemId}, function(err) {
      if(err) {
        console.log(err);
      } else {
        console.log("Successfully deleted");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList) {
      if (!err) {
        res.redirect("/" + listName);
      }
    });
  }

  
});


app.get("/about", (req, res) => {
  res.render("about");
});

app.listen(3000, () => {
  console.log("Server started at port 3000");
});
