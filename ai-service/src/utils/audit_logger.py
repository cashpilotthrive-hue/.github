"""
Audit Logger Utility
Logs AI verification decisions for audit trail
"""
import logging
from typing import Dict, Any
from datetime import datetime

logger = logging.getLogger(__name__)

class AuditLogger:
    """Logs AI verification activities for audit purposes"""
    
    def __init__(self):
        self.logger = logging.getLogger('audit')
        handler = logging.FileHandler('audit.log')
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        handler.setFormatter(formatter)
        self.logger.addHandler(handler)
        self.logger.setLevel(logging.INFO)
    
    def log_verification(
        self,
        kyc_id: int,
        verification_type: str,
        result: Dict[str, Any],
        processing_time: int
    ):
        """
        Log a verification event
        
        Args:
            kyc_id: KYC document ID
            verification_type: Type of verification performed
            result: Verification result dictionary
            processing_time: Time taken in milliseconds
        """
        log_entry = {
            'timestamp': datetime.utcnow().isoformat(),
            'kycId': kyc_id,
            'verificationType': verification_type,
            'result': result.get('result'),
            'confidence': result.get('confidence'),
            'processingTimeMs': processing_time,
            'details': result.get('details', {})
        }
        
        self.logger.info(f"Verification: {log_entry}")
        logger.info(f"Logged verification for KYC #{kyc_id}: {verification_type} - {result.get('result')}")
    
    def log_error(self, kyc_id: int, error: str):
        """Log an error event"""
        log_entry = {
            'timestamp': datetime.utcnow().isoformat(),
            'kycId': kyc_id,
            'error': error
        }
        self.logger.error(f"Error: {log_entry}")
