const express = require('express');
const path = require('path')
const mongoose = require('mongoose');
const methodOverride = require('method-override')
const Employee = require('./models/employees')
const Review = require('./models/reviews')
const ejsMate = require('ejs-mate');
const { createSecretKey } = require('crypto');
const User = require('./models/user');
const passport = require('passport');
const localStrategy = require('passport-local');
const session = require('express-session');
const flash = require('connect-flash');
const { isLoggedIn, isAuthor } = require('./middleware');
// const MongoDBStore = require("connect-mongo")(session);

const dbUrl = process.env.DB_URL
// 'mongodb://127.0.0.1:27017/employee-schema'
// 'mongodb+srv://shreyasasutkar:shreyas@cluster0.ehhsqya.mongodb.net/?retryWrites=true&w=majority'
mongoose.connect('mongodb+srv://shreyasasutkar:shreyas@cluster0.ehhsqya.mongodb.net/?retryWrites=true&w=majority',
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

const app = express()



const sessionConfig = {
    secret: 'thissholudbesecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 100 * 60 * 60 * 24 * 7
    }
}



app.use(session(sessionConfig))

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
app.use(flash());
app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'));


;
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})


passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

const PORT = process.env.PORT || 3000

app.get('/', (req, res) => {
    res.render('home')
})

app.get('/employees', async (req, res) => {
    const employees = await Employee.find({});
    res.render('index', { employees })
})

app.get('/employees/new', isLoggedIn, async (req, res) => {
    res.render('employee/new')
})

app.post('/employees', isLoggedIn, async (req, res) => {
    const employee = new Employee(req.body.employee)
    employee.owner = req.user._id;
    console.log(employee)
    await employee.save();
    res.redirect(`/employees/${employee._id}`)
})


app.get('/employees/:id', isLoggedIn, async (req, res) => {
    const { id } = req.params;
    const employee = await Employee.findById(id).populate({
        path: 'reviews', populate: {
            path: 'owner'
        }
    }).populate('owner');
    res.render('employee/show', { employee })
})


app.get('/employees/:id/edit', async (req, res) => {
    const employee = await Employee.findById(req.params.id)
    res.render('employee/edit', { employee })
})

app.put('/employees/:id', async (req, res) => {
    const { id } = req.params;
    const employee = await Employee.findByIdAndUpdate(id, { ...req.body.employee })
    await employee.save();
    res.redirect(`/employees/${employee._id}`)
})

app.get('/register', async (req, res) => {
    res.render('user/register');
})

app.post('/register', async (req, res) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password)
        res.redirect('/employees');
    } catch (e) {
        res.send(e);
        res.redirect('/register');
    }
})

app.post('/employees/:id/reviews', async (req, res) => {
    const { id } = req.params;
    const employee = await Employee.findById(id);
    const Reviews = new Review({ review: req.body.reviews });
    Reviews.owner = req.user._id;
    employee.reviews.push(Reviews);
    await employee.save();
    await Reviews.save();
    res.redirect('/employees');
})

app.get('/login', (req, res) => {
    res.render('user/login');
})

app.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), async (req, res) => {
    res.redirect('/employees');
})


app.delete('/employees/:id/reviews/:reviewId', async (req, res) => {
    const { id, reviewId } = req.params;
    await Employee.findByIdAndUpdate(id), { $pull: { reviews: reviewId } }
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'succesfully deleted review');
    res.redirect(`/employees/${id}`)
})

app.delete('/employee/:id', async (req, res) => {
    const { id } = req.params;
    await Employee.findByIdAndDelete(id)
    res.redirect('/employees')

})

app.listen(PORT, () => {
    console.log("serving n port 3000")
})
