import Bill from "../models/billModel.js";
export const getAllBills = async (req, res)  =>{
    try {
        const bill = await Bill.find();
        if(!bill || bill.length == 0){
            return res.json({
                message:"Bill list Empty"
            });
        }

        return res.json({
            message:"bills fetched",
            bill
        });
        
    } catch (error) {
        return res.json({
            error:error.message
        });
    }
};

export const addBill = async (req, res) =>{
    try {
        const {entries} = req.body;
        if(!entries){
            return res.json({
                error:"Entry empty"
            });
        }

        const bill = await Bill.create({entries});
        if(!bill){
            return res.json({
                message:"UnSuccessfull"
            });
        }

        await bill.doSizePrice();

        return res.json({
            message:"Bill added"
        });
    } catch (error) {
        return res.json({
            error:error.message
        });
    }
}