import { ElectrumCluster, ElectrumTransport } from 'electrum-cash';

const electrum = new ElectrumCluster('My Application', '1.4.1', 1, 2, 'PRIORITY');
electrum.addServer('electrum-server.example.com', 50002, ElectrumTransport.SSL.Scheme, true);

async function initElectrum() {
    await electrum.startup();
    await electrum.ready();
    console.log('Connected to Electrum server successfully.');
}
async function shutdownElectrum() {
    await electrum.shutdown();
    console.log('Disconnected from Electrum server successfully.');
}

export { initElectrum, shutdownElectrum }