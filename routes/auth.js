const express = require("express");
const mongoose = require("mongoose");
const router = express.Router()

const bcryptjs = require('bcryptjs');
const jwt = require("jsonwebtoken")


const STUDENT = mongoose.model("STUDENT");
const {Jwt_secret} = require("../keys");



router.post("/signup" , (req,res)=> {
    const {password ,email , name,uniRoll ,member1 , member2,member3,member4} = req.body;
    const ip = req.headers['cf-connecting-ip'] ||
                req.headers['x-real-ip'] ||
                req.headers['x-forwarded-for'] ||
                req.socket.remoteAddress || '' ;

    
    console.log(name , uniRoll , member1 , member2 , member3);

    if(!password ||!email || !name || !member1 || !uniRoll){
        return res.status(422).json({error : "Please add all the fields"})
    }

    STUDENT.findOne({$or : [{email : email} , {uniRoll : uniRoll} ]}).then((savedUser) => {
        if(savedUser){
            return res.status(422).json({error : "user already exist with that email or University Id"})
        }


        bcryptjs.hash(password , 12).then((hashedPassword) => {
            const teacher = new STUDENT ({
                email,    
                password:hashedPassword, //hiding password,
                ip,
                name,
                uniRoll,
                Member1 : member1,
                Member2 : member2,
                Member3 : member3,
                Member4 : member4,
            })
        
            teacher.save()
            .then(teacher => {res.json({message : "Data Saved"})})
            .catch(err => {console.log(err)})
        })
    })
})



router.post("/signin" , (req , res) => {
    const {email , password} = req.body;

    if(!email || !password){
        return res.status(422).json({error: "please add all the fields"})
    }

    STUDENT.findOne({email:email}).then((savedUser) => {
        if(!savedUser){
            return res.status(422).json({error:"Invalid Email"})
        }
        bcryptjs.compare(password , savedUser.password).then((match) => {
            if(match){
                // return res.status(200).json({message :"Signed In Successufully" })
                const token = jwt.sign({_id:savedUser.id} , Jwt_secret)
                const {_id ,name , email , userName} = savedUser
                res.json({token , user:{_id ,name , email , userName }})
                console.log({token , user:{_id ,name , email , userName}})
            }else{
                return res.status(422).json({error :"Invalid password" })
            }
        })
        .catch(err => console.log(err))
        // console.log(savedUser)
    })
})

















































module.exports = router;