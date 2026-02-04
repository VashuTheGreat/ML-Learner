import mongoose from "mongoose";

const TemplateSchema=new mongoose.Schema({
    title:{
        type:String,
        required:true,
    },
    template:{
        type:String,
        required:true,
        unique:true
    },
    temp_data:{
        type:Object,
        required:true
    }
})

const Template=new mongoose.model("Template",TemplateSchema);
export default Template
