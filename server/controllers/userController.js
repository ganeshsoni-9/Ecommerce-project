const User=require("../models/User");const Address=require("../models/Address");
exports.profile=async(req,res,next)=>{try{res.json({success:true,data:{user:req.user,addresses:await Address.find({user:req.user._id})}})}catch(e){next(e)}};
exports.update=async(req,res,next)=>{try{const u=await User.findByIdAndUpdate(req.user._id,{name:req.body.name,phone:req.body.phone},{new:true}).select("-password");res.json({success:true,data:u})}catch(e){next(e)}};
exports.addresses=async(req,res,next)=>{try{if(req.method==="GET")return res.json({success:true,data:await Address.find({user:req.user._id})});const d={...req.body,user:req.user._id};if(d.isDefault)await Address.updateMany({user:req.user._id},{isDefault:false});const a=await Address.create(d);res.status(201).json({success:true,data:a})}catch(e){next(e)}};
exports.deleteAddress=async(req,res,next)=>{try{await Address.deleteOne({_id:req.params.id,user:req.user._id});res.json({success:true,message:"Address deleted"})}catch(e){next(e)}};
