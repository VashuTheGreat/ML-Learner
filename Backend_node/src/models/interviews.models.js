import mongoose from "mongoose";

const interviewSchema = mongoose.Schema({
    companyName: {
        type: String,
        trim: true,
        required: true
    },
    user_id:{
        type:mongoose.Schema.ObjectId,
        ref:"users",
    },
    topic: {
        type: String,
        trim: true,
        required: true
    },
    job_Role: {
        type: String,
        trim: true,
        required: true
    },
    time: {  
        type: Date,
        required: true  
    },
    status: {  
        type: String,
        enum: ['live', 'pending', 'done'],
        default: 'pending'
    }
}, { timestamps: true });  

const Interview = mongoose.model('Interview', interviewSchema);
export default Interview;
