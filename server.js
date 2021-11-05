const express = require('express')

const { ObjectId, MongoClient, OrderedBulkOperation } = require('mongodb');

const Schema = require('./stagesSchema')

const PORT = process.env.PORT || 3000;

const app = express()

app.use(express.json());

const url = 'mongodb+srv://Monya:%26ap%407Kl%29%29@cluster0.1gvjo.mongodb.net/monitoring?retryWrites=true&w=majority'

const connect = async () => {
	const client = new MongoClient(url, { useUnifiedTopology: true });
	await client.connect();
    
	return { client, db: client.db('monitoring') };
};

const insert_stage = async(stage)=>{
    const { client,db } = await connect();
    try{
        const stages = db.collection('stages');
        
        console.log("this stage");
        console.log(stage)

        if(stage.id)
            stage._id = new ObjectId(stage.id);
        if(stage._id){
            console.log("update stage");
            const res = stage._id;
            stages.updateOne(
                {_id: stage._id},
                {
                    $set:{
                        title: stage.title,
                        order: stage.order
                    }
                }
            );
            return res;
        }
        else{
            console.log("new stage");
            const res = stages.insertOne(stage);
            return (await res).insertedId.toString();
        }
    }
    finally{

    }
}



const insert_task = async(task) =>{
    const { clien,db } = await connect();
    try{
        console.log('int try ')

        const tasks = db.collection('tasks');
        console.log(tasks);
        console.log(task);
        if(task.id){
            task._id = new ObjectId(task.id);
        }
        console.log(task.id);
        delete task.id;
        task.stage = new ObjectId(task.stage);
        if(task._id) {
            console.log("update")
            const res = task._id;
            tasks.updateOne(
                {_id: task._id},
                {
                    $set:{
                        title: task.title,
                        description: task.description,
                        users: task.users,
                        stage: task.stage
                    }
                }
            );
            return res;
        }
        
        else{
            console.log('new')
            delete task.id;
            const res = tasks.insertOne(task);
            return (await res).insertedId.toString();
        }
    }
    finally{

    }
    console.log('fygfdbgdfhbjhbjh')
}

const delete_task = async(id)=>{
    const { clien,db } = await connect();
    try{
        const tasks = db.collection('tasks');
        tasks.deleteOne({_id: new ObjectId(id.id)});
    }
    finally{

    }
};

const get_data = async () => {
    const { client, db } = await connect();
    try {
        const data = { stages: [ ] };

        const stages = await db.collection('stages').find().sort({ order: 1});
        await stages.forEach((stage) => data.stages.push(Object.assign({ tasks: [ ] }, stage)));

        const tasks = await db.collection('tasks').find();
        await tasks.forEach((task) => {
            console.log(task);
            const stage = data.stages.find(stage => ''+stage._id == ''+task.stage);
            if (stage)
                stage.tasks.push(task);
        });

        console.log(data);
        return data;
    }
    finally {
        //await client.close();
    }
};

app.post('/api/set/', function(req,res){
    console.log(req.body);
    insert_task(req.body).then((result)=>{
        console.log(result);
        res.send(result);   
    });
})

app.post('/api/post/stage/', function(req,res){
    console.log(req.body);
    insert_stage(req.body).then((result)=>{
        console.log(result);
        res.send(result);
    });
})

app.post('/api/delete/task/',function(req,res){
    delete_task(req.body);
    res.send();
})

app.get('/api/', function(req, res) {

    console.log('/api/');
    const p = get_data();
    p.then((data) => {
        res.send(data);
    });
});

app.get('/*', express.static('./static'));

async function start() {
    try{
        // await mongoose.connect('mongodb+srv://Monya:%26ap%407Kl%29%29@cluster0.1gvjo.mongodb.net/test',{
        //     useNewUrlParser:true,
        //     useFindAndModify:false
        // });

        app.listen(PORT, () => {
            console.log('Server has been started');
        });
    }
    catch (e) {
        console.error(e)
    }
}



start();
