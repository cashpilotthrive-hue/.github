# financial_app_core.py

"""
This file outlines the foundational architecture for a global financial application.
The core principles of this design are:
1.  **Real-World Usability:** A seamless and intuitive user experience.
2.  **Global Banking Compliance:** Adherence to financial regulations in a user-friendly way.
3.  **Efficiency:** Fast, low-cost transactions of any size.
"""

# ==============================================================================
# Architectural Overview & Suggestions
# ==============================================================================

"""
### 1. Real-World Usability

The app's success depends on being incredibly easy to use.

-   **Seamless Onboarding:** Users should be able to create an account and start making
    small transactions in under a minute. Initial sign-up should only require a
    phone number or email, with further verification requested only when necessary
    (see Progressive KYC).
-   **Intuitive Interface:** The design should be clean and simple, with a clear focus
    on the core actions: viewing balance and sending money.
-   **Instant Balance Updates:** All transactions should reflect in the user's balance
    in real-time. This provides immediate feedback and builds trust.
-   **Generated Usable Balance:** The app will "generate" a balance for the user,
    which can be instantly used. This could be achieved through various means, such
    as promotional credits, rewards, or instant funding from a linked account. The
    key is that the user always has a clear, spendable balance.
-   **Global by Default:** The app should support multiple languages and display
    balances in the user's local currency, with transparent exchange rates.
"""

"""
### 2. Global Banking Compliance (with a User-First Approach)

While the goal is to avoid burdensome KYC, robust compliance is non-negotiable for
a legitimate financial service. The solution is to make compliance as frictionless
as possible.

-   **Progressive & Automated KYC (Know Your Customer):** Instead of a heavy,
    upfront identity verification process, we can use a tiered approach.
    -   **Tier 1 (Low Limit):** Allow users to transact small amounts (e.g., up to
        $100) with just a verified phone number or email. This provides a basic
        level of identity assurance for low-risk transactions.
    -   **Tier 2 (Medium Limit):** As transaction volume increases, the system can
        automatically request additional, easy-to-provide information (e.g., name
        and address). This data can be cross-referenced with public databases for a
        "soft" verification.
    -   **Tier 3 (High Limit):** For high-volume users, a streamlined ID verification
        (e.g., a quick selfie with an ID) can be triggered, handled by automated
        services like Stripe Identity or Veriff.
-   **AI-Powered Transaction Monitoring:** A core component for AML (Anti-Money
    Laundering) compliance. An AI system will monitor transactions in real-time to
    detect and flag suspicious patterns (e.g., unusual transaction sizes, high-risk
    destinations) without disrupting legitimate user activity.
-   **Regulatory Sandboxes:** The app could initially launch in "regulatory sandboxes"
    offered by some countries. These programs allow for testing innovative fintech
    products with relaxed regulatory oversight for a limited time, providing a clear
    path to full compliance.
"""

"""
### 3. Efficiency (Sending Any Amount of Money)

To be truly useful, the app must be able to send any amount of money quickly and
at a very low cost.

-   **Modern Payment Rails:** Avoid slow, expensive traditional banking networks.
    -   **Stablecoins:** Leverage stablecoins (e.g., USDC) on low-cost blockchain
        networks (e.g., Solana, Polygon). This allows for near-instant, global
        transactions for a fraction of a cent.
    -   **Domestic Instant Payment Systems:** Integrate with local instant payment
        networks (e.g., FedNow in the US, PIX in Brazil, UPI in India) to offer
        fast, free, or low-cost domestic transfers.
-   **Optimized Cross-Border Routing:** For international transfers, an intelligent
    routing system can automatically find the cheapest and fastest path. For example,
    a transfer from the US to Brazil could be routed through a stablecoin, converted
    to Brazilian Real, and settled via the PIX network, all in a matter of seconds.
-   **Pre-Funded Liquidity Pools:** Maintain liquidity pools in major currencies to
    ensure that transactions are never delayed by a lack of available funds. This
    is key to providing an "always on" service for instant transfers.
"""

# ==============================================================================
# Core Implementation
# ==============================================================================
import datetime

class User:
    def __init__(self, user_id, phone_number):
        self.user_id = user_id
        self.phone_number = phone_number
        self.wallet = Wallet(user_id)
        print(f"User {self.user_id} created with phone number {self.phone_number}.")

class Wallet:
    def __init__(self, user_id):
        self.user_id = user_id
        self.balance = 0.0
        self.transactions = []
        print(f"Wallet created for User {self.user_id} with initial balance: ${self.balance:.2f}.")

    def deposit(self, amount):
        if amount > 0:
            self.balance += amount
            self.transactions.append(f"DEPOSIT: +${amount:.2f} on {datetime.datetime.now()}")
            print(f"Deposited ${amount:.2f}. New balance: ${self.balance:.2f}.")
        else:
            print("Deposit amount must be positive.")

    def withdraw(self, amount):
        if 0 < amount <= self.balance:
            self.balance -= amount
            self.transactions.append(f"WITHDRAWAL: -${amount:.2f} on {datetime.datetime.now()}")
            print(f"Withdrew ${amount:.2f}. New balance: ${self.balance:.2f}.")
        else:
            print("Invalid withdrawal amount.")

    def get_balance(self):
        return self.balance

    def get_transaction_history(self):
        return self.transactions

class Transaction:
    def __init__(self, sender_wallet, receiver_wallet, amount):
        self.sender_wallet = sender_wallet
        self.receiver_wallet = receiver_wallet
        self.amount = amount
        self.timestamp = datetime.datetime.now()
        self.status = "PENDING"

    def execute(self):
        print(f"\nExecuting transaction of ${self.amount:.2f} from User {self.sender_wallet.user_id} to User {self.receiver_wallet.user_id}...")
        if self.sender_wallet.get_balance() >= self.amount:
            self.sender_wallet.withdraw(self.amount)
            self.receiver_wallet.deposit(self.amount)
            self.status = "COMPLETED"
            print(f"Transaction {self.status}.")
        else:
            self.status = "FAILED"
            print("Transaction FAILED: Insufficient funds.")

if __name__ == "__main__":
    print("\n--- Setting up Users and Wallets ---")
    user1 = User("user_001", "+1-555-001")
    user2 = User("user_002", "+1-555-002")

    print("\n--- Generating Usable Balance (e.g., promotional credit) ---")
    user1.wallet.deposit(100.00)

    print("\n--- Initiating a Transaction ---")
    transaction = Transaction(user1.wallet, user2.wallet, 25.50)
    transaction.execute()

    print("\n--- Verifying Balances ---")
    print(f"User {user1.user_id} final balance: ${user1.wallet.get_balance():.2f}")
    print(f"User {user2.user_id} final balance: ${user2.wallet.get_balance():.2f}")

    print("\n--- Reviewing Transaction History ---")
    print(f"User {user1.user_id} transactions: {user1.wallet.get_transaction_history()}")
    print(f"User {user2.user_id} transactions: {user2.wallet.get_transaction_history()}")
