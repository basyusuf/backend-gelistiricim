const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');
const CustomError = require('../helper/error/CustomError');
const { validateUserInput,comparePassword} = require('../helper/input/inputHelpers');
const sendEmail = require('../helper/libraries/sendEmail');
const {forgotPasswordTemplate} = require('../template/EmailTemplate/ForgotPasswordTemplate');

const welcomeAPI =(req, res, next) => {
    res.json({
        message:"Welcome Gelistiricim API V1"
    });
}
/**
 * @swagger
 * /register:
 *   post:
 *     description: Register to the application
 *     tags:
 *       - Index
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: userName
 *         description: User's username.
 *         in: formData
 *         required: true
 *         type: string
 *       - name: password
 *         description: User's password.
 *         in: formData
 *         required: true
 *         type: string
 *       - name: email
 *         description: User's email.
 *         in: formData
 *         required: true
 *         type: string
 *       - name: about
 *         description: User's about.
 *         in: formData
 *         required: false
 *         type: string
 *     responses:
 *       201:
 *         description: register
 */
const registerUser = (req, res, next) => {
    const { userName,password,email,about} =  req.body;

    const user = new User({
        userName,
        password:password,
        email,
        about:about
    });
    const promise = user.save();
    promise.then((data)=>{
        res.status(201).json(data);
    }).catch((err)=>{
        next(err);
    })

}
/**
 * @swagger
 * /login:
 *   post:
 *     description: Login to the application
 *     tags:
 *       - Index
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: userName
 *         description: User's username.
 *         in: formData
 *         required: true
 *         type: string
 *       - name: password
 *         description: User's password.
 *         in: formData
 *         required: true
 *         type: string
 *         format: password
 *     responses:
 *       200:
 *         description: login
 */
const loginUser = async (req,res,next)=>{
    const {userName,password} = req.body;
    if(!validateUserInput(userName,password)){
        return next(new CustomError("Please check your inputs",400));
    }
    await User.findOne({
        userName:userName
    },(err,data)=>{
        if(err)
            return next(new CustomError("Server error",500));
        if(!data){
            return next(new CustomError("Authentication failed, user not found.",401));
        }
        else{
                if(data.status === false){
                    return next(new CustomError("User Banned.",400));
                }
                if(!comparePassword(password,data.password)){
                    return next(new CustomError("Authentication failed, wrong password or username",401));
                }
                else{
                    const token = data.generateJwtFromUser();
                    res.json({
                        status:true,
                        token:token
                    })
                }
        }
    }).select('+password')
}
const logoutUser = async (req,res,next) =>{
    return res.status(200)
        .cookie({
            httpOnly:true,
            expires:new Date(Date.now())
        }).json({
            status:true,
            message:"Logout Successfull"
        })
};
/**
 * @swagger
 * /forgotpassword:
 *   post:
 *     description: Forgot password
 *     tags:
 *       - Index
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: email
 *         description: User E-Mail.
 *         in: formData
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: login
 */
const forgotPassword = async (req,res,next)=>{
    const resetEmail = req.body.email;
    const user =await User.findOne({email:resetEmail});
    if(!user){
        return next(new CustomError("There is no user with that email",400));
    }
    const resetPasswordToken = user.getResetPasswordTokenFromUser();
    await user.save();

    const resetPasswordUrl = `http://${config.domain}/api/resetpassword?resetPasswordToken=${resetPasswordToken}`;
    const emailTemplate = forgotPasswordTemplate(resetPasswordUrl,user.userName);
    try{
        await sendEmail({
            from:"y.penava@gmail.com",
            to : resetEmail,
            subject:"Gelistiricim - Şifre Yenileme Talebi",
            html:emailTemplate
        });
        return res.status(200).json({
            success:true,
            message:"Token Sent To Your Email"
        })
    }
    catch (err) {
        user.resetPasswordToken = undefined;
        user.resetPasswordToken = undefined;
        await user.save();
        return next(new CustomError("Email Could Not Be Sent",500));
    }
}
/**
 * @swagger
 * /resetpassword:
 *   put:
 *     description: Reset Password
 *     tags:
 *       - Index
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: resetPasswordToken
 *         description: E-maile gelen reset password token.
 *         in: query
 *         required: true
 *         type: string
 *       - name: password
 *         description: Yeni Şifre.
 *         in: formData
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: login
 */
const resetPassword = async (req,res,next)=>{
    const {resetPasswordToken} = req.query;
    const {password} = req.body;
    if(!resetPasswordToken){
        return next(new CustomError("Please provide a valid token"),400);
    }
    let user = await User.findOne({
        resetPasswordToken:resetPasswordToken,
        resetPasswordExpire:{$gt:Date.now()}
    });
    if(!user){
        return next(new CustomError("Invalid Token or Session Expired",400));
    }
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    return res.status(200).json({
        success:true,
        message:"Reset Password Process Successfull"
    })
}


module.exports={
    registerUser,
    loginUser,
    welcomeAPI,
    logoutUser,
    forgotPassword,
    resetPassword
}