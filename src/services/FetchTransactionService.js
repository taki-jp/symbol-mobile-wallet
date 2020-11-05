import {
    Address,
    TransactionHttp,
    TransactionGroup,
    Transaction,
    TransferTransaction,
    Mosaic,
    MosaicHttp,
    NamespaceHttp,
    LockFundsTransaction,
    AggregateTransaction,
} from 'symbol-sdk';
import type { AccountOriginType } from '@src/storage/models/AccountModel';
import type { NetworkModel } from '@src/storage/models/NetworkModel';
import type {
    AggregateTransactionModel,
    TransactionModel,
    TransferTransactionModel,
} from '@src/storage/models/TransactionModel';
import { formatTransactionLocalDateTime } from '@src/utils/format';
import type { MosaicModel } from '@src/storage/models/MosaicModel';
import FundsLockTransaction from '@src/components/organisms/transaction/FundsLockTransaction';

export default class FetchTransactionService {
    /**
     * Gets MosaicModel from a Mosaic
     * @param mosaic
     * @param network
     * @return {Promise<{amount: string, mosaicId: string, mosaicName: *, divisibility: *}>}
     * @private
     */
    static async _getMosaicModelFromMosaicId(mosaic: Mosaic, network: NetworkModel): Promise<MosaicModel> {
        let mosaicInfo = {},
            mosaicName = {};
        try {
            mosaicInfo = await new MosaicHttp(network.node).getMosaic(mosaic.id).toPromise();
            [mosaicName] = await new NamespaceHttp(network.node).getMosaicsNames([mosaic.id]).toPromise();
        } catch (e) {
            console.log(e);
        }
        return {
            mosaicId: mosaic.id.toHex(),
            mosaicName: mosaicName.names[0].name,
            amount: mosaic.amount.toString(),
            divisibility: mosaicInfo.divisibility,
        };
    }

    /**
     * Returns balance from a given Address and a node
     * @param rawAddress
     * @param network
     * @returns {Promise<number>}
     */
    static async getTransactionsFromAddress(rawAddress: string, network: NetworkModel): Promise<TransactionModel[]> {
        const transactionHttp = new TransactionHttp('http://api-01.us-east-1.0.10.0.x.symboldev.network:3000');
        const address = Address.createFromRawAddress(rawAddress);
        const confirmedSearchCriteria = { group: TransactionGroup.Confirmed, address, pageNumber: 1, pageSize: 100 };
        const partialSearchCriteria = { group: TransactionGroup.Partial, address, pageNumber: 1, pageSize: 100 };
        const unconfirmedSearchCriteria = { group: TransactionGroup.Unconfirmed, address, pageNumber: 1, pageSize: 100 };
        const [confirmedTransactions, partialTransactions, unconfirmedTransactions] = await Promise.all([
            transactionHttp.search(confirmedSearchCriteria).toPromise(),
            transactionHttp.search(partialSearchCriteria).toPromise(),
            transactionHttp.search(unconfirmedSearchCriteria).toPromise(),
        ]);
        const allTransactions = [
            ...unconfirmedTransactions.data,
            ...partialTransactions.data,
            ...confirmedTransactions.data.reverse(),
        ];
        return Promise.all(allTransactions.map(tx => this.symbolTransactionToTransactionModel(tx, network)));
    }

    /**
     * Transform a symbol account to an account Model
     * @returns {{privateKey: string, name: string, id: string, type: AccountOriginType}}
     * @param transaction
     * @param network
     */
    static async symbolTransactionToTransactionModel(transaction: Transaction, network: NetworkModel): Promise<TransactionModel> {
        let transactionModel: TransactionModel = {
            status: transaction.isConfirmed() ? 'confirmed' : 'unconfirmed',
            signerAddress: transaction.signer.address.pretty(),
            deadline: formatTransactionLocalDateTime(transaction.deadline.value),
            hash: transaction.transactionInfo.hash,
            fee: transaction.maxFee.toString(),
        };
        if (transaction instanceof TransferTransaction) {
            transactionModel = await this._populateTransferTransactionModel(transactionModel, transaction, network);
        } else if (transaction instanceof LockFundsTransaction) {
            transactionModel = await this._populateFundsLockTransactionModel(transactionModel, transaction, network);
        } else if (transaction instanceof AggregateTransaction) {
            transactionModel = await this._populateAggregateTransactionModel(transactionModel, transaction, network);
        }
        return transactionModel;
    }

    /**
     * Populates transfer transaction Model
     * @param transactionModel
     * @param transaction
     * @param network
     * @returns {Promise<void>}
     * @private
     */
    static async _populateTransferTransactionModel(
        transactionModel: TransactionModel,
        transaction: TransferTransaction,
        network: NetworkModel
    ): Promise<TransferTransactionModel> {
        const mosaicModels: MosaicModel[] = [];
        for (let mosaic of transaction.mosaics) {
            const mosaicModel = await this._getMosaicModelFromMosaicId(mosaic, network);
            mosaicModels.push(mosaicModel);
        }
        return {
            ...transactionModel,
            type: 'transfer',
            recipientAddress: transaction.recipientAddress.pretty(),
            messageText: transaction.message.message,
            messageEncrypted: transaction.message.type,
            mosaics: mosaicModels,
        };
    }

    /**
     * Populates funds lock Model
     * @param transactionModel
     * @param transaction
     * @param network
     * @returns {Promise<void>}
     * @private
     */
    static async _populateFundsLockTransactionModel(
        transactionModel: TransactionModel,
        transaction: LockFundsTransaction,
        network: NetworkModel
    ): Promise<FundsLockTransaction> {
        const mosaicModel = await this._getMosaicModelFromMosaicId(transaction.mosaic, network);
        return {
            ...transactionModel,
            type: 'fundsLock',
            mosaic: mosaicModel,
            duration: transaction.duration.compact(),
            aggregateHash: transaction.hash,
        };
    }

    /**
     * Populates aggregate transaction Model
     * @param transactionModel
     * @param transaction
     * @param network
     * @returns {Promise<void>}
     * @private
     */
    static async _populateAggregateTransactionModel(
        transactionModel: TransactionModel,
        transaction: AggregateTransaction,
        network: NetworkModel
    ): Promise<AggregateTransactionModel> {
        const transactionHttp = new TransactionHttp('http://api-01.us-east-1.0.10.0.x.symboldev.network:3000');
        const fullTransactionData = await transactionHttp
            .getTransaction(transaction.transactionInfo.id, transaction.isConfirmed() ? TransactionGroup.Confirmed : TransactionGroup.Partial)
            .toPromise();
        const innerTransactionModels = await Promise.all(
            fullTransactionData.innerTransactions.map(innerTx => this.symbolTransactionToTransactionModel(innerTx, network))
        );
        return {
            ...transactionModel,
            type: 'aggregate',
            innerTransactions: innerTransactionModels,
            cosignaturePublicKeys: transaction.cosignatures.map(cosignature => cosignature.signer.publicKey),
            signTransactionObject: transaction,
        };
    }
}
