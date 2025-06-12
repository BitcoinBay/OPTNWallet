// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import ContractModal from '../../components/ContractModal';
import { Toast } from '@capacitor/toast';
import axios, { AxiosError } from 'axios';
import { Utxo } from 'cashscript';
import ElectrumServer from '../../apis/ElectrumServer/ElectrumServer';
import ElectrumService from '../../services/ElectrumService';
import { AddressCashStarter, MasterCategoryID } from './utils/values';
//import SignClient from '@walletconnect/sign-client'
import { WalletConnectModal } from '@walletconnect/modal';
import BCHLogo from './utils/bch.png';

interface ElectrumUtxo {
  height: number;
  token?: {
      amount: string;
      category: string;
      nft?: {
          capability: string;
          commitment: string;
      }
  };
  tx_hash: string;
  tx_pos: number;
  value: number;
}
interface ActionParameter {
    name: string;
    type: string;
    description: string;
    required: boolean;
}
interface AppAction {
    id: string;
    name: string;
    description: string;
    parameters: ActionParameter[];
    handler: (params: any) => Promise<void>;
}
interface CampaignUtxo extends ElectrumUtxo {
  name: string;
  owner: string;
  shortDescription: string;
  banner: string;
  endDate: string;
}
interface ArchivedCampaign {
  id: number;
  name: string;
  owner: string;
  shortDescription: string;
  banner: string;
  endDate: string;
}
const FundMeApp = () => {
  const [selectedAction, setSelectedAction] = useState<AppAction | null>(null);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [totalCampaigns, setTotalCampaigns] = useState<number>(0);
  const [totalBCHRaised, setTotalBCHRaised] = useState<number>(0);
  const [totalPledges, setTotalPledges] = useState<number>(0);
  //const [walletConnectInstance, setWalletConnectInstance] = useState<SignClient | null>(null);
  //const [walletConnectSession, setWalletConnectSession] = useState<any>(null);
  const [connectedChain, setConnectedChain] = useState<string | null>('bch:bchtest');
  const [usersAddress, setUsersAddress] = useState<string | null>(null);
  const [isEmpty, setIsEmpty] = useState(false);
  const [campaigns, setCampaigns] = useState<ElectrumUtxo[]>([]);
  const [expiredCampaigns, setExpiredCampaigns] = useState<ElectrumUtxo[]>([]);
  const [campaignsMap, setCampaignsMap] = useState<Map<number, CampaignUtxo | null>>(new Map());
  const [expiredCampaignsMap, setExpiredCampaignsMap] = useState<Map<number, CampaignUtxo | null>>(new Map());
  const [archivedCampaignsMap, setArchivedCampaignsMap] = useState<Map<number, ArchivedCampaign | null>>(new Map());
  const [campaignType, setCampaignType] = useState<string>('active');
  //connectedChain: network === 'mainnet' ? 'bch:bitcoincash' : 'bch:bchtest' 

  const hexToDecimal = (hex: string): number => {
    const bigEndianHex = hex.match(/.{2}/g)?.reverse().join('') ?? '0';
    return parseInt(bigEndianHex, 16);
  };

  useEffect(() => {
    async function fetchStats() {
      try {
        // Fetch stats from server
        const statsResponse = await axios.get('https://fundme.cash/get-stats');
        const statsData = statsResponse.data;
        
        // Set initial stats
        setTotalCampaigns(statsData.totalCampaigns);
        setTotalBCHRaised(statsData.totalRaisedBCH);
        setTotalPledges(statsData.totalPledges);

      } catch (error) {
        console.error('Error fetching stats:', error);
        Toast.show({
          text: `Error fetching stats:\n${error}`,
        });
      }
    }
    fetchStats();
  }, []);

//////////////////////////////////////////////////
////////// Prepare Wallet Connect Modal
//////////////////////////////////////////////////
  const walletConnectModal = new WalletConnectModal({
    projectId: '',
    themeMode: 'dark',
    themeVariables: {
      '--wcm-background-color': '#20c997',
      '--wcm-accent-color': '#20c997',
      },
    explorerExcludedWalletIds: 'ALL',
  });

  const requiredNamespaces = {
    bch: {
      chains: [connectedChain],
      methods: ['bch_getAddresses', 'bch_signTransaction', 'bch_signMessage'],
      events: ['addressesChanged'],
    },
  };  
/*
////////////////////////////////////////////////// 
////////// Wallet Connect V2
//////////////////////////////////////////////////
  //connection settings
  const signClient = async () => {
    return await SignClient.init({
      projectId: '',
      // optional parameters
      relayUrl: 'wss://relay.walletconnect.com',
      metadata: {
        name: 'OPTN Wallet',
        description: 'OPTN Wallet',
        url: 'https://',
        icons: ['https://.png']
      }
    });
  } 

  //actual connect 
  const setupSignClient = async () => {
    console.log('setupSignClient(): starting');
    // Setup walletconnect client
    if (walletConnectInstance == null) {
      const client = await signClient();  //call connection with above settings, wait for instance response
      if (client != null) {

        // Set listeners on client then save client to state
        console.log('setupSignClient(): walletConnectInstance detected, adding listeners...')
        // Attach event listeners to client instance
        client.on('session_event', ( event ) => {
          console.log('session_event');
          console.log(event);
        });
        console.log('session_event added...');

        client.on('session_update', ({ topic, params }) => {
          console.log('session_update');
          console.log(params);
        });
        console.log('session_update added...');

        client.on('session_delete', () => {
          console.log('Deleting session with topic ' + walletConnectSession.topic);
          client.session.delete(
            walletConnectSession.topic,
            {
              code: 6000,
              message: "User Disconnected",
            })
            setUsersAddress('');
            //setBlockchainData({ usersAddress: '' });
        });
        console.log('session_delete added...');

        //setInstance(client);
        //setupSession(client);
        setWalletConnectInstance(client);
        //setBlockchainData({ instance: client });

       //check if session exists in localstorage to use
       console.log('setupSession(): checking for existing walletconnect session...')
       const lastKeyIndex = client.session.getAll().length - 1;
       const lastSession = client.session.getAll()[lastKeyIndex];

       if (lastSession) {
         console.log('setupSession(): session found in localstorage: ');
         console.log(lastSession);
         //setSession(lastSession);

         //set users saved address
         const existingSessionAddress = lastSession.namespaces['bch'].accounts[0].slice(4);
         console.log(existingSessionAddress);
         setUsersAddress(existingSessionAddress);
         //setBlockchainData({ session: lastSession, usersAddress: existingSessionAddress });
       }

    } 
  }
}
  */
 /*
//////////////////////////////////////////////////
////////// User-triggered blockchain connect request
//////////////////////////////////////////////////
// Setup Session saved from localstorage
const manualSetupSignClient = async () => {
  console.log('manualSetupSignClient(): starting');

  // Setup walletconnect client
  let client: SignClient;
  if (walletConnectInstance == null) {
    console.log('manualSetupSignClient(): walletConnectInstance not detected, creating new instance...');
    client = await signClient();  //call connection with above settings, wait for instance response
    if (client != null) {

      // Set listeners on client then save client to state
      console.log('manualSetupSignClient(): walletConnectInstance detected, adding listeners...')
      // Attach event listeners to client instance
      client.on('session_event', ( event ) => {
        console.log('session_event');
        console.log(event);
      });
      console.log('session_event added...');

      client.on('session_update', ({ topic, params }) => {
        console.log('session_update');
        console.log(params);
      });
      console.log('session_update added...');

      client.on('session_delete', () => {
        console.log('Deleting session with topic ' + walletConnectSession.topic);
        client.session.delete(
          walletConnectSession.topic,
          {
            code: 6000,
            message: "User Disconnected",
          })
      });
      console.log('session_delete added...');
      setWalletConnectInstance(client);
      //setBlockchainData({ instance: client });
    } 
  }

  //load saved session or start a new one
  console.log('manualSetupSignClient(): checking for existing walletconnect session...');
  console.log(walletConnectInstance);
  const lastKeyIndex = walletConnectInstance.session.getAll().length - 1;
  const lastSession = walletConnectInstance.session.getAll()[lastKeyIndex];

  if (lastSession) {
    console.log('manualSetupSignClient(): session found in localstorage');
    setWalletConnectSession(lastSession);
    //setBlockchainData({ session: lastSession });

    //set users saved address
    const existingSessionAddress = lastSession.namespaces['bch'].accounts[0].slice(4);
    console.log(existingSessionAddress);
    setUsersAddress(existingSessionAddress);
    //setBlockchainData({ usersAddress: existingSessionAddress });

  //otherwise launch QR to start a new session
  } else {
    console.log('manualSetupSignClient(): no existing walletconnect session found, making a new one...');
    const { uri, approval } = await walletConnectInstance.connect({ requiredNamespaces });
    console.log('manualSetupSignClient(): uri received:');
    console.log(uri);
  
    // Open login window
    await walletConnectModal.openModal({ uri });
  
    // Await session approval from the wallet.
    console.log('manualSetupSignClient(): waiting for approval');
    const session = await approval();
    setWalletConnectSession(session);
    //setBlockchainData({ session: session });
    console.log('manualSetupSignClient(): WC connected! Session:');
    console.log(session);
    const existingSessionAddress = session.namespaces['bch'].accounts[0].slice(4);
    setUsersAddress(existingSessionAddress);
    //setBlockchainData({ usersAddress: existingSessionAddress });

    // Close the QRCode modal in case it was open.
    walletConnectModal.closeModal();
  }
}
*/
//////////////////////////////////////////////////
////////// UseEffect: Fetch campaigns on page load
//////////////////////////////////////////////////
useEffect(() => {
    setIsLoading(true);  //starts loading spinner graphic
    
    async function getCampaigns() {
      if (!ElectrumService) return;

      //delay to allow electrum to stabilize
      setTimeout(async () => {
        //get full list of campaigns hosted on FundMe server
        const fetchedCampaigns = await axios.get('https://fundme.cash/get-campaignlist');
        let campaignList = fetchedCampaigns.data;

        //const cashStarterUTXOs: Utxo[] = await electrumServer.getUtxos(AddressCashStarter);
        //const cashStarterUTXOs: Utxo[] = await electrumServer.request('blockchain.address.listunspent', AddressCashStarter);
        //const rawUTXOs = await electrumServer.request('blockchain.address.listunspent', AddressCashStarter) as any[];
        const rawUTXOs = await ElectrumService.getUTXOS(AddressCashStarter);

        //const transformedUTXOs = rawUTXOs.map(utxo => ({
          //...utxo,
          //token: utxo.token_data
        //}));
        console.log('[CashStarter] ' + rawUTXOs.length + ' UTXOs');
        console.log('rawUTXOs: ', rawUTXOs);

        const filteredUTXOs = rawUTXOs.filter( 
          utxo => utxo.token?.category == MasterCategoryID                  //only CashStarter NFT's
            && utxo.token?.nft?.capability == 'minting'                      //only minting ones
            && utxo.token.nft?.commitment.substring(70, 80) != 'ffffffffff' //not the masterNFT
        );

        console.log('[CashStarter] ' + filteredUTXOs.length + ' active campaigns');
        setCampaigns(filteredUTXOs);  //save active campaigns

        //if no utxos exist after filtering out the masterNFT
        if (filteredUTXOs.length == 0) {
          setIsLoading(false);
          setIsEmpty(true);
        }

        const expiredUTXOs = rawUTXOs.filter(utxo => 
          utxo.token?.category === MasterCategoryID                       // only CashStarter NFT's
          && utxo.token?.nft?.capability === 'mutable'                    // expired ones
          && utxo.token.nft?.commitment.substring(70, 80) != 'ffffffffff' //not the masterNFT
        );
        console.log('[CashStarter] ' + expiredUTXOs.length + ' expired campaigns')
        setExpiredCampaigns(expiredUTXOs);  //save expired campaigns

        //Fill active map with active campaigns
        for (const utxo of filteredUTXOs) {                       //Iterate over filteredUTXOs to populate the map

          const campaignId = hexToDecimal(utxo.token?.nft?.commitment.substring(70,80) ?? "0");

          // Check if campaignId exists in the campaigns array
          const index = campaignList.indexOf(campaignId.toString());
          if (index !== -1) {
            // If found, remove it from the array
            campaignList.splice(index, 1);
          }

          const endBlock = hexToDecimal(utxo.token?.nft?.commitment.substring(52, 60) ?? "0");
          const endDate = await formatTime(endBlock);

          //fetch campaign metadata from server
          try {
            const response = await axios.get('https://fundme.cash/get-shortcampaign/' + campaignId);
            const campaignInfo = response.data;

            const newCampaign = {
              ...utxo,
              name: campaignInfo.name,
              owner: campaignInfo.owner,
              shortDescription: campaignInfo.shortDescription,
              banner: campaignInfo.banner,
              endDate: endDate
            };
          
            // Update the state with the new campaign
            setCampaignsMap((prevCampaignsMap) => {
              const updatedMap = new Map(prevCampaignsMap);
              updatedMap.set(campaignId, newCampaign);
              return updatedMap;
            });

          } catch (err) { //if server does not have the campaignId files hosted
            const error = err as AxiosError;
            if (error.response && error.response.status === 404) {
              console.log(`fetch error, campaign ${campaignId} not hosted on FundMe`);
            } else {
              console.log('fetch unknown error: ', err);
            }
          }
        };

        //Fill expired map with expired campaigns
        for (const utxo of expiredUTXOs) {                       //Iterate over expiredUTXOs to populate the map
          const campaignId = hexToDecimal(utxo.token?.nft?.commitment.substring(70,80) ?? "0");

            // Check if campaignId exists in the campaigns array
            const index = campaignList.indexOf(campaignId.toString());
            if (index !== -1) {
              // If found, remove it from the array
              campaignList.splice(index, 1);
            }
          const endBlock = hexToDecimal(utxo.token?.nft?.commitment.substring(52, 60) ?? "0");

          //fetch campaign metadata from server
          try {
            const response = await axios.get('https://fundme.cash/get-shortcampaign/' + campaignId);
            const campaignInfo = response.data;

            const expiredCampaign = {
              ...utxo,
              name: campaignInfo.name,
              owner: campaignInfo.owner,
              shortDescription: campaignInfo.shortDescription,
              banner: campaignInfo.banner,
              endDate: endBlock.toString()
            };
            
            // Update the state with the new campaign
            setExpiredCampaignsMap((prevExpiredCampaignsMap) => {
              const updatedMap = new Map(prevExpiredCampaignsMap);
              updatedMap.set(campaignId, expiredCampaign);
              return updatedMap;
            });

          } catch (err) { //if server does not have the campaignId files hosted
            const error = err as AxiosError;
            if (error.response && error.response.status === 404) {
              console.log(`fetch error, campaign ${campaignId} not hosted on FundMe`);
            } else {
              console.log('fetch unknown error: ', err);
            }
          }
        };

        //Fill archived map with archived campaigns
        for (const campaign of campaignList) {                       //Iterate over campaignList to populate the map
          //fetch campaign metadata from server
          try {
            const response = await axios.get('https://fundme.cash/get-shortcampaign/' + campaign);
            const campaignInfo = response.data;

            const archivedCampaign = {
              id: campaign,
              name: campaignInfo.name,
              owner: campaignInfo.owner,
              shortDescription: campaignInfo.shortDescription,
              banner: campaignInfo.banner,
              endDate: 'archived'
            };
            
            // Update the state with the new campaign
            setArchivedCampaignsMap((prevArchivedCampaignsMap) => {
              const updatedMap = new Map(prevArchivedCampaignsMap);
              updatedMap.set(campaign, archivedCampaign);
              return updatedMap;
            });

          } catch (err) { //if server does not have the campaignId files hosted
            const error = err as AxiosError;
            if (error.response && error.response.status === 404) {
              console.log(`fetch error, campaign ${campaign} not hosted on FundMe`);
            } else {
              console.log('fetch unknown error: ', err);
            }
          }
        };

        setIsLoading(false);
    }, 2000); // Delay of 2 seconds);
  }
    getCampaigns();

  }, []);

  const actions = [
    {
      id: 'create',
      name: 'Create Campaign',
      description: 'Create a new campaign',
      parameters: [/* ... */],
      handler: async (params) => {
        // Implementation
      }
    },
    // ... other actions
  ];

  const handleActionClick = (action: AppAction) => {
    setSelectedAction(action);
    setIsActionModalOpen(true);
  };

  const handleActionSubmit = async (params: any) => {
    if (!selectedAction) return;

    setIsLoading(true);
    setError(null);

    try {
      await selectedAction.handler(params);
      setIsActionModalOpen(false);
      await Toast.show({
        text: 'Action completed successfully!',
      });
    } catch (err: any) {
      setError(err.message);
      await Toast.show({
        text: 'Action failed: ' + err.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  async function formatTime(blocks: number): Promise<string> {
    //const blockHeight = await electrumServer.getBlockHeight();
    const blockHeight = 900000;
    const blocksRemaining = Math.max(blocks - blockHeight, 0);

    if (blocksRemaining == 0) {
      return 'Expired';
    }

    const totalMinutes = blocksRemaining * 10;
    const totalHours = totalMinutes / 60;
    const remainingHours = totalHours % 24;
    const days = Math.floor(totalHours / 24);
    const hours = Math.floor(totalHours % 24);
    const minutes = Math.floor((remainingHours - hours) * 60);

    let endDate = '';
    if (days > 0) {
      endDate += `${days}d `;
    }
    if (hours > 0 || days > 0) { // Include hours if there are any days
      endDate += `${hours}h `;
    }
    endDate += `${minutes}m`;

    return endDate;
  }

  //click Details to open campaign details page
  const handleDetailsClick = (id: number) => {
    navigate(`/campaign/${id}`);
  };

  const getTitleClass = (title: string) => {
    const baseClass = "font-semibold text-gray-900 mb-1";
    if (title.length > 48) {
      return `${baseClass} text-sm`;
    }
    return `${baseClass} text-base`;
  };

  return (
    <div className="min-h-screen w-full bg-white">
      {/* Welcome Image */}
      <div className="flex justify-center mt-4">
        <img
          src="/assets/images/OPTNWelcome1.png"
          alt="Welcome"
          className="max-w-full h-auto"
        />
      </div>

      <div className="max-w-6xl mx-auto p-4">
        {/* Back Button */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => navigate('/apps')}
            className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded z-20"
          >
            Back to Apps
          </button>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Campaigns</p>
                <p className="text-2xl font-bold text-gray-900">{totalCampaigns}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total BCH Raised</p>
                <p className="text-2xl font-bold text-gray-900">{(Number(totalBCHRaised)).toFixed(2)}</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <img src={BCHLogo} alt="BCH" className="h-6 w-6" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Campaigns</p>
                <p className="text-2xl font-bold text-gray-900">{campaigns.length}</p>
              </div>
              <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Campaign Type Tabs */}
        <div className="flex space-x-4 mb-6">
          {['Active', 'Stopped', 'Archived'].map((type) => (
            <button
              key={type}
              onClick={() => setCampaignType(type)}
              className={`px-4 py-2 rounded-lg ${
                campaignType === type
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Campaigns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((campaign) => (
            <div key={campaign.id} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="relative" style={{ aspectRatio: '500/120' }}>
                <img
                  src={campaignsMap.get(hexToDecimal(campaign.token?.nft?.commitment.substring(70,80) ?? "0") as number)?.banner}
                  alt={campaign.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                onClick={() => navigate(`/apps/campaigndetails/${hexToDecimal(campaign.token?.nft?.commitment.substring(70,80) ?? "0")}`)}
                className="w-full px-3 py-1.5 bg-gradient-to-b from-lime-500 to-teal-500 text-white hover:from-lime-600 hover:to-teal-600 transition-colors duration-200"
              >
                Details
              </button>
              <div className="px-4 pt-2 pb-4 flex flex-col h-[210px]">
                <h3 className={getTitleClass(campaignsMap.get(hexToDecimal(campaign.token?.nft?.commitment.substring(70,80) ?? "0") as number)?.name ?? "")}>
                  {campaignsMap.get(hexToDecimal(campaign.token?.nft?.commitment.substring(70,80) ?? "0") as number)?.name}
                </h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-4">{campaignsMap.get(hexToDecimal(campaign.token?.nft?.commitment.substring(70,80) ?? "0") as number)?.shortDescription}</p>
                <div className="mt-auto">
                  <div className="flex items-center justify-center mb-3">
                    <div className="text-gray-600 text-sm">
                      Ends: {campaignsMap.get(hexToDecimal(campaign.token?.nft?.commitment.substring(70,80) ?? "0") as number)?.endDate}
                    </div>
                  </div>
                  <div className="relative h-2 bg-gray-200 rounded-full mb-2">
                    <div 
                      className="absolute left-0 top-0 h-full bg-gradient-to-r from-teal-500 to-lime-500 rounded-full"
                      style={{ width: `${(Number(campaign.value) / hexToDecimal(campaign.token?.nft?.commitment.substring(0, 12) ?? "0")) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{((Number(campaign.value) / hexToDecimal(campaign.token?.nft?.commitment.substring(0, 12) ?? "0")) * 100).toFixed(2)}%</span>
                    <span className="flex items-center space-x-1">
                      {(Number(campaign.value) / 100000000).toFixed(8)} / {(hexToDecimal(campaign.token?.nft?.commitment.substring(0, 12) ?? "0") / 100000000).toFixed(8)}
                      <img src={BCHLogo} alt="BCH" className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && campaigns.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">No campaigns found</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default FundMeApp;