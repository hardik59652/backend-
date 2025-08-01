const asyncHandler=(requesthandler)=>{
    (req,res,next)=>{
        promise.resolve(requesthandler(req,res,next))
        .catch((err)=>next(err))
    }

}

export {asyncHandler}









// const asyncHandler=(fn)=>async (req,res,next)=>{
//     try {
//         await fn(req,res,next)
//     } catch (error) {
//         res.status(err.code||500).json({
//             success:false,
//             msg:err.message
//         })
//     }
// }