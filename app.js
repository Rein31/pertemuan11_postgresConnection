// call exprees module
const express = require("express");
// call expressLayout module
var expressLayouts = require('express-ejs-layouts');
// call morgan module
var morgan = require('morgan')
// call contact.js
const contact = require('./contact');
// call express library
const app = express();
// call express validator
const {body,validationResult,check} = require('express-validator')
//call db
const pool = require("./db")

app.use(express.json()) // => req.body

// setting port
const port = 3000;

// call server
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });

// information using ejs
app.set('view engine', 'ejs')

// use express static for public folder
app.use(express.static('public'))

// use express layout
app.use(expressLayouts);
// set default layout for all routing
app.set('layout', 'layouts/main');

// create a write stream (in append mode)
// var accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' })
 
// use morgan mode dev
app.use(morgan('dev'))

app.use(express.urlencoded({extended:true}))

// app.use(bodyParser.json());

// app.get("/addasync", async (req,res) => {
//     try {
//         const name = "reinaldiiiiiii";
//         const mobile = "082214152365"
//         const email = "reinaldi@gmail.com"
//         const newCont = await pool.query(`INSERT INTO contacts values ('${name}','${mobile}','${email}') RETURNING *`)
//         res.json(newCont)
//     } catch (err) {
//         console.log(err.message);
//     }
// })

app.use((req, res, next) => {
    console.log('Time:', Date.now())
    next()
  })

app.get("/", (req, res) => {
    res.render('index', {
        nama: "Reinaldi",
        title : "WEB server EJS", 
    });
});

app.get("/about", (req, res) => {
//   res.send("This is page about!");
    res.render('about', {
        title : "About Page"
    })
});

// add new contact first render
app.get("/contact/add", (req, res) => {
    // res.send("This is contact about!");
    res.render('add-contact', {
        title : "Add New Contact Page",
        error : '',
        oldContact : '',
    })
});

// add new contact
app.post('/contact', 
    body('name').custom(async (value) => {
        const dup = await contact.checkDuplicate(value)
        if (dup) {
                throw new Error("name is already exist");
            }
            return true
    }),
    check('email').isEmail().withMessage("Email not valid"),
    check('mobile').isMobilePhone('id-ID').withMessage("Mobile phone not valid"),
    async (req,res) =>{
        const result = validationResult(req)
        if (!result.isEmpty()) {
            const name = req.body.name;
            const mobile = req.body.mobile;
            const email = req.body.email;
            const oldContact = {name,mobile,email}
            // console.log(result);
            res.render('add-contact', {
                title:"Add New Contact Page",
                oldContact,
                error: result.array(),
            })
        }else {
            const name = req.body.name;
            const mobile = req.body.mobile;
            const email = req.body.email;
            await contact.addCont(name,mobile,email)

            res.redirect('/contact')
        }
    
})

// delete contact
app.post('/contact/delete', async (req,res) => {
    const name = req.body.idName;
    const findCont = contact.detailContact(name);

    if (!findCont) {
        res.status(404)
        res.send("404 Page Not Found!")
    }else{
        await contact.deleteContact(name)
        res.redirect('/contact')
    }
})

// detail contact
app.get("/contact/:idName", async (req, res) => {
    // res.send("This is contact about!");
    
    const detailCont = await contact.detailContact(req.params.idName);
    // console.log(detailCont);
    if (!detailCont) {
        res.status(404)
        res.send("404 Page Not Found!")
    }else{
        res.render('detailCont', {
            title : "Detail Contact",
            cont : detailCont,
        })
    }
    
});

// update contact first render
app.get('/contact/update/:idName', async (req,res) =>{
    const name = req.params.idName;
    const oldName = req.params.idName;
    const detailCont = await contact.detailContact(name);
    res.render('updateContact', {
        title:"update contact",
        oldContact : detailCont,
        oldName,
        error:''
    })
})

// update contact
app.post('/contact/update',
    check('name').custom( async (value, {req}) => {
        const dup = await contact.checkDuplicate(value)
        if (dup && value !== req.body.oldName) {
                throw new Error("name is already exist");
        }
            return true
    }),
    check('email').isEmail().withMessage("Email not valid"),
    check('mobile').isMobilePhone('id-ID').withMessage("Mobile phone not valid"),
    async (req,res) =>{
        const result = validationResult(req)
        if (!result.isEmpty()) {
            const oldName = req.body.oldName;
            const name = req.body.name;
            const mobile = req.body.mobile;
            const email = req.body.email;
            const oldContact = {name,mobile,email}
            console.log(name);
            // console.log(oldContact);
            // console.log(result);
            res.render('updateContact', {
                title:"update contact",
                oldContact,
                oldName,
                error: result.array(),
            })
        }else {
            const oldName = req.body.oldName;
            const name = req.body.name;
            const mobile = req.body.mobile;
            const email = req.body.email;
            // const newUpdateCont = {name,mobile,email}
            await contact.updateContact(oldName,name,mobile,email)
            res.redirect('/contact')
        }
})

// contact page
app.get("/contact", async (req, res) => {
    // res.send("This is contact about!");
    // import folder data with file contact JSON
    const allCont = await contact.loadContact();
    // res.json(allCont)
    // console.log(allCont);
    res.render('contact', {
        title : "Contact Page",
        cont : allCont,
    })
});

// product tester page
app.get('/product/:id', (req, res) => {
    // res.send('product id : ' + req.params.id + '<br><br>'
    // + 'category id : ' + req.params.idCat)
    res.send(`product id : ${req.params.id} <br> category id : ${req.query.category}`)
})

app.use('/', (req,res) => {
    res.status(404)
    res.send("404 Page Not Found!")
})

// function for page not found
// const pageNotFound = (req,res) => {
//     res.status(404)
//     res.send("404 Page Not Found!") 
// }
