const express = require('express')
const app = express()
const cookie = require('cookie-parser')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const userModel = require('./model/user')
const postModel = require('./model/post')

app.set('view engine', 'ejs')
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cookie())
app.use(express.static('public'))



app.get('/' , (req , res)=>{
    res.render("register")
})
app.get('/login', (req,res)=>{
    res.render("login")
})
app.get('/profile',isLoggedin, async (req , res)=>{
    const user = await userModel.findOne({email:req.user.email}).populate('post')
    res.render('profile',{user:user})

})

app.post('/login', async (req , res)=>{
    const {email, password} = req.body
    const user = await userModel.findOne({email})
    if(!user){ res.status(500).send('kuch to gadbad hai')}
    bcrypt.compare(password,user.password ,(err,result)=>{
        if(result){
            const token = jwt.sign({email:user.email , id:user._id} , 'gugugaga')
            res.cookie('token',token)
            res.redirect('/profile')
        }
        else{
            res.status(500).send('kuch to gadbad hai')
        }
    })
})

app.post('/createuser',async(req,res)=>{
   const {username ,email, password} = req.body
    const user = await userModel.findOne({email})
    if(user){ res.status(500).send('user already exists')}
    bcrypt.genSalt(10 , (err , salt)=>{
        bcrypt.hash(password, salt , async(err, hash)=>{
            const user = await userModel.create({
                username,
                email,
                password:hash
            })
           const token = jwt.sign( {email:email,userId:user._id} , 'gugugaga')
           res.cookie('token',token)
           res.redirect('/login')
        })
    })

})

app.post('/create' , isLoggedin, async (req , res)=>{
 const details = req.body.detail
 const user = await userModel.findOne({email:req.user.email})
 const post = await postModel.create({
    details:details,
    user:user._id
 }) 
user.post.push(post._id)
await user.save()
res.redirect('/profile') 
})

// Get update page with post data
app.get('/update/:id', isLoggedin, async (req, res) => {
    try {
        const post = await postModel.findById(req.params.id);
        if (!post) {
            return res.status(404).send('Post not found');
        }
        res.render('update', { post: post });
    } catch (error) {
        res.status(500).send('Error loading update page');
    }
});

// Update post
app.post('/update/:id', isLoggedin, async (req, res) => {
    try {
        const post = await postModel.findById(req.params.id);
        if (!post) {
            return res.status(404).send('Post not found');
        }
        
        post.details = req.body.detail;
        await post.save();
        res.redirect('/profile');
    } catch (error) {
        res.status(500).send('Error updating post');
    }
});

// Delete post
app.post('/delete/:id', isLoggedin, async (req, res) => {
    try {
        const post = await postModel.findById(req.params.id);
        if (!post) {
            return res.status(404).send('Post not found');
        }
        
        // Remove post from user's posts array
        const user = await userModel.findOne({ _id: post.user });
        if (user) {
            user.post = user.post.filter(postId => postId.toString() !== req.params.id);
            await user.save();
        }
        
        // Delete the post
        await postModel.findByIdAndDelete(req.params.id);
        res.redirect('/profile');
    } catch (error) {
        res.status(500).send('Error deleting post');
    }
});

app.get('/logout',(req,res)=>{ 
   res.cookie('token' , "")
        res.redirect('/login')
})



function isLoggedin(req , res , next){
    if(req.cookies.token ===""){
        res.redirect('/login')
    }
    else{
        const decoded = jwt.verify(req.cookies.token , 'gugugaga')
        req.user = decoded 
    }
    next()
}

 
app.listen(3000); 