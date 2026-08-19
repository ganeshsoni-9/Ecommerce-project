const Category=require("../models/Category");const slug=s=>s.toLowerCase().trim().replace(/[^a-z0-9]+/g,"-");
exports.list=async(req,res,next)=>{try{res.json({success:true,data:await Category.find({isActive:true}).sort("name")})}catch(e){next(e)}};
exports.create=async(req,res,next)=>{try{const c=await Category.create({...req.body,slug:req.body.slug||slug(req.body.name)});res.status(201).json({success:true,data:c})}catch(e){next(e)}};
exports.update=async(req,res,next)=>{try{const c=await Category.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidators:true});res.json({success:true,data:c})}catch(e){next(e)}};
exports.remove=async(req,res,next)=>{try{await Category.findByIdAndUpdate(req.params.id,{isActive:false});res.json({success:true,message:"Category deactivated"})}catch(e){next(e)}};
