var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var passport = require('passport');
var userSchema = new mongoose.Schema({
    mobileno: { type: Number, required: true, unique: true },
    otp: Number,
    inActive: Boolean,
    token: String,
    otpExpires: Date,
    cdate: Date,
    mobileblock: Date,
    isBlock: Boolean,
    count: Number,
    count1: Number,
    count2: Number,
    count3: Number,
    count4: Number,
    UserId: String,
    email: { type: String, unique: true },
    firstname: String,
    lastname: String,
    password: String,
    udate: Date

});

userSchema.pre('save', function(next) {
    var user = this;
    var SALT_FACTOR = 5;

    if (!user.isModified('password')) return next();

    bcrypt.genSalt(SALT_FACTOR, function(err, salt) {
        if (err) return next(err);

        bcrypt.hash(user.password, salt, null, function(err, hash) {
            if (err) return next(err);
            user.password = hash;
            next();
        });
    });
});

userSchema.methods.comparePassword = function(candidatePassword, callback) {
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        //if (err) throw new Error(err);
        callback(err, isMatch);
    });
};


userSchema.methods.toJson = function() {
    var user = this.toObject();
    delete user.password;
    delete user.otp;
    delete user.otpExpires;
    delete user.token;
    return user;
}


var Auth = mongoose.model('Auth', userSchema);
module.exports = Auth;