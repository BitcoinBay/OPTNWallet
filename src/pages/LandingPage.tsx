import { Link } from 'react-router-dom';
import NavBar from '../components/NavBar';

const LandingPage = () => {
  return (
    <>
      <section className="min-h-screen bg-black flex flex-col">
        <NavBar />
        <div className="flex flex-row mt-64 side-margins">
          <div className="flex flex-col w-24 title-width">
            <div className="text-white font-bold text-7xl ">OPTN </div>
            <div className="text-white text-xl mt-4">
              
            </div>
            <div className="flex flex-col mt-2">
              <Link
                to="/createwallet"
                className="bg-white mr-4 text-gray-800 font-semibold py-2 px-4 border-gray-400 rounded-xl "
              >
                Create Wallet
              </Link>
              <Link
                to="/importwallet"
                className="bg-white text-gray-800 font-semibold py-2 px-4 border-gray-400 rounded-xl"
              >
                Import Wallet
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default LandingPage;
