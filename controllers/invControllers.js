const invModel = require("../models/inventory-models")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function(req, res, next){
    try{
        const classification_id = req.params.classificationId
        const data = await invModel.getInventoryByClassificationId(classification_id)

        if (!data || data.length === 0){
            const err = new Error("Sorry! But we couldn't find the vehicle you requested for 😔.");
            err.status = 404;
            return next(err); // 🔴 Pass to error handler
        }

        const grid = await utilities.buildClassificationGrid(data)
        let nav = await utilities.getNav()
        const className = data[0].classification_name
        res.render("./inventory/classification", {
        title: className + " vehicles",
        nav,
        grid,
    });
    } catch (err) {
         next(err); // 🔴 Catch unexpected error
    }
}

/* ***************************
 *  Build inventory details
 * ************************** */
invCont.buildByInvId = async function(req, res, next){
    try {
        const invId = req.params.invId
        const data = await invModel.getInventoryByInvId(invId)

        if (!data || data.length === 0){
            const err = new Error("Sorry! But we couldn't find the vehicle you requested for 😔.");
            err.status = 404;
            return next(err); // 🔴 Pass to error handler
        }

        const nav = await utilities.getNav()
        const vehicle = data[0]
        const details = await utilities.buildDetailsGrid(vehicle)
        res.render("inventory/details", {
        title: `${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}`,
        nav,
        details,
    });
    } catch (err) {
        next(err); // 🔴 Catch unexpected error
    }
}

invCont.buildInvManagement = async function (req, res, next) {
    try{
        const nav = await utilities.getNav()
        res.render("inventory/management", {
            title: "Vehicle Management",
            nav,
            notice: req.flash("notice") // ✅ shows success message after redirect
        });
    }
    catch(err){
        next(err);
    }
}

invCont.buildAddClassification = async function(req, res, next){
    try{
        const nav = await utilities.getNav()
        res.render("inventory/addClassification", {
            title: "Add Classification",
            nav,
            classification_name: req.body.classification_name,
            notice: null
        });
    }catch(err){
        next(err)
    }
}

invCont.addClassification = async function (req, res, next) {
    try{
        const {classification_name} = req.body
        const insertResult = await invModel.addClassification(classification_name);

        if(insertResult) {
            const nav = await utilities.getNav(); // Regenerate nav with new classification
            req.flash("notice", `"${classification_name}" successfully added!`)
            res.redirect("/inv");
        } else{
            const nav = await utilities.getNav();
            res.render("inventory/addClassification", {
                title: "Add Classification",
                nav,
                errors,
                notice: `Failed to add "${classification_name}". Please try again.`
            });
        }
    } catch(error) {
        next(error);
    }
}

invCont.buildAddInventory = async function (req, res, next) {
  try {
    const nav = await utilities.getNav();
    const classificationList = await utilities.buildClassificationList();
    res.render("inventory/addInventory", {
      title: "Add New Inventory",
      nav,
      classificationList,
      errors: null,
      notice: req.flash("notice"),
    });
  } catch (err) {
    next(err);
  }
};

invCont.addInventory = async function (req, res, next) {
  try {
    const nav = await utilities.getNav();
    const {
      classification_id,
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color
    } = req.body;

    const insertResult = await invModel.addInventory({
      classification_id,
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color
    });

    if (insertResult) {
      const updatedNav = await utilities.getNav();
      req.flash("notice", `Successfully added ${inv_make} ${inv_model} to inventory.`);
      res.render("inventory/management", {
        title: "Vehicle Management",
        nav: updatedNav,
        notice: req.flash("notice")
      });
    } else {
      const classificationList = await utilities.buildClassificationList(classification_id);
      res.render("inventory/addInventory", {
        title: "Add New Inventory",
        nav,
        classificationList,
        notice: "Failed to add inventory. Please try again.",
        errors: null,
        ...req.body
      });
    }
  } catch (error) {
    next(error);
  }
};


module.exports = invCont