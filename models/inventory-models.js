const pool = require('../database')

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications() {
    return await pool.query('SELECT * FROM public.classification ORDER BY classification_name')
}

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c 
      ON i.classification_id = c.classification_id 
      WHERE i.classification_id = $1`,
      [classification_id]
    )
    return data.rows
  } catch (error) {
    console.error("getclassificationsbyid error " + error)
  }
}

/* ***************************
 *  Get all inventory items and details by inventory id
 * ************************** */
async function getInventoryByInvId(inv_id) {
  try{
    const data = await pool.query(`SELECT * FROM public.inventory 
      WHERE inv_id = $1`,
    [inv_id]
  )
  return data.rows
  }catch(error){
    console.error("getinventorybyid error " + error)
  }
}

async function addClassification(classification_name) {
  try{
    const sql = `INSERT INTO classification (classification_name) VALUES ($1) RETURNING *`;
    const result = await pool.query(sql, [classification_name]);
    return result.rows[0]; // return inserted row if successful
  } catch (error) {
    console.error("addClassifcation error: ", error);
    return null;
  }
}

async function addInventory(data) {
  try {
    const sql = `
      INSERT INTO inventory (
        classification_id, inv_make, inv_model, inv_description,
        inv_image, inv_thumbnail, inv_price, inv_year,
        inv_miles, inv_color
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      RETURNING *;
    `;

    const result = await pool.query(sql, [
      data.classification_id,
      data.inv_make,
      data.inv_model,
      data.inv_description,
      data.inv_image,
      data.inv_thumbnail,
      data.inv_price,
      data.inv_year,
      data.inv_miles,
      data.inv_color
    ]);

    return result.rows[0];
  } catch (error) {
    console.error("addInventory error:", error);
    return null;
  }
}


module.exports = { getClassifications, getInventoryByClassificationId, getInventoryByInvId, addClassification, addInventory }