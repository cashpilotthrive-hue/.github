import json
from datetime import datetime

class AAFSEthicsEngine:
    def __init__(self):
        # Ethical and Theological filters
        self.filters = {
            "BRI": ["addictive_substances", "predatory_lending", "unethical_labor"],
            "SHARIA": ["usury", "gambling", "non_tangible_speculation"],
            "ESG": ["fossil_fuels", "high_carbon_footprint", "governance_violations"]
        }

    def evaluate_investment(self, company_data):
        """
        Evaluates a company based on interdisciplinary ethical filters.
        Returns a tuple (is_approved, reason)
        """
        tags = company_data.get("tags", [])
        name = company_data.get("name", "Unknown")

        # Check against BRI
        for tag in tags:
            if tag in self.filters["BRI"]:
                return False, f"Rejected by BRI Filter: {tag.replace('_', ' ').capitalize()}."

        # Check against SHARIA
        for tag in tags:
            if tag in self.filters["SHARIA"]:
                return False, f"Rejected by Sharia Filter: {tag.replace('_', ' ').capitalize()}."

        # Check against ESG
        for tag in tags:
            if tag in self.filters["ESG"]:
                return False, f"Rejected by ESG Filter: {tag.replace('_', ' ').capitalize()}."

        return True, "Approved for autonomous investment."

def main():
    engine = AAFSEthicsEngine()

    # Mock financial data (companies and their ethical 'tags')
    mock_data = [
        {"name": "GreenPower Inc.", "tags": ["renewable_energy", "esg_compliant"], "roi_potential": 8.5},
        {"name": "QuickLoan Ltd.", "tags": ["predatory_lending", "high_interest"], "roi_potential": 15.0},
        {"name": "CleanTech Solutions", "tags": ["carbon_capture"], "roi_potential": 6.2},
        {"name": "BetWorld", "tags": ["gambling", "sharia_non_compliant"], "roi_potential": 12.0},
        {"name": "OldEnergy Corp.", "tags": ["fossil_fuels"], "roi_potential": 9.1}
    ]

    print(f"--- AAFS Ethical Decision Engine Prototype ---")
    print(f"Timestamp: {datetime.now().isoformat()}\n")

    for company in mock_data:
        is_approved, reason = engine.evaluate_investment(company)
        status = "✅ APPROVED" if is_approved else "❌ REJECTED"
        print(f"Investment: {company['name']}")
        print(f"ROI Potential: {company['roi_potential']}%")
        print(f"Status: {status}")
        print(f"Reason: {reason}\n")

if __name__ == "__main__":
    main()
