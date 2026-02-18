"""
Compliance Checker Module
Checks user data against compliance regulations (AML, KYC, sanctions lists)
"""
import os
import logging
from typing import Dict, Any
from datetime import datetime

logger = logging.getLogger(__name__)

class ComplianceChecker:
    """Checks compliance with regulations"""
    
    def __init__(self):
        self.sanctioned_countries = ['KP', 'IR', 'SY', 'CU', 'SD']  # Example
        logger.info("Compliance Checker initialized")
    
    def check(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Check user data for compliance issues
        
        Args:
            user_data: User information including country, name, DOB, etc.
            
        Returns:
            Dictionary with result, confidence, and details
        """
        try:
            # In a real implementation, this would:
            # 1. Check against sanctions lists (OFAC, UN, EU)
            # 2. Verify age requirements (18+)
            # 3. Check PEP (Politically Exposed Person) lists
            # 4. Validate against watchlists
            # 5. Check country restrictions
            
            compliance_checks = self._perform_compliance_checks(user_data)
            
            issues = compliance_checks['issues']
            warnings = compliance_checks['warnings']
            
            if len(issues) > 0:
                result = 'fail'
                confidence = 0.3
            elif len(warnings) > 0:
                result = 'manual_review'
                confidence = 0.7
            else:
                result = 'pass'
                confidence = 0.95
            
            details = {
                'complianceIssues': issues,
                'warnings': warnings,
                'checksPerformed': {
                    'sanctionsCheck': 'sanctions' not in issues,
                    'ageVerification': 'age' not in issues,
                    'pepCheck': 'pep' not in warnings,
                    'countryCheck': 'country' not in issues,
                    'watchlistCheck': 'watchlist' not in warnings
                },
                'riskFactors': compliance_checks.get('riskFactors', [])
            }
            
            return {
                'result': result,
                'confidence': round(confidence, 4),
                'details': details
            }
            
        except Exception as e:
            logger.error(f"Compliance check failed: {str(e)}")
            return {
                'result': 'fail',
                'confidence': 0.0,
                'details': {'error': str(e)}
            }
    
    def _perform_compliance_checks(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Perform compliance checks (placeholder for actual API calls)
        In production: integrate with OFAC, WorldCheck, etc.
        """
        issues = []
        warnings = []
        risk_factors = []
        
        # Check country
        country = data.get('country', '').upper()
        if country in self.sanctioned_countries:
            issues.append('sanctions')
            risk_factors.append(f'User from sanctioned country: {country}')
        
        # Check age
        dob = data.get('dateOfBirth')
        if dob:
            try:
                if isinstance(dob, str):
                    dob_date = datetime.strptime(dob, '%Y-%m-%d')
                else:
                    dob_date = dob
                age = (datetime.now() - dob_date).days / 365.25
                if age < 18:
                    issues.append('age')
                    risk_factors.append('User under 18 years old')
            except:
                warnings.append('age_verification_failed')
        
        # Check for high-risk indicators
        if not data.get('address'):
            warnings.append('missing_address')
        
        # Simulate PEP check
        name = data.get('fullName', '').lower()
        if any(keyword in name for keyword in ['minister', 'president', 'senator']):
            warnings.append('pep')
            risk_factors.append('Possible Politically Exposed Person')
        
        return {
            'issues': issues,
            'warnings': warnings,
            'riskFactors': risk_factors
        }
