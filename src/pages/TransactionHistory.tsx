import { useEffect, useState } from 'react'
import TransactionManager from '../apis/TranasactionManager/TransactionManager';
import { useParams } from 'react-router-dom';

const TransactionHistory = () => {
    const TransactionManage = TransactionManager();
    const { wallet_id } = useParams<{ wallet_id: string }>();
    const [transactionHistoryArray, setTransactionHistoryArray] = useState([]);

    useEffect(() => {
        if (!wallet_id) {
            return;
        }
        const wallet_id_number = parseInt(wallet_id, 10);
        TransactionManage.fetchTransactionHistory(wallet_id_number);
    }, []);
  return (
    <>
      <section>
      </section>
    </>
  )
}

export default TransactionHistory