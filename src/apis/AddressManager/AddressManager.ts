import { Address } from '../../types/types';
import DatabaseService from '../DatabaseManager/DatabaseService';

export default function AddressManager() {
  const dbService = DatabaseService();

  async function registerAddress(address: Address): Promise<void> {
    try {
      await dbService.ensureDatabaseStarted();
      const db = dbService.getDatabase();
      if (db != null) {
        const registerAddressQuery = db.prepare(`
          INSERT INTO addresses (wallet_id, address, balance, hd_index, change_index, prefix) VALUES (?, ?, ?, ?, ?, ?);
        `);

        registerAddressQuery.run([
          address.wallet_id,
          address.address,
          address.balance,
          address.hd_index,
          address.change_index,
          address.prefix,
        ]);

        registerAddressQuery.free();
      } else {
        console.error('Database instance is null.');
      }
    } catch (error) {
      console.error('Failed to register address:', error);
    }
  }

  return {
    registerAddress,
  };
}
