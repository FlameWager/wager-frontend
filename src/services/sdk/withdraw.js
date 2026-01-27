/**
 * Withdraw winnings from events
 */
import { flameWager } from "@sdk"

/**
 * Withdraw winnings from a single event
 * @param {number} eventId - The event ID to withdraw from
 * @returns {Promise<ethers.TransactionResponse>}
 */
export const withdraw = async (eventId) => {
    if (!flameWager.contracts.core) {
        throw new Error("Contract not initialized. Please connect wallet first.")
    }

    const tx = await flameWager.contracts.core.withdraw(eventId)
    return tx
}

/**
 * Withdraw winnings from multiple events in a single transaction
 * @param {number[]} eventIds - Array of event IDs to withdraw from
 * @returns {Promise<ethers.TransactionResponse>}
 */
export const withdrawAll = async (eventIds) => {
    if (!flameWager.contracts.core) {
        throw new Error("Contract not initialized. Please connect wallet first.")
    }

    if (!eventIds || eventIds.length === 0) {
        throw new Error("No event IDs provided")
    }

    const tx = await flameWager.contracts.core.withdrawMultiple(eventIds)
    return tx
}