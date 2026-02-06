const employeeService = require("../services/employeeService");

exports.getEmployeeHistory = async(req, res) =>{
    try{
        const {id} = req.params;       
        const history = await employeeService.getEmployeeHistory(id);
        res.status(200).json(
            {
                success: true,
                data: history
            }
        )
    }catch(error){
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};