import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import ContractModal from '../../components/ContractModal';
import { Toast } from '@capacitor/toast';
import axios from 'axios';
import { Utxo } from 'cashscript';
import ElectrumService from '../../services/ElectrumService';
import { AddressCashStarter, MasterCategoryID } from './utils/values';

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

const FundMeApp = () => {
  const [selectedAction, setSelectedAction] = useState<AppAction | null>(null);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState<Utxo[]>([]);
  const [totalCampaigns, setTotalCampaigns] = useState<number>(0);
  const [totalBCHRaised, setTotalBCHRaised] = useState<number>(0);
  const [totalPledges, setTotalPledges] = useState<number>(0);

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
        //toast.info(`Error fetching stats:\n${error}`);
      }
    }
    fetchStats();
  }, []);

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

        const cashStarterUTXOs: Utxo[] = await ElectrumService.getUtxos(AddressCashStarter);
        //console.log(cashStarterUTXOs);
        console.log('[CashStarter] ' + cashStarterUTXOs.length + ' UTXOs');
        const filteredUTXOs = cashStarterUTXOs.filter( 
          utxo => utxo.token?.category == MasterCategoryID                  //only CashStarter NFT's
            && utxo.token?.nft?.capability == 'minting'                     //only minting ones
            && utxo.token.nft?.commitment.substring(70, 80) != 'ffffffffff' //not the masterNFT
        );
        console.log('[CashStarter] ' + filteredUTXOs.length + ' active campaigns');
        setCampaigns(filteredUTXOs);  //save active campaigns

        //if no utxos exist after filtering out the masterNFT
        if (filteredUTXOs.length == 0) {
          setIsLoading(false);
          setIsEmpty(true);
        }

        const expiredUTXOs = cashStarterUTXOs.filter(utxo => 
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
            const response = await axios.get(environmentUrl + '/get-shortcampaign/' + campaignId);
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
            const response = await axios.get(environmentUrl + '/get-shortcampaign/' + campaignId);
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
            const response = await axios.get(environmentUrl + '/get-shortcampaign/' + campaign);
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

  }, [ElectrumService]);

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

  return (
    <div className="container mx-auto p-4">
        {/* Welcome Image */}
        <div className="flex justify-center mt-4">
          <img
            src="/assets/images/OPTNWelcome1.png"
            alt="Welcome"
            className="max-w-full h-auto"
          />
        </div>

        {/* Logo */}
        <div className="flex justify-center mt-4">
          <img
            src="/assets/images/fundme.png"
            alt="Welcome"
            className="max-w-full h-auto"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 bg-white rounded-lg shadow">
            <div className="text-sm text-gray-600">Past Campaigns</div>
            <div className="text-xl font-semibold mt-1">{totalCampaigns}</div>
        </div>
        
        <div className="p-4 bg-white rounded-lg shadow">
            <div className="text-sm text-gray-600">Active Campaigns</div>
            <div className="text-xl font-semibold mt-1">{campaigns.length}</div>
        </div>
        
        <div className="p-4 bg-white rounded-lg shadow">
            <div className="text-sm text-gray-600">Total Raised</div>
            <div className="flex items-center mt-1">
            <img src="/assets/images/bch-logo.png" alt="BCH" className="w-5 h-5 mr-2" />
            <span className="text-xl font-semibold">{totalBCHRaised.toFixed(2)}</span>
            </div>
        </div>
        
        <div className="p-4 bg-white rounded-lg shadow">
            <div className="text-sm text-gray-600">Total Pledges</div>
            <div className="text-xl font-semibold mt-1">{totalPledges}</div>
        </div>
        </div>

      <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold">FundMe</h1>
        <button
          onClick={() => navigate('/apps')}
          className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded"
        >
          Back to Apps
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {actions.map((action) => (
          <div
            key={action.id}
            onClick={() => handleActionClick(action)}
            className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
          >
            <h3 className="font-semibold">{action.name}</h3>
            <p className="text-sm text-gray-600">{action.description}</p>
          </div>
        ))}
      </div>

      {/* Action Modal */}
      {isActionModalOpen && selectedAction && (
        <ContractModal
          action={selectedAction}
          onSubmit={handleActionSubmit}
          onClose={() => setIsActionModalOpen(false)}
          isLoading={isLoading}
          error={error}
        />
      )}
    </div>
  );
};

export default FundMeApp;