import net from 'node:net';
const server=net.createServer(client=>{
 const upstream=net.connect('/bridge/gateway.sock');
 const close=()=>{client.destroy();upstream.destroy();};
 client.on('error',close);upstream.on('error',close);client.on('close',close);upstream.on('close',close);
 client.pipe(upstream);upstream.pipe(client);
});
server.maxConnections=8;
server.listen(8787,'127.0.0.1',()=>console.log('LOOPBACK_BRIDGE_READY'));
