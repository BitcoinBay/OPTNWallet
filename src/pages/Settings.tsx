// src/pages/Settings.tsx

import { useState, useEffect } from 'react';
import RecoveryPhrase from '../components/RecoveryPhrase';
import AboutView from '../components/AboutView';
import TermsOfUse from '../components/TermsOfUse';
import ContactUs from '../components/ContactUs';
import { useDispatch } from 'react-redux';
import { setWalletId } from '../redux/walletSlice';
import { resetUTXOs } from '../redux/utxoSlice';
import WalletManager from '../apis/WalletManager/WalletManager';
import { useNavigate } from 'react-router-dom';
import { resetTransactions } from '../redux/transactionSlice';
import NetworkSettingsView from '../components/NetworkSettingsView';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Web3Wallet } from '@walletconnect/web3wallet';
import { Core } from '@walletconnect/core';

const Settings = () => {
  const [selectedOption, setSelectedOption] = useState('');
  const [navBarHeight, setNavBarHeight] = useState(0);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const navBar = document.getElementById('bottomNavBar');
    if (navBar) {
      setNavBarHeight(navBar.offsetHeight);
    }

    const core = new Core({
      projectId: '3fd234b8e2cd0e1da4bc08a0011bbf64',
    });

    Web3Wallet.init({
      core,
      metadata: {
        name: 'Cashonize',
        description: 'Cashonize BitcoinCash Web Wallet',
        url: 'cashonize.com/',
        icons: ['https://cashonize.com/images/favicon.ico'],
      },
    }).then(async (web3wallet) => {
      const updateProposal = (proposal) => {
        const proposalParent = document.getElementById('wc-session-approval');

        const meta = proposal.params.proposer.metadata;
        const peerName = meta.name;
        const approvalHtml = /* html */ `
      <div id="proposal-${proposal.id}" style="display: flex; align-items: center; flex-direction: row; gap: 10px;">
        <div id="proposal-app-icon" style="display: flex; align-items: center; height: 64px; width: 64px;"><img src="${meta.icons[0]}"></div>
        <div style="display: flex; flex-direction: column; width: 100%;">
          <div id="proposal-app-name">${peerName}</div>
          <div id="proposal-app-url"><a href="${meta.url}" target="_blank">${meta.url}</a></div>
        </div>
      </div>`;
        proposalParent.innerHTML = approvalHtml;
      };
    });
  }, []);

  const handleOptionClick = (option: string) => {
    setSelectedOption(option);
  };

  const handleLogout = async () => {
    const walletManager = WalletManager();
    await walletManager.clearAllData(); // Clear the entire database
    dispatch(setWalletId(0)); // Reset wallet ID in Redux store
    dispatch(resetUTXOs()); // Reset UTXOs in Redux store
    dispatch(resetTransactions()); // Reset transactions in Redux store
    navigate('/');
  };

  const renderContent = () => {
    switch (selectedOption) {
      case 'recovery':
        return <RecoveryPhrase />;
      case 'about':
        return <AboutView />;
      case 'terms':
        return <TermsOfUse />;
      case 'contact':
        return <ContactUs />;
      case 'network':
        return <NetworkSettingsView />;
      default:
        return null;
    }
  };

  const renderTitle = () => {
    switch (selectedOption) {
      case 'recovery':
        return 'Recovery Phrase';
      case 'about':
        return 'About';
      case 'terms':
        return 'Terms of Use';
      case 'contact':
        return 'Contact Us';
      case 'network':
        return 'Network';
      default:
        return '';
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-center mt-4">
        <img
          src="/assets/images/OPTNWelcome1.png"
          alt="Welcome"
          className="max-w-full h-auto"
        />
      </div>
      <h1 className="text-2xl font-bold mb-4 text-center">Settings</h1>
      {!selectedOption ? (
        <div className="mb-4">
          <button
            onClick={() => {
              // document.getElementById('wc-session-scan-modal').style.display =
              // 'flex';
              const html5QrcodeScanner = new Html5QrcodeScanner(
                'reader',
                {
                  fps: 3,
                  qrbox: { width: 250, height: 250 },
                  formatsToSupport: [0],
                },
                /* verbose= */ false
              );
              html5QrcodeScanner.render(
                async (decodedText) => {
                  // document.getElementById(
                  //   'wc-session-scan-modal'
                  // ).style.display = 'none';
                  await html5QrcodeScanner?.clear();
                  // document.getElementById('wcUri').value = decodedText;
                  try {
                    await web3wallet.core.pairing.pair({ uri: 'uri' });
                    // document.getElementById('wcUri').value = '';
                  } catch (err) {
                    alert(`Error connecting with dApp:\n${err.mesage ?? err}`);
                  } finally {
                    // connectButton.disabled = false;
                  }
                },
                () => {}
              );
            }}
            className="block w-full py-2 px-4 border rounded-lg mb-2 mx-2"
          >
            Scan QR Code
          </button>
          <button
            onClick={() => handleOptionClick('recovery')}
            className="block w-full py-2 px-4 border rounded-lg mb-2 mx-2"
          >
            Recovery Phrase
          </button>
          <button
            onClick={() => handleOptionClick('about')}
            className="block w-full py-2 px-4 border rounded-lg mb-2 mx-2"
          >
            About
          </button>
          <button
            onClick={() => handleOptionClick('terms')}
            className="block w-full py-2 px-4 border rounded-lg mb-2 mx-2"
          >
            Terms of Use
          </button>
          <button
            onClick={() => handleOptionClick('contact')}
            className="block w-full py-2 px-4 border rounded-lg mb-2 mx-2"
          >
            Contact Us
          </button>
          <button
            onClick={() => handleOptionClick('network')}
            className="block w-full py-2 px-4 border rounded-lg mb-2 mx-2"
          >
            Network
          </button>
          <button
            onClick={handleLogout}
            className="block w-full py-2 px-4 border rounded-lg mb-2 mx-2 bg-red-500 text-white"
          >
            Log Out
          </button>
        </div>
      ) : (
        <div
          className="fixed inset-0 bg-white p-4 z-50 overflow-hidden"
          style={{
            height: `calc(100vh - ${navBarHeight}px)`,
            top: 0,
            paddingBottom: `${navBarHeight}px`,
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setSelectedOption('')}
              className="text-gray-800 py-2 px-4 rounded"
            >
              ←
            </button>
            <h2 className="text-xl font-bold">{renderTitle()}</h2>
            <div className="w-16"></div>{' '}
            {/* Empty div to balance the flex layout */}
          </div>
          {renderContent()}
        </div>
      )}
    </div>
  );
};

export default Settings;
