const express = require('express');
require("dotenv").config()
const axios=require('axios');

const router = express.Router();
const tocall=async (body)=>{
      try{
        const response= await axios.post(`${process.env.HOST}/model`,{
            data_name:body.data_name,
            model_name:body.model_name,
            params:body.params

        },{
            headers:{
                'Content-Type':'application/json'
            }
        });

        console.log("Response: ",response.data);
        return response.data
    }
    catch(e){
        console.error("Error",e);
    }
}

router.post('/model', (req, res, next) => {
        console.log("Request received: ",req.body);

  response=tocall(req.body)

    res.send({
        response:response
    });
});

module.exports = router;   
