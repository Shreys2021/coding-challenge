const Employee = require('./models/employees')
const Review = require('./models/reviews')



module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl
        req.flash('error', 'you must be signed in first');
        return res.redirect('/login');
    }
    next();
}


module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const employee = await Employee.findById(id);
    if (!employee.owner.equals(req.user._id)) {
        req.flash('error', 'You do not have a permission');
        return res.redirect(`/employees/${id}`)
    }
    next();
}

module.exports.isReviewAuthor = async (req, res, nest) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(id);
    if (!review.owner.equals(req.user._id)) {
        req.flash('error', 'You do not have a permission');
        return res.redirect(`/employees/${id}`)
    }
    next()
}