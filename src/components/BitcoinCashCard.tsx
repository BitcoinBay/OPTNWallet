import { FaBitcoin } from 'react-icons/fa';

const BitcoinCashCard = ({ totalAmount }) => {
  return (
    <div className="p-4 mb-4 border rounded-lg shadow-md bg-white flex items-center justify-between">
      <div className="flex items-center">
        <FaBitcoin className="text-green-500 text-3xl mr-3" />
        <div className="text-lg font-bold">Bitcoin Cash</div>
        <div className="text-lg font-bold">: {totalAmount} satoshis</div>
      </div>
    </div>
  );
};

export default BitcoinCashCard;
