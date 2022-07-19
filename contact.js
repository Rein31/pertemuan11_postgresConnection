// import file system
const { throws } = require('assert');
const { error, log } = require('console');
const fs = require('fs');
const { resolve } = require('path');

// import readLine
const readline = require("readline");

// import validator
const validator = require("validator");
const pool = require('./db');

// check duplicate data JSON
const checkDuplicate = async (name) => {

    const findDup = await pool.query(`SELECT * FROM public.contacts where name='${name}'`);
    console.log(findDup.rowCount);
    if (findDup.rowCount === 0) {
      return false;
    }else{
      return true;
    }
  

}

// validate dir folder path
function dirPathValidator(dirPath){
  if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath);
  }
}

// validate dir data path
function dataPathValidator(dataPath){
  if (!fs.existsSync(dataPath)) {
      fs.writeFileSync(dataPath,'[]','utf-8');
  }
}

// function for validate email
function validateEmail(email){
  if (!validator.isEmail(email)) {
    return true;
  }
}

// function for validate mobile phone number
function validateMobile(mobile){
  if (!validator.isMobilePhone(mobile, "id-ID")) {
    return true;
  }
}

// load contact
const loadContact = async () => {
  try {
    const allCont = await pool.query(`SELECT name,email FROM public.contacts ORDER BY name ASC `)
    // console.log(allCont.rows);
    return allCont.rows;
    // res.json(allCont)
  } catch (err) {
      console.log(err.message);
  }
}

// Create list contact
const listContact = () => {
  const contacts = loadContact();
  console.log('Contact List : ');
  contacts.forEach((contact,i) => {
    console.log(`${i+1}.${contact.name} - ${contact.mobile}`);
  });
}

// detail contact
const detailContact = async (name) => {
  try {
    const findDetailCont = await pool.query(`SELECT name,email,mobile FROM public.contacts where name='${name}'`);
    // console.log(findDetailCont.rows);
    return findDetailCont.rows.find(e => e.name === name)
  } catch (err) {
    console.log(err.message);
  }
}

// delete contact
const deleteContact = async (name) => {
  try {
    const deleteCont = await pool.query(`DELETE FROM contacts where name='${name}'`);
    return deleteCont;
  } catch (err) {
    console.log(err.message);
  }

}

// update contact
const updateContact = async (oldName,newName,mobile,email) => {
  try {
    const updateCont = await pool.query(`UPDATE public.contacts SET name='${newName}', mobile='${mobile}', email='${email}' WHERE name='${oldName}';`)
    return updateCont;
  } catch (err) {
    console.log(err.message);
  }
}

// overwrite save file contact to JSON
const overWriteFileContact = (contact) =>{
  const dirPath = "./data";
  const dataPath = "./data/contacts.json";
  dirPathValidator(dirPath);
  dataPathValidator(dataPath);
  const contacts = contact;
  fs.writeFileSync('data/contacts.json',JSON.stringify(contacts));

}

// add new contact
const addCont = async (name,mobile,email) =>{
  try {
    const insertCont = await pool.query(`INSERT INTO public.contacts(name, mobile, email) VALUES ('${name}','${mobile}','${email}') RETURNING *;`);
    return insertCont;
  } catch (err) {
    console.log(err.message);
  }
  
}

module.exports = {deleteContact,detailContact,updateContact,addCont,listContact,loadContact,checkDuplicate,validateEmail,validateMobile};