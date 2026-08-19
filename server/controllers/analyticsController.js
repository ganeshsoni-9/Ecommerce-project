const Order=require("../models/Order");
exports.dashboard=async(req,res,next)=>{try{const revenue=await Order.aggregate([{$match:{paymentStatus:"PAID"}},{$group:{_id:{$dateToString:{format:"%Y-%m",date:"$createdAt"}},revenue:{$sum:"$totalAmount"},orders:{$sum:1}}},{$sort:{_id:1}},{$limit:12}]);res.json({success:true,data:{revenue}})}catch(e){next(e)}};
