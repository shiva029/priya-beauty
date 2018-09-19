var Auth = require('../models/Auth');
var jwt = require('jwt-simple');
var request = require('request');
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');

exports.auth_signup_post = function(req, res) {
    req.checkBody("mobileno", { status: 0, message: "Please Enter Mobileno" }).notEmpty();
    req.checkBody("mobileno", { status: 0, message: "Invalid Mobileno" }).isNumeric();
    req.checkBody("mobileno", { status: 0, message: "Please Enter min 10 digits of Mobileno" }).isLength({ min: 10 });
    var errors = req.validationErrors();
    if (errors) {
        res.send(errors[0].msg);
    } else {
        var mobileno = req.body.mobileno;
        var cdate = new Date();
        var otp = (Math.floor(Math.random() * 10000) + 10000).toString().substring(1);
        var payload = {
            iss: req.hostname,
            //sub: newUser.id
        }
        var token = jwt.encode(payload, "shhh..");


        var newAuth = new Auth();
        Auth.findOne({ mobileno: mobileno }, function(err, found) {
            if (err) {
                return res.status(500).send({ status: 0, message: "Server Error" });
            } else if (!found) {

                var count1 = 0;
                //var count2 = 0;
                var count3 = 0;
                var otp = (Math.floor(Math.random() * 10000) + 10000).toString().substring(1);
                newAuth.mobileno = mobileno;
                newAuth.inActive = 1;
                newAuth.isBlock = 0;
                newAuth.status = 1;
                newAuth.otp = otp;
                newAuth.otpExpires = Date.now() + 300000; //5 min
                newAuth.token = token;
                newAuth.count1 = count1;
                //newAuth.count2 = count2;
                newAuth.count3 = count3;

                newAuth.save(function(err, success) {
                    if (err) {
                        return res.status(500).send({ status: 0, message: "Server Error" });
                    } else {
                        request('http://creativesms.creativetechno.in/API/sms.php?username=jkc123&password=simha123&from=JKCTEC&to=  ' + mobileno + ' &msg=Dear User - The One Time Password (OTP) for Signup is  ' + otp + '&type=1&dnd_check=0', function(error, response, body) {
                            if (error) {
                                return res.status(500).send(error);
                            } else {
                                if (!error && response.statusCode == 200) {

                                    return res.status(200).send({ Success: "OTP sent to your mobileno", UserId: success._id, status: success.status });
                                }
                            }

                        });
                        //  return res.status(200).send({ data: { UserId: success.id, otp: success.otp } });
                    }
                });


            } else {
                var inActive = found.inActive;
                var isBlock = found.isBlock;
                // var Mobileno = found.mobileno;

                //if (Mobileno == mobileno && inBlock == false) {
                //  return res.status(400).send({ status: 0, message: "MobileNo Already Exist" })
                //} 
                if (inActive == true && isBlock == false) {
                    var otp = (Math.floor(Math.random() * 10000) + 10000).toString().substring(1);
                    found.otp = otp;
                    found.otpExpires = Date.now() + 300000;
                    found.save(function(err, success) {
                        if (err) {
                            return res.status(500).send({ status: 0, message: "Server Error" });
                        } else {
                            var mobileno = success.mobileno;
                            var otp = success.otp;
                            request('http://creativesms.creativetechno.in/API/sms.php?username=jkc123&password=simha123&from=JKCTEC&to=  ' + mobileno + ' &msg=Dear User - The One Time Password (OTP) for Signup is  ' + otp + '&type=1&dnd_check=0', function(error, response, body) {
                                if (error) {
                                    return res.status(500).send(error);
                                } else {
                                    if (!error && response.statusCode == 200) {

                                        return res.status(200).send({ Success: "OTP sent to your mobileno", UserId: success._id, status: success.status });
                                    }
                                }

                            });

                            // return res.status(200).send({ data: { UserId: success._id, otp: success.otp } });
                        }
                    });

                } else {
                    var mobileblock = found.mobileblock;
                    var count1 = found.count1;
                    var count3 = found.count3;
                    var isBlock = found.isBlock;

                    if (cdate >= mobileblock && isBlock == true) {

                        var otp = (Math.floor(Math.random() * 10000) + 10000).toString().substring(1);
                        found.otp = otp;
                        found.count1 = --count1;
                        found.otpExpires = Date.now() + 300000;
                        found.isBlock = 0;
                        found.save(function(err, success) {
                            if (err) {
                                return res.status(500).send({ status: 0, message: "Server Error" });
                            } else {
                                request('http://creativesms.creativetechno.in/API/sms.php?username=jkc123&password=simha123&from=JKCTEC&to=  ' + mobileno + ' &msg=Dear User - The One Time Password (OTP) for Signup is  ' + otp + '&type=1&dnd_check=0', function(error, response, body) {
                                    if (error) {
                                        return res.status(500).send(error);
                                    } else {
                                        if (!error && response.statusCode == 200) {

                                            return res.status(200).send({ Success: "OTP sent to your mobileno", UserId: success._id, status: success.status });
                                        }
                                    }

                                });
                                //return res.status(200).send({ data: { UserId: success.id, otp: success.otp } });
                            }
                        });
                    } else {
                        return res.status(400).send({ status: 0, message: "please try again" });
                    }

                }

            }
        });






    }
};

count = 0;
exports.auth_verifyotp_post = function(req, res) {
    req.checkBody("UserId", { status: 0, message: "Please Enter UserId" }).notEmpty();
    req.checkBody("otp", { status: 0, message: "Please Enter OTP" }).notEmpty();
    req.checkBody("otp", { status: 0, message: "Invalid OTP" }).isNumeric();
    req.checkBody("otp", { status: 0, message: "Please Enter 4 digits of OTP" }).isLength({ min: 4 });
    var errors = req.validationErrors();
    if (errors) {
        return res.status(400).send(errors[0].msg);
    } else {
        count = ++count;
        var otp = parseInt(req.body.otp);
        var cdate = new Date();
        var id = req.body.UserId;
        Auth.findOne({ _id: id }, function(err, data) {
            if (err) {
                return res.status(500).send({ status: 0, message: "Server Error" });
            } else if (!data) {
                return res.status(404).send({ status: 0, message: "UserId doesnot exist" });
            } else {

                if (count <= 3) {
                    var otpExpires = data.otpExpires;
                    if (cdate <= otpExpires) {
                        Auth.findOne({ otp: otp, _id: id }, function(err, data1) {
                            if (err) {
                                return res.status(500).send({ status: 0, message: "Server Error" });
                            } else if (!data1) {


                                return res.status(404).send({ status: 0, message: "wrong OTP" });
                            } else {
                                count = 0;

                                return res.status(200).send({ success: "Verified Successfully", UserId: data1.id, token: data1.token, status: data1.status });
                            }
                        })


                    } else {

                        Auth.findOne({ _id: id }, function(err, data2) {
                            if (err) {
                                return res.status(500).send();
                            } else if (!data2) {
                                return res.status(404).send();
                            } else {
                                count1 = data2.count1;
                                count3 = data2.count3;


                                if (count3 == 2) {
                                    //var count1 = data2.count1;
                                    var count3 = data2.count3;
                                    var otp = (Math.floor(Math.random() * 10000) + 10000).toString().substring(1);
                                    data2.otp = otp;
                                    data2.otpExpires = Date.now() + 300000;
                                    //data2.count1 = --count1;
                                    data2.count3 = 0;
                                    data2.mobileblock = Date.now() + 8.64e+7;
                                    data2.isBlock = 1;
                                    data2.save(function(err, found) {
                                        if (err) {
                                            return res.status(500).send({ status: 0, message: "Server Error" });
                                        } else {


                                            return res.status(200).send({ status: 0, message: "mobileno blocked for 24hr" });
                                        }
                                    })
                                } else if (count1 <= 0) {
                                    var mobileno = data2.mobileno;
                                    var otp = (Math.floor(Math.random() * 10000) + 10000).toString().substring(1);
                                    data2.otp = otp;
                                    data2.otpExpires = Date.now() + 300000;
                                    data2.count1 = ++count1;

                                    data2.count3 = ++count3;

                                    data2.save(function(err, success) {
                                        if (err) {
                                            return res.status(500).send();
                                        } else {
                                            request('http://creativesms.creativetechno.in/API/sms.php?username=jkc123&password=simha123&from=JKCTEC&to=  ' + mobileno + ' &msg=Dear User - The One Time Password (OTP) for Signup is  ' + otp + '&type=1&dnd_check=0', function(error, response, body) {
                                                if (error) {
                                                    return res.status(500).send({ status: 0, message: "Server Error" });
                                                } else {
                                                    if (!error && response.statusCode == 200) {

                                                        return res.status(200).send({ Success: "OTP sent to your mobileno", UserId: success._id, token: success.token, status: success.status });
                                                    }
                                                }

                                            });


                                        }
                                    })


                                } else {

                                    return res.status(303).send({ status: 0, message: "Wait for 10 minutes" });


                                }
                            }
                        });

                        //return res.status(500).send("otp expired");




                    }
                } else {
                    count = 0;
                    Auth.findOne({ _id: id }, function(err, data2) {
                        if (err) {
                            return res.status(500).send({ status: 0, message: "Server Error" });
                        } else if (!data2) {
                            return res.status(404).send({ status: 0, message: "UserId doesnot Exist" });
                        } else {
                            count1 = data2.count1;
                            count3 = data2.count3;

                            if (count3 == 2) {
                                //var count1 = data2.count1;
                                var count3 = data2.count3;
                                var otp = (Math.floor(Math.random() * 10000) + 10000).toString().substring(1);
                                data2.otp = otp;
                                data2.otpExpires = Date.now() + 300000;
                                //data2.count1 = --count1;
                                data2.count3 = 0;
                                data2.mobileblock = Date.now() + 8.64e+7;
                                data2.isBlock = 1;
                                data2.save(function(err, found) {
                                    if (err) {
                                        return res.status(500).send();
                                    } else {
                                        return res.status(400).send({ status: 0, message: "mobileno blocked for 24hr" });
                                    }
                                })
                            } else if (count1 <= 0) {
                                var mobileno = data2.mobileno;
                                var otp = (Math.floor(Math.random() * 10000) + 10000).toString().substring(1);
                                data2.otp = otp;
                                data2.otpExpires = Date.now() + 300000;
                                data2.count1 = ++count1;

                                data2.count3 = ++count3;

                                data2.save(function(err, success) {
                                    if (err) {
                                        return res.status(500).send();
                                    } else {
                                        request('http://creativesms.creativetechno.in/API/sms.php?username=jkc123&password=simha123&from=JKCTEC&to=  ' + mobileno + ' &msg=Dear User - The One Time Password (OTP) for Signup is  ' + otp + '&type=1&dnd_check=0', function(error, response, body) {
                                            if (error) {
                                                return res.status(500).send(error);
                                            } else {
                                                if (!error && response.statusCode == 200) {

                                                    return res.status(200).send({ Success: "OTP sent to your mobileno", UserId: success._id, token: success.token, status: success.status });
                                                }
                                            }

                                        });


                                    }
                                })

                            } else {

                                Auth.findOne({ _id: id }, function(err, data3) {
                                    if (err) {
                                        return res.status(500).send({ status: 0, message: "Server Error" });
                                    } else if (!data3) {
                                        return res.status(404).send({ status: 0, message: "UserId doesnot exist" });
                                    } else {

                                        data3.mobileblock = Date.now() + 600000; //10 min
                                        data3.isBlock = 1;

                                        data3.save(function(err, success) {
                                            if (err) {
                                                return res.status(500).send();
                                            } else {


                                                var cdate = new Date();
                                                var mobileblock = success.mobileblock;
                                                Auth.findOne({ _id: id }, function(err, data3) {
                                                    if (err) {
                                                        return res.status(500).send();
                                                    } else if (!data3) {
                                                        return res.status(404).send();
                                                    } else {

                                                        return res.status(303).send({ status: 0, message: "Wait for 10 minutes" });

                                                    }
                                                });



                                            }

                                        })
                                    }
                                });


                            }
                        }
                    });


                }


            }
        });
    }

};
exports.auth_resendotp_post = function(req, res) {
    req.checkBody("UserId", { status: 0, message: "Please Enter UserId" }).notEmpty();
    var errors = req.validationErrors();
    if (errors) {
        return res.status(400).send(errors[0].msg);
    } else {
        var id = req.body.UserId;
        var otp = (Math.floor(Math.random() * 10000) + 10000).toString().substring(1);
        Auth.findOne({ _id: id }, function(err, data) {
            if (err) {
                return res.status(500).send({ status: 0, message: "Server Error" });
            } else if (!data) {
                return res.status(404).send({ status: 0, message: "UserId doesnot exist" });
            } else {
                var count1 = data.count1;
                //var count2 = data.count2;
                // if (count2 <= 1) {
                data.otp = otp;
                data.otpExpires = Date.now() + 300000;
                data.count1 = --count1;
                data.save(function(err, success) {
                    if (err) {
                        return res.status(500).send({ status: 0, message: "UserId doesnot exist" });
                    } else {

                        var mobileno = success.mobileno;
                        request('http://creativesms.creativetechno.in/API/sms.php?username=jkc123&password=simha123&from=JKCTEC&to=  ' + mobileno + ' &msg=Dear User - The One Time Password (OTP) for Signup is  ' + otp + '&type=1&dnd_check=0', function(error, response, body) {
                            if (error) {
                                return res.status(500).send(error);
                            } else {
                                if (!error && response.statusCode == 200) {

                                    return res.status(200).send({ Success: "OTP sent to your mobileno", UserId: success._id, status: success.status });
                                }
                            }

                        });
                    }





                });

            }
        });
    }
};

var transporter = nodemailer.createTransport(smtpTransport({
    host: 'a2plcpnl0757.prod.iad2.secureserver.net',
    port: 465,
    secure: true,
    auth: {
        user: 'sagar@jkctechnosoft.com',
        pass: 'default@123'
    }
}));

exports.auth_updatesignup_post = function(req, res) {
    req.checkBody("UserId", { status: 0, message: "Please Enter UserId" }).notEmpty();
    req.checkBody("token", { status: 0, message: "Please Enter Token" }).notEmpty();
    req.checkBody("firstname", { status: 0, message: "Please Enter FirstName" }).notEmpty();
    req.checkBody("lastname", { status: 0, message: "Please Enter LastName" }).notEmpty();
    req.checkBody("email", { status: 0, message: "Please Enter Email" }).notEmpty();
    req.checkBody("email", { status: 0, message: "Invalid Email" }).isEmail();
    req.checkBody("password", { status: 0, message: "Please Enter Password" }).notEmpty();
    req.checkBody("password", { status: 0, message: "Please Enter min 6 digits of password" }).isLength({ min: 6 });

    var errors = req.validationErrors();
    if (errors) {
        return res.status(400).send(errors[0].msg);
    } else {
        var id = req.body.UserId;
        var token = req.body.token;
        var udate = new Date();


        Auth.findOne({ token: token, _id: id }, function(err, foundObject) {
            if (err) {
                res.status(500).send({ status: 0, message: "Server Error" });
            } else if (!foundObject) {
                res.status(404).send({ status: 0, message: "user doesnot exist" });

            } else {
                /*var Email = Auth.email;
                console.log(Email);
                if (Email == email) {
                    return res.status(400).send({ status: 0, message: "Email Already Exist" })
                } */
                var email = req.body.email;

                foundObject.firstname = req.body.firstname;
                foundObject.lastname = req.body.lastname;
                foundObject.email = email;
                foundObject.password = req.body.password;
                foundObject.udate = udate;
                foundObject.inActive = 0;
                foundObject.count3 = 0;
                foundObject.count1 = 0;
                foundObject.otp = undefined;
                foundObject.otpExpires = undefined;


                foundObject.save(function(err, updateObject) {
                    if (err) {

                        res.status(500).send({ status: 0, message: "Server Error" });
                    } else {

                        var email = updateObject.email;
                        var mailOptions = {
                            to: email,
                            from: 'priyamanthina@gmail.com',
                            subject: 'JKCTEC',
                            text: 'Signup Successfully'
                        };

                        transporter.sendMail(mailOptions, function(err) {
                            if (err) throw err;

                            res.status(200).send({ success: "Successfully Signup, Check your mail", UserId: updateObject._id, FirstName: updateObject.firstname, LastName: updateObject.lastname, MobileNo: updateObject.mobileno, Email: updateObject.email, status: updateObject.status });

                        });


                    }
                });

            }
        });

    }

}

exports.auth_login_post = function(req, res) {
    var mobileno = req.body.mobileno;
    var email = req.body.email;
    var password = req.body.password;

    if (mobileno) {
        //var mobileno = req.body.mobileno;
        //var password = req.body.password;
        //req.checkBody("mobileno", { status: 0, message: "Please Enter Mobileno" }).notEmpty();
        req.checkBody("mobileno", { status: 0, message: "Invalid Mobileno" }).isNumeric();
        req.checkBody("mobileno", { status: 0, message: "Please Enter min 10 digits of Mobileno" }).isLength({ min: 10 });
        req.checkBody("password", { status: 0, message: "Please Enter Password" }).notEmpty();
        req.checkBody("password", { status: 0, message: "Please Enter min 6 digits of password" }).isLength({ min: 6 });

        var errors = req.validationErrors();
        if (errors) {
            return res.status(400).send(errors[0].msg);
        } else {
            Auth.findOne({ mobileno: mobileno }, function(err, User) {
                if (err) {
                    console.log(err);
                    return res.status(500).send({ status: 0, message: "Server Error" });
                }
                if (!User) {
                    return res.status(404).send({ status: 0, message: "MobileNo doesnot exist" });
                }
                //return res.status(200).send({ data: { success: "Login Success", UserId: User.id } });
                User.comparePassword(password, function(err, isMatch) {

                    if (isMatch) {
                        req.session.User = User;
                        return res.status(200).send({ success: "Login Success", UserId: User.id, status: User.status });
                    } else {
                        return res.status(404).send({ status: 0, message: "Wrong password" });
                    }
                });

            })
        }
    } else if (email) {
        //req.checkBody("email", { status: 0, message: "Please Enter Email" }).notEmpty();
        req.checkBody("email", { status: 0, message: "Invalid Email" }).isEmail();
        req.checkBody("password", { status: 0, message: "Please Enter Password" }).notEmpty();
        req.checkBody("password", { status: 0, message: "Please Enter min 6 digits of password" }).isLength({ min: 6 });

        var errors = req.validationErrors();
        if (errors) {
            return res.status(400).send(errors[0].msg);
        } else {
            Auth.findOne({ email: email }, function(err, User) {
                if (err) {
                    console.log(err);
                    return res.status(500).send();
                }
                if (!User) {
                    return res.status(404).send({ status: 0, message: "Email doesnot exist" });
                }
                //return res.status(200).send({ data: { success: "Login Success", UserId: User.id } });
                User.comparePassword(password, function(err, isMatch) {
                    if (isMatch) {
                        req.session.User = User;
                        return res.status(200).send({ success: "Login Success", UserId: User.id, status: User.status });
                    }
                    return res.status(404).send({ status: 0, message: "Wrong password" });
                });


            })
        }
    }
};

exports.auth_forgotpassword_post = function(req, res) {
    req.checkBody("mobileno", { status: 0, message: "Please Enter Mobileno" }).notEmpty();
    req.checkBody("mobileno", { status: 0, message: "Invalid Mobileno" }).isNumeric();
    req.checkBody("mobileno", { status: 0, message: "Please Enter min 10 digits of Mobileno" }).isLength({ min: 10 });
    var errors = req.validationErrors();
    if (errors) {
        res.send(errors[0].msg);
    } else {
        var mobileno = req.body.mobileno;
        var cdate = new Date();
        var payload = {
            iss: req.hostname,
            //sub: newUser.id
        }
        var token = jwt.encode(payload, "shhh..");
        Auth.findOne({ mobileno: mobileno }, function(err, foundObject) {

            if (err) {
                console.log(err);
                res.status(500).send({ status: 0, message: "Server Error" });
            } else if (!foundObject) {
                res.status(404).send({ status: 0, message: "MobileNo doesnot exist" });

            } else {
                var isBlock = foundObject.isBlock;
                console.log(isBlock);
                var mobileblock = foundObject.mobileblock;
                if (isBlock == false) {
                    count1 = 0;
                    count3 = 0;
                    //var count1 = foundObject.count1;
                    //var count3 = foundObject.count3;
                    var otp = (Math.floor(Math.random() * 10000) + 10000).toString().substring(1);
                    foundObject.count1 = count1;
                    foundObject.count3 = count3;
                    foundObject.otp = otp;
                    foundObject.otpExpires = Date.now() + 300000; // 5 min
                    foundObject.token = token;

                    foundObject.save(function(err, updateObject) {
                        if (err) {

                            res.status(500).send({ status: 0, message: "Server Error" });
                        } else {
                            var mobile = updateObject.mobileno;
 request('http://creativesms.creativetechno.in/API/sms.php?username=jkc123&password=simha123&from=JKCTEC&to=  ' + mobileno + ' &msg=Dear User - The One Time Password (OTP) for resetPassword is  ' + otp + '&type=1&dnd_check=0', function(error, response, body) {
                                if (error) {
                                    return res.status(500).send({ status: 0, message: "Server Error" });
                                } else {
                                    if (!error && response.statusCode == 200) {

                                        return res.status(200).send({ Success: "OTP sent to your mobileno", UserId: foundObject._id, status: foundObject.status });
                                    }
                                }

                            });


                        } 
                    });
                } else if (isBlock == true) {
                    if (cdate >= mobileblock) {

                        var count1 = foundObject.count1;
                        //count3 = 0;
                        //var count1 = foundObject.count1;
                        //var count3 = foundObject.count3;
                        var otp = (Math.floor(Math.random() * 10000) + 10000).toString().substring(1);
                        foundObject.otp = otp;
                        foundObject.count1 = --count1;
                        //foundObject.count3 = count3;

                        foundObject.otpExpires = Date.now() + 300000;
                        //foundObject.mobileblock = undefined;
                        foundObject.save(function(err, success) {
                            if (err) {
                                return res.status(500).send();
                            } else {
                                request('http://creativesms.creativetechno.in/API/sms.php?username=jkc123&password=simha123&from=JKCTEC&to=  ' + mobileno + ' &msg=Dear User - The One Time Password (OTP) for Signup is  ' + otp + '&type=1&dnd_check=0', function(error, response, body) {
                                    if (error) {
                                        return res.status(500).send({ status: 0, message: "Server Error" });
                                    } else {
                                        if (!error && response.statusCode == 200) {

                                            return res.status(200).send({ Success: "OTP sent to your mobileno", UserId: success._id, status: success.status });
                                        }
                                    }

                                });
                                //return res.status(200).send({ data: { UserId: success.id, otp: success.otp } });
                            }
                        });
                    } else {
                        return res.status(400).send({ status: 0, message: " Please Try Again" });
                    }
                }

            }
        });

    }

};


exports.auth_resetpassword_post = function(req, res) {
    req.checkBody("UserId", { status: 0, message: "Please Enter UserId" }).notEmpty();
    req.checkBody("newpassword", { status: 0, message: "Please Enter NewPassword" }).notEmpty();
    req.checkBody("newpassword", { status: 0, message: "Please Enter min 6 digits of password" }).isLength({ min: 6 });

    var errors = req.validationErrors();
    if (errors) {
        return res.status(400).send(errors[0].msg);
    } else {
        var id = req.body.UserId;
        var token = req.body.token;

        Auth.findOne({ token: token, _id: id }, function(err, user) {

            if (err) {
                return res.status(500).send({ status: 0, message: "Server Error" });
            } else if (!user) {
                return res.status(404).send({ status: 0, message: "User doesnot exist" });
            } else {
                user.password = req.body.newpassword;
                user.count3 = 0;
                user.count1 = 0;
            }
            user.save(function(err, reset) {
                if (err) {
                    return res.status(500).send({ status: 0, message: "Server Error" });
                } else {


                    var mailOptions = {
                        to: reset.email,
                        // from: 'sagar@jkctechnosoft.com',
                        from: 'priyamanthina@gmail.com',
                        subject: 'JKCTEC',

                        text: 'Password Changed Successfully'
                    };

                    transporter.sendMail(mailOptions, function(err) {
                        if (err) throw err;

                        res.status(200).send({ success: "Password Changed Successfully,Check your mail", UserId: reset.id, status: reset.status });

                    });


                }
            })
        });
    }

}

exports.auth_userprofile_post = function(req, res) {
    req.checkBody("UserId", { status: 0, message: "Please Enter UserId" }).notEmpty();
    var errors = req.validationErrors();
    if (errors) {
        return res.status(400).send(errors[0].msg)
    } else {
        var _id = req.body.UserId;
        Auth.findOne({ _id: _id }, function(err, found) {
            if (err) {
                return res.status(500).send();
            } else if (!found) {
                return res.status(404).send({ status: 0, message: "UserId doesnot exist" });
            } else {
                return res.status(200).send({ UserId: found._id, FirstName: found.firstname, LastName: found.lastname, MobileNo: found.mobileno, Email: found.email, status: found.status })
            }
        });
    }
};