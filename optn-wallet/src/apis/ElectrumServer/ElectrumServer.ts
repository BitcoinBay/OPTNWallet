import { ElectrumCluster, ElectrumTransport, ClusterOrder } from 'electrum-cash;

export enum Network {
    CHIPNET
}

export class ElectrumNetworkProvider {
    private electrum: ElectrumCluster;

    constructor(public network: Network = Network.CHIPNET) {
        this.initializeElectrumCluster();
    }

    private initializeElectrumCluster() {
        if (this.network === Network.CHIPNET) {
            this.electrum = new ElectrumCluster('Chipnet Application', '1.4.1', 1, 1, ClusterOrder.PRIORITY);
            this.electrum.addServer('chipnet.imaginary.cash', 50004, ElectrumTransport.WSS.Scheme, false);
        } else {
            throw new Error(`Unsupported network configuration: ${this.network}`);
        }
    }

    public async connectCluster(): Promise<void> {
        await this.electrum.startup();
    }

    public async disconnectCluster(): Promise<void> {
        await this.electrum.shutdown();
    }
}
