const express = require('express');
const router = express.Router();
const {registerUser} = require('../controller/indexController');
//Child Routes
const postRouter = require('./postRouter');
const usersRouter = require('./userRouter');
const commentRouter = require('./commentRouter');
//Models
const User = require('../models/User');

//Index Routes
router.get('/', welcomeAPI);
router.post('/register',registerUser );
router.post('/login',loginUser);


//ChildRoutes
router.use('/users', usersRouter);
router.use('/post', postRouter);
router.use('/comment', commentRouter);

router.post('/send-verify-email/:user_id',(req,res)=>{
    const user_id = req.params.user_id;
    const user = User.findOne(user_id);
    const eMail = user.email;
    //Veriyf işlemi olacak.
});

router.post('/veriyf-email/:email_token',(req,res)=>{
    const {email_token} = req.params.email_token;
    //Veriyf işlemi olacak.
});
module.exports = router;
