const express = require('express');
const { MongoClient } = require('mongodb');
const path = require('path');

const app = express();
const PORT = 3000;


app.use(express.json());
app.use(express.static('public'));


const MONGO_URI = 'mongodb://localhost:27017';
const DB_NAME = 'gescom';
const COLLECTION_NAME = 'employes';

let db;
let employesCollection;


async function connectToDatabase() {
    try {
        const client = await MongoClient.connect(MONGO_URI, {
            useUnifiedTopology: true,
        });
        console.log('✅ Connecté à MongoDB');
        db = client.db(DB_NAME);
        employesCollection = db.collection(COLLECTION_NAME);
        return client;
    } catch (error) {
        console.error('❌ Erreur de connexion MongoDB:', error);
        process.exit(1);
    }
}




app.get('/api/collections', async (req, res) => {
    try {
        const collections = await db.listCollections().toArray();
        res.json({ success: true, data: collections });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});


app.get('/api/employees', async (req, res) => {
    try {
        const employees = await employesCollection.find({}).toArray();
        res.json({ success: true, data: employees, count: employees.length });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});


app.get('/api/employees/count', async (req, res) => {
    try {
        const count = await employesCollection.countDocuments({});
        res.json({ success: true, count: count });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});


app.post('/api/employees', async (req, res) => {
    try {
        const result = await employesCollection.insertOne(req.body);
        res.json({ success: true, data: result, insertedId: result.insertedId });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});


app.post('/api/employees/bulk', async (req, res) => {
    try {
        const result = await employesCollection.insertMany(req.body);
        res.json({ success: true, data: result, insertedCount: result.insertedCount });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});


app.get('/api/employees/prenom-starts-d', async (req, res) => {
    try {
        const employees = await employesCollection.find({
            prenom: { $regex: '^D', $options: 'i' }
        }).toArray();
        res.json({ success: true, data: employees, count: employees.length });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});


app.get('/api/employees/prenom-d-start-or-end', async (req, res) => {
    try {
        const employees = await employesCollection.find({
            $or: [
                { prenom: { $regex: '^D', $options: 'i' } },
                { prenom: { $regex: 'D$', $options: 'i' } }
            ]
        }).toArray();
        res.json({ success: true, data: employees, count: employees.length });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});


app.get('/api/employees/prenom-d-6chars', async (req, res) => {
    try {
        const employees = await employesCollection.find({
            prenom: { $regex: '^D.{5}$', $options: 'i' }
        }).toArray();
        res.json({ success: true, data: employees, count: employees.length });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});


app.get('/api/employees/anciennete-gt-10', async (req, res) => {
    try {
        const employees = await employesCollection.find({
            anciennete: { $gt: 10 }
        }).toArray();
        res.json({ success: true, data: employees, count: employees.length });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});


app.get('/api/employees/with-rue', async (req, res) => {
    try {
        const employees = await employesCollection.find(
            { 'adresse.rue': { $exists: true } },
            { projection: { nom: 1, prenom: 1, adresse: 1 } }
        ).toArray();
        res.json({ success: true, data: employees, count: employees.length });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});


app.put('/api/employees/increment-prime', async (req, res) => {
    try {
        const { amount } = req.body;
        const incrementValue = amount || 200; 
        
        const result = await employesCollection.updateMany(
            { prime: { $exists: true } },
            { $inc: { prime: incrementValue } }
        );
        res.json({ success: true, modifiedCount: result.modifiedCount });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});


app.get('/api/employees/top-10-anciens', async (req, res) => {
    try {
        const employees = await employesCollection.find({})
            .sort({ anciennete: -1 })
            .limit(10)
            .toArray();
        res.json({ success: true, data: employees, count: employees.length });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});


app.get('/api/employees/ville-toulouse', async (req, res) => {
    try {
        const employees = await employesCollection.find({
            'adresse.ville': 'Toulouse'
        }).toArray();
        res.json({ success: true, data: employees, count: employees.length });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});


app.get('/api/employees/prenom-m-ville-bordeaux-paris', async (req, res) => {
    try {
        const employees = await employesCollection.find({
            prenom: { $regex: '^M', $options: 'i' },
            'adresse.ville': { $in: ['Bordeaux', 'Paris'] }
        }).toArray();
        res.json({ success: true, data: employees, count: employees.length });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});




app.put('/api/employees/:id', async (req, res) => {
    try {
        const { ObjectId } = require('mongodb');
        const result = await employesCollection.updateOne(
            { _id: new ObjectId(req.params.id) },
            { $set: req.body }
        );
        res.json({ success: true, modifiedCount: result.modifiedCount });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});


app.delete('/api/employees/:id', async (req, res) => {
    try {
        const { ObjectId } = require('mongodb');
        const result = await employesCollection.deleteOne({
            _id: new ObjectId(req.params.id)
        });
        res.json({ success: true, deletedCount: result.deletedCount });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});


app.post('/api/employees/search', async (req, res) => {
    try {
        const { filter = {}, sort = {}, limit = 0 } = req.body;
        const employees = await employesCollection
            .find(filter)
            .sort(sort)
            .limit(limit)
            .toArray();
        res.json({ success: true, data: employees, count: employees.length });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});


app.get('/api/mapreduce/employees-by-city', async (req, res) => {
    try {
        const pipeline = [
            { $group: { _id: '$adresse.ville', count: { $sum: 1 }, employees: { $push: { nom: '$nom', prenom: '$prenom' } } } },
            { $sort: { count: -1 } }
        ];
        const result = await employesCollection.aggregate(pipeline).toArray();
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});


app.get('/api/mapreduce/average-prime-by-city', async (req, res) => {
    try {
        const pipeline = [
            { $match: { prime: { $exists: true } } },
            { $group: { _id: '$adresse.ville', averagePrime: { $avg: '$prime' }, totalPrime: { $sum: '$prime' }, count: { $sum: 1 } } },
            { $sort: { averagePrime: -1 } }
        ];
        const result = await employesCollection.aggregate(pipeline).toArray();
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});


app.get('/api/mapreduce/average-anciennete-by-city', async (req, res) => {
    try {
        const pipeline = [
            { $match: { anciennete: { $exists: true } } },
            { $group: { _id: '$adresse.ville', averageAnciennete: { $avg: '$anciennete' }, maxAnciennete: { $max: '$anciennete' }, minAnciennete: { $min: '$anciennete' }, count: { $sum: 1 } } },
            { $sort: { averageAnciennete: -1 } }
        ];
        const result = await employesCollection.aggregate(pipeline).toArray();
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});


app.get('/api/stats', async (req, res) => {
    try {
        const totalCount = await employesCollection.countDocuments({});
        const withPrime = await employesCollection.countDocuments({ prime: { $exists: true } });
        const withAnciennete = await employesCollection.countDocuments({ anciennete: { $exists: true } });
        
        const avgPrimePipeline = [
            { $match: { prime: { $exists: true } } },
            { $group: { _id: null, avg: { $avg: '$prime' } } }
        ];
        const avgPrimeResult = await employesCollection.aggregate(avgPrimePipeline).toArray();
        
        const avgAnciennetePipeline = [
            { $match: { anciennete: { $exists: true } } },
            { $group: { _id: null, avg: { $avg: '$anciennete' } } }
        ];
        const avgAncienneteResult = await employesCollection.aggregate(avgAnciennetePipeline).toArray();
        
        res.json({
            success: true,
            stats: {
                totalEmployees: totalCount,
                employeesWithPrime: withPrime,
                employeesWithAnciennete: withAnciennete,
                averagePrime: avgPrimeResult[0]?.avg || 0,
                averageAnciennete: avgAncienneteResult[0]?.avg || 0
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});


app.post('/api/mapreduce/custom', async (req, res) => {
    try {
        const { groupBy, operations, valueField, sortBy, sortOrder } = req.body;
        
        if (!groupBy || !operations || operations.length === 0) {
            return res.status(400).json({ 
                success: false, 
                error: 'groupBy et operations sont requis' 
            });
        }
        
        
        const groupStage = {
            _id: `$${groupBy}`
        };
        
        
        if (operations.includes('count')) {
            groupStage.count = { $sum: 1 };
        }
        
        if (operations.includes('sum') && valueField) {
            groupStage.sum = { $sum: `$${valueField}` };
        }
        
        if (operations.includes('avg') && valueField) {
            groupStage.avg = { $avg: `$${valueField}` };
        }
        
        if (operations.includes('min') && valueField) {
            groupStage.min = { $min: `$${valueField}` };
        }
        
        if (operations.includes('max') && valueField) {
            groupStage.max = { $max: `$${valueField}` };
        }
        
        
        const pipeline = [
            { $group: groupStage }
        ];
        
        
        if (sortBy) {
            const sortStage = {};
            sortStage[sortBy] = sortOrder || 1;
            pipeline.push({ $sort: sortStage });
        }
        
        const result = await employesCollection.aggregate(pipeline).toArray();
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});


connectToDatabase().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
    });
});
