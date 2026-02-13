import mongoose from "mongoose";


const coding_schema = new mongoose.Schema({
    recently_solved:[
        {
            type:String,
            trim:true,


        }
    ],

     recently_visited:[ // pending walle
        {
            type:String,
            trim:true,


        }
    ],

    

    all_questions_solved:[
        {
            type:String,
            trim:true
        }
    ],

    easy:{
        type:Number,
        default:0

    },
    medium:{
        type:Number,
        default:0
    },

    hard:{
        type:Number,
        default:0
    },


    user:{
        type:mongoose.Schema.ObjectId,
        ref:"users"
    }


});


const Coding=mongoose.model("coding",coding_schema)

export default Coding