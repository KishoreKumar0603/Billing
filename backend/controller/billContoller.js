import Bill from "../models/billModel.js";
export const getAllBills = async (req, res)  =>{
    try {
        const {userId} = req.body;
        if(!userId){
            return res.json({
                error:"user id Need"
            });
        }


        const billobj = await Bill.findOne({userId:userId});
        if(!billobj){
            return res.json({
                message:"No user found"
            });
        }


        return res.json({
            message:"Data Fetched",
            billobj
        });
    } catch (error) {
        return res.json({
            error:error.message
        });
    }
};

export const addBill = async (req, res) =>{
    try {
        
        const {userId, bill} = req.body;
        if(!userId){
            return res.json({
                error:"User id didn't received"
            });
        }

        if(!bill){
            return res.json({
                error:"Entry empty"
            });
        }
        

        let billObj = await Bill.findOne({userId});
        if(!billObj){
            billObj = await Bill.create({userId:userId, bills:[]});
        }
        billObj.bills.push(bill);

        await billObj.doSizePrice();

        return res.json({
            message:"Bill added",
            Bill:{
                billObj
            }
        });
    } catch (error) {
        return res.json({
            error:error.message
        });
    }
}


export const updateBill = async(req, res) =>{
    try {
        const {userId, billId ,  entry} =  req.body;
        if(!userId || !billId){
            return res.json({
                error:"Both userId &  billId required"
            });
        }
        let userEntry = await Bill.findOne({userId});
        if(!userEntry){
            return res.json({
                error:"user dont have any bills"
            });
        }

        console.log(userEntry.bills);

        const bill = userEntry.bills.id(billId);
        if(!bill){
            return res.json({
                error:"bill not found"
            });
        }

        bill.entries = entry;



        await userEntry.doSizePrice();

        return res.json({
            message:"Updation Success"
        });

    } catch (error) {
        return res.json({
            error:error.message
        })
    }
}


export const deleteBill  = async (req, res) => {
    try {
        const {userId, billId} = req.body;


        if(!userId){
            return res.json({
                error:"User Token not Found"
            });
        }

        if(!billId) return res.json({
            error:"Bill id Not found"
        })
        
        const userEntry = await Bill.findOne({userId});

        if(!userEntry){
            return res.json({
                error:"user not found"
            });
        }
        
        const bill =userEntry.bills.id(billId);

        //pending

    } catch (error) {
        return res.json({
            error:error.message
        });
    }
}