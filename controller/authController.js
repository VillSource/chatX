const User = require('../model/User')
const jwt = require('jsonwebtoken');


// create json web token
const maxAge = 1 * 60 * 60;
const createToken = (username) => {
  return jwt.sign({ username }, process.env.ACCESS_TOKEN_SECRET);
};

module.exports.login = async (req,res)=>{
    const {username,password} = req.body;

    try{
        const user = await User.login(username,password);
        const token = createToken(user.username);
        // res.cookie('jwt', token, { httpOnly: false /*, maxAge: maxAge * 1000 */});
        res.cookie('jwt',token).json({token:token});
    }
    catch(e){
        // throw e
        console.log(e.message);
        res.status(400).json({errors:e.message})
    }
}

module.exports.signup = async (req,res) =>{
    try {
        res.json({data:await User.signup(req.body)})
    } catch (e) {
        res.json({
            error:e.message
        })
    }
}

module.exports.logout = (req,res)=>{
    res.cookie('jwt', '', { maxAge: 1 });
    res.redirect('/');
}
