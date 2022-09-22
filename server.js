// comandos powershell
// tasklist /fi "imagename eq node.exe" -> lista todos los procesos de node.js activos
// taskkill /pid numpid /f -> mata un proceso por su número de PID

// comandos bash
// fuser <PORT>/tcp [-k] -> encuentra y [mata] al proceso ocupando el puerto PORT

const express = require('express');
const cluster = require('cluster')

const app = express()
const numCPUs = require('os').cpus().length

const PORT = parseInt(process.argv[2]) || 8080
const modoCluster = process.argv[3] == 'CLUSTER'

/* función objeto random */
const randomNum = (cantidad, obj) => {
    for (let i = 0; i < cantidad; i++) {
        const random = Math.floor(Math.random() * 10);
        if (obj[random]) {
            obj[random]++;
            continue;
        }
        obj[random] = 1;
    }
    return obj;
};

/* Modo Cluster */
if (modoCluster && cluster.isMaster) {
    console.log('número de procesadores',numCPUs)
    console.log(`PID MASTER ${process.pid}`)

    for (let i=0; i < numCPUs; i++) {
        cluster.fork()
    }

    cluster.on('exit', worker => {
        console.log('Worker', worker.process.pid, 'died', new Date().toLocaleString()) // forzamos la salida de un worker
        cluster.fork() // Creamos otro worker cuando se caiga un worker
    })
} 

else {
    
    app.get('/', (req, res) => {
        res.send(`Servidor express en ${PORT} -<b>PID ${process.pid}</b> - ${new Date().toLocaleString()}`)
    })

    app.get('/api/randoms', (req, res) => {   
        let { cantidad } = req.query;
        let obj = {};

        const result = randomNum(cantidad, obj);
        res.send(result)
    });

    app.listen(PORT, err => {
        if (!err) console.log(`Servidor express escuchando en el puerto ${PORT} - PID WORKER ${process.pid}`)
    })

}

app.get('/info', (req, res) => {
    res.send(`Número de procesadores del servido ${numCPUs}`)
})