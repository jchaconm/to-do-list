/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
/* eslint-disable no-undef */
//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express();
const _ = require("lodash");
const favicon = require('serve-favicon');


app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));


mongoose.connect('mongodb+srv://admin-jose:admin@cluster0-udomf.mongodb.net/todolistDB', {
  useNewUrlParser: true
});

const itemSchema = {
  name: {
    type: String,
    required: true
  }
};

const listSchema = {
  name: String,
  listItems: [itemSchema]
}

const Item = mongoose.model("Item", itemSchema);

const List = mongoose.model("List", listSchema);

const item1 = new Item({
  name: "Welcome to your todolist"
});

const item2 = new Item({
  name: "Hit the + button to add a new item"
});


const item3 = new Item({
  name: "<--- Hit this to delete an item"
});

const today = new Date();

const defaultItems = [item1, item2, item3];

/* 

 */


app.get("/", function (req, res) {

/* List.deleteMany({}, function(err){

}); */

  Item.find({}, function (err, foundItems) {

    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Successful");
        }

      })
      res.redirect("/");

    } else {

      res.render("list", {
        listTitle: "Today",
        newListItems: foundItems,
        isCustomList : false
      });
    }
  })


});



app.get("/customLists", function (req, res) {
  console.log("******************************************");
  List.find({}, function (err, foundLists) {

    console.log(foundLists);

    res.render("customLists", {
      customLists: foundLists,
      listTitle: "",
      message : "",
    });

  });


});

app.post("/createList", function (req, res) {

  const customListName = _.capitalize(req.body.newList);

  List.findOne({
    name: customListName
  }, function (err, foundList) {
    if (!err) {
      if (!foundList && customListName.length > 0) {

        const CustomList = new List({
          name: customListName,
          listItems: defaultItems
        })

        CustomList.save();
        res.redirect("/customLists");
      } else {

        res.redirect("/customLists");

      }

    }
  });



});



app.post("/", function (req, res) {

  const listName = req.body.list;
  const newitem = new Item({
    name: req.body.newItem
  })

  if (listName === "Today") {
    newitem.save();
    res.redirect("/");
  } else {

    List.findOne({
      name: listName
    }, function (err, foundList) {
      if (!err) {
        foundList.listItems.push(newitem);
        foundList.save();
        res.redirect("/" + listName);

      }
    })
  }



});


app.post("/delete", function (req, res) {

  const selectedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {


    Item.findByIdAndRemove(selectedItemId, function (err) {
      if (err) {
        console.log(err);
      } else {
        console.log("Successfully deleted the selected item");
        res.redirect("/");
      }


    })

  } else {
    List.findOneAndUpdate({
      name: listName
    }, {
      $pull: {
        listItems: {
          _id: selectedItemId
        }
      }
    }, function (err, results) {

      if (!err) {
        res.redirect("/" + listName);
      }


    });


  }


});


app.post("/deleteList", function(req,res){
  
  List.deleteOne({name : req.body.list} , function(err){
    
    if(err){
      console.log(err);
    }else{
      res.redirect("/customLists");
    }
  })

});


app.get("/:customListName", function (req, res) {
  const customListName = _.capitalize(req.params.customListName);

  console.log(req.params.customListName);

  List.findOne({
    name: customListName
  }, function (err, foundList) {
    if (!err) {
      if (!foundList) {
        const CustomList = new List({
          name: customListName,
          listItems: defaultItems
        })

        CustomList.save();
        res.redirect("/" + customListName);
      } else {
        console.log(foundList.listItems);

        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.listItems,
          isCustomList : true
        })
      }
    }
  });

});

app.listen(process.env.PORT || 3000, function () {
  console.log("Server started on port 3000");
});