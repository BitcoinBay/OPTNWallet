// src/pages/Settings.tsx

import React, { useState, useEffect } from 'react';
import RecoveryPhrase from '../components/RecoveryPhrase';
import AboutView from '../components/AboutView';
import TermsOfUse from '../components/TermsOfUse';
import ContactUs from '../components/ContactUs';
import { useDispatch } from 'react-redux';
import { setWalletId, resetWallet } from '../redux/walletSlice';
import { resetUTXOs } from '../redux/utxoSlice';
import WalletManager from '../apis/WalletManager/WalletManager';
import { useNavigate } from 'react-router-dom';

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
  }, []);

  const handleOptionClick = (option: string) => {
    setSelectedOption(option);
  };

  const handleLogout = async () => {
    const walletManager = WalletManager();
    await walletManager.clearAllData(); // Clear the entire database
    dispatch(resetWallet()); // Reset wallet state in Redux store
    dispatch(resetUTXOs()); // Reset UTXO state in Redux store
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
      default:
        return '';
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>
      {!selectedOption ? (
        <div className="mb-4">
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
            onClick={handleLogout}
            className="block w-full py-2 px-4 border rounded-lg mb-2 mx-2 bg-red-500 text-white"
          >
            Log Out
          </button>
        </div>
      ) : (
        <div
          className="fixed inset-0 bg-white p-4 z-50 overflow-auto"
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